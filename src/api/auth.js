/* Ручки пользователей. Сверено со Swagger (полная выгрузка).

   POST /api/users/reg    {name, phone, password, user_type, social_id?} -> {access_token, token_type}
   POST /api/users/login  {phone, password}                              -> {access_token, token_type}
   GET  /api/users/profile                                                -> {id, name, phone, user_type, ...}
   POST /api/users/logout
   DELETE /api/users
*/

import { api, setToken, clearToken } from './client'
import { ENDPOINTS, USER_TYPE } from './endpoints'
import { userFromApi, tokenFromApi, profilePatchToApi } from './mappers'

/** Регистрация. form: { name, phone, password, role: 'client'|'organizer' } */
export async function register(form) {
  const data = await api.post(
    ENDPOINTS.register,
    {
      name: form.name?.trim() || '',
      phone: form.phone?.trim(),
      password: form.password,
      user_type: form.role === 'organizer' ? USER_TYPE.organizer : USER_TYPE.client,
    },
    { auth: false }
  )
  const token = tokenFromApi(data)
  if (!token) throw new Error('Сервер не вернул токен при регистрации.')
  setToken(token)
  return { user: await fetchMe(), token }
}

/** Вход. form: { phone, password } */
export async function login(form) {
  const data = await api.post(
    ENDPOINTS.login,
    { phone: form.phone?.trim(), password: form.password },
    { auth: false }
  )
  const token = tokenFromApi(data)
  if (!token) throw new Error('Сервер не вернул токен.')
  setToken(token)
  return { user: await fetchMe(), token }
}

/** Профиль текущего пользователя. */
export async function fetchMe() {
  return userFromApi(await api.get(ENDPOINTS.profile))
}

/** Теги, отмеченные пользователем как интересные. */
export async function fetchPreferredTags() {
  const data = await api.get(ENDPOINTS.preferredTags)
  return Array.isArray(data) ? data.map((t) => ({ id: t.id, name: t.name })) : []
}

/** Выход. */
export async function logout() {
  try {
    await api.post(ENDPOINTS.logout)
  } catch {
    /* даже если ручка ответила ошибкой — локально разлогиниваем */
  }
  clearToken()
}

/** Удаление аккаунта. */
export async function deleteAccount() {
  await api.del(ENDPOINTS.deleteAccount)
  clearToken()
}

/* --- подтверждение телефона по SMS ---
   POST /api/sms_code/send   {phone_number}         -> {session_id, sms_code, end_date}
   POST /api/sms_code/verify {sms_code, session_id} -> {response}
   ⚠️ send возвращает код прямо в ответе — дыра безопасности, отдельно
   сказать бэкендерам. Пока к экранам не подключено. */

export async function sendSmsCode(phoneNumber) {
  return api.post(ENDPOINTS.smsSend, { phone_number: phoneNumber }, { auth: false })
}
export async function verifySmsCode(sessionId, smsCode) {
  return api.post(ENDPOINTS.smsVerify, { session_id: sessionId, sms_code: smsCode }, { auth: false })
}

/* --- обновление профиля (28.08.2026: ручка появилась) ---
   PATCH /api/users/profile
   <- { name?, phone?, city?, studio_name?, description?, studio_logo?,
        instagram?, telegram?, vkontakte? }
   -> полный профиль (та же схема, что и GET)

   Анкета студии организатора приехала прямо сюда, отдельная ручка
   /api/socials/ (max_url/vk_url) для этого больше не нужна. */
export async function updateProfile(patch) {
  return userFromApi(await api.patch(ENDPOINTS.profileUpdate, profilePatchToApi(patch)))
}
