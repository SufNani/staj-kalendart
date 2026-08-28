/* Ручки событий, справочников и записей. Сверено со Swagger.

   GET  /api/event/            ?age&available_places&tag_id&city&date&date_from&date_to&price_to&limit&offset
                                -> {count, results: [событие]}
   GET  /api/event/{id}        -> событие
   GET  /api/event/org_events  ?limit&offset  (нужен токен) -> {count, results: [событие]} — события организатора
   GET  /api/event/cities      -> [строка]
   POST /api/event/            <- {name, description, image_url, city, location,
                                    available_places, age, tag_id, event_dates[], event_tariffs[]}
   PUT  /api/event/{id}        <- то же тело, что и POST
   DELETE /api/event/delete/{id}
   GET  /api/tags/             -> [{id, name}]
   GET  /api/collections/      -> {count, results: [{id, title, description, image_url, events[]}]}
   POST /api/purchases/            <- {event_id, tariff_id, event_date_id}              (нужен токен)
   POST /api/purchases/reg-purchase <- {user:{name, phone}, purchase:{...}}             (без токена — гостевая запись)
   GET  /api/purchases/my      -> [запись]                                              (нужен токен)
*/

import { api, API_BASE } from './client'
import { ENDPOINTS } from './endpoints'
import { eventFromApi, eventToApi, collectionFromApi, purchaseFromApi } from './mappers'

function listFrom(data) {
  if (Array.isArray(data)) return data
  return data?.results || data?.items || data?.data || []
}

/* --- справочники (кэшируются на время сессии — редко меняются) --- */

let tagsCache = null
export async function fetchTags() {
  if (tagsCache) return tagsCache
  const data = await api.get(ENDPOINTS.tags, { auth: false })
  tagsCache = listFrom(data).map((t) => ({ id: t.id, name: t.name }))
  return tagsCache
}

let citiesCache = null
export async function fetchCities() {
  if (citiesCache) return citiesCache
  const data = await api.get(ENDPOINTS.eventCities, { auth: false })
  citiesCache = listFrom(data)
  return citiesCache
}

/** Название категории -> tag_id (бэкенд фильтрует и создаёт события по id тега). */
async function resolveTagId(categoryName) {
  if (!categoryName) return null
  const tags = await fetchTags().catch(() => [])
  const found = tags.find(
    (t) => String(t.name).toLowerCase() === String(categoryName).toLowerCase()
  )
  return found ? found.id : null
}

/* --- список / карточка события --- */

/**
 * Список событий (каталог).
 * filters: { category, city, date, dateFrom, dateTo, priceTo, age, availablePlaces, limit, offset }
 */
export async function fetchEvents(filters = {}) {
  const tagId = filters.category ? await resolveTagId(filters.category) : null
  const params = {
    tag_id: tagId,
    city: filters.city || null,
    date: filters.date || null,
    date_from: filters.dateFrom || null,
    date_to: filters.dateTo || null,
    price_to: filters.priceTo || null,
    age: filters.age || null,
    available_places: filters.availablePlaces || null,
    limit: filters.limit || null,
    offset: filters.offset || null,
  }
  const data = await api.get(ENDPOINTS.events, { auth: false, params })
  return listFrom(data).map(eventFromApi).filter(Boolean)
}

export async function fetchEvent(id) {
  return eventFromApi(await api.get(ENDPOINTS.event(id), { auth: false }))
}

/** События текущего организатора (нужен токен). */
export async function fetchMyOrgEvents({ limit, offset } = {}) {
  const data = await api.get(ENDPOINTS.orgEvents, { params: { limit, offset } })
  return listFrom(data).map(eventFromApi).filter(Boolean)
}

/* --- создание / изменение / удаление --- */

/**
 * Если форма уже прислала настоящий tagId (выбран из живого списка
 * с сервера — так теперь работает CreateEventPage) — используем его
 * напрямую. Сопоставление по имени (resolveTagId) остаётся как
 * подстраховка для случаев, когда tagId не пришёл.
 */
async function pickTagId(form) {
  if (form.tagId !== undefined && form.tagId !== null && form.tagId !== '') {
    return Number(form.tagId)
  }
  return resolveTagId(form.category)
}

export async function createEvent(form) {
  const tagId = await pickTagId(form)
  return eventFromApi(await api.post(ENDPOINTS.events, eventToApi(form, tagId)))
}

export async function updateEvent(id, form) {
  const tagId = await pickTagId(form)
  return eventFromApi(await api.put(ENDPOINTS.event(id), eventToApi(form, tagId)))
}

export async function deleteEvent(id) {
  await api.del(ENDPOINTS.eventDelete(id))
}

/* --- записи на события --- */

/** Запись авторизованного пользователя. */
export async function createPurchase({ eventId, tariffId, eventDateId }) {
  return purchaseFromApi(
    await api.post(ENDPOINTS.purchases, {
      event_id: eventId,
      tariff_id: tariffId,
      event_date_id: eventDateId,
    })
  )
}

/** Гостевая запись — без регистрации, только имя и телефон. */
export async function createGuestPurchase({ eventId, tariffId, eventDateId, name, phone }) {
  return purchaseFromApi(
    await api.post(
      ENDPOINTS.guestPurchase,
      {
        user: { name, phone },
        purchase: { event_id: eventId, tariff_id: tariffId, event_date_id: eventDateId },
      },
      { auth: false }
    )
  )
}

export async function fetchMyPurchases() {
  const data = await api.get(ENDPOINTS.myPurchases)
  return listFrom(data).map(purchaseFromApi)
}

/* --- подборки --- */

export async function fetchCollections() {
  const data = await api.get(ENDPOINTS.collections, { auth: false })
  return listFrom(data).map(collectionFromApi)
}

/* --- загрузка файла (обложка события, логотип студии) ---
   POST /api/media/ — точная схема в спеке не расписана (какое имя
   поля ждёт форма, что именно возвращает ответ). Сделано по обычному
   для таких ручек стандарту: multipart/form-data, поле "file".
   Из ответа берём первое похожее на ссылку поле — если бэкенд
   называет иначе, будет видно по первой же реальной попытке
   (в консоли останется тело ответа), поправим один разбор здесь. */
export async function uploadMedia(file) {
  const body = new FormData()
  body.append('file', file)
  const data = await api.post(ENDPOINTS.media, body)
  const url =
    data?.url || data?.file_url || data?.path || data?.filename || data?.location
  if (!url) {
    console.warn('Не удалось найти ссылку в ответе /api/media/ — вот что пришло:', data)
    throw new Error('Сервер загрузил файл, но не вернул ссылку на него (см. консоль).')
  }
  // если сервер вернул относительный путь — достраиваем через адрес API
  // (не через адрес фронта — в проде это разные домены)
  return url.startsWith('http') ? url : `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`
}
