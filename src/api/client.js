/* ============================================================
   HTTP-клиент: базовый адрес, токен, разбор ошибок FastAPI.
   Все запросы идут через него — единое место для заголовков
   и обработки ошибок.
   ============================================================ */

// Пути в endpoints.js уже содержат /api, поэтому здесь — только
// корень. Пусто = свой origin + прокси Vite (см. vite.config.js).
export const API_BASE = import.meta.env.VITE_API_URL ?? ''

const TOKEN_KEY = 'kalendart:token'

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}
export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* приватный режим — игнорируем */
  }
}
export function clearToken() {
  setToken(null)
}

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

/** FastAPI отдаёт {detail: "текст"} или {detail: [{loc, msg}]} */
function readErrorMessage(data, status) {
  if (!data) return `Ошибка сервера (${status})`
  const d = data.detail ?? data.message ?? data.error
  if (typeof d === 'string') return d
  if (Array.isArray(d) && d[0]?.msg) {
    const loc = d[0].loc
    const field = Array.isArray(loc) ? loc[loc.length - 1] : ''
    return field ? `${field}: ${d[0].msg}` : d[0].msg
  }
  if (status === 401) return 'Неверный телефон или пароль.'
  if (status === 403) return 'Недостаточно прав.'
  if (status === 404) return 'Не найдено.'
  return `Ошибка сервера (${status})`
}

function buildUrl(path, params) {
  const url = `${API_BASE}${path}`
  if (!params) return url
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== null && v !== undefined && v !== '')
  ).toString()
  return qs ? `${url}?${qs}` : url
}

async function request(path, { method = 'GET', body, params, auth = true } = {}) {
  const headers = {}
  const token = auth ? getToken() : null
  if (token) headers.Authorization = `Bearer ${token}`

  let payload
  if (body instanceof FormData) {
    payload = body // multipart — Content-Type проставит браузер
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  let res
  try {
    res = await fetch(buildUrl(path, params), { method, headers, body: payload })
  } catch {
    throw new ApiError('Сервер недоступен. Проверьте подключение.', 0, null)
  }

  if (res.status === 204) return null

  const isJson = (res.headers.get('content-type') || '').includes('application/json')
  const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null)

  if (!res.ok) {
    if (res.status === 401) clearToken()
    throw new ApiError(readErrorMessage(data, res.status), res.status, data)
  }
  return data
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
  del: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
}
