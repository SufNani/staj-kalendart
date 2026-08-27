/* ============================================================
   ВСЕ адреса ручек — в одном месте.
   Сверено со Swagger (полная выгрузка, 27 ручек, август 2026).

   Хорошая новость: теперь ВСЁ (включая purchases) под единым
   префиксом /api — отдельный проброс для /purchases не нужен.
   ============================================================ */

export const ENDPOINTS = {
  // --- пользователи ---
  register: '/api/users/reg',
  login: '/api/users/login',
  logout: '/api/users/logout',
  profile: '/api/users/profile',
  // Подтверждено бэкендерами (28.08): PATCH — анкета студии организатора
  // (studio_name, description, studio_logo, instagram, telegram, vkontakte)
  // теперь тоже здесь, отдельная ручка /api/socials/ для этого не нужна.
  profileUpdate: '/api/users/profile',
  preferredTags: '/api/users/profile/preferred_tags',
  deleteAccount: '/api/users',

  // --- подтверждение телефона ---
  smsSend: '/api/sms_code/send',
  smsVerify: '/api/sms_code/verify',

  // --- события ---
  events: '/api/event/',
  event: (id) => `/api/event/${id}`,
  eventDelete: (id) => `/api/event/delete/${id}`,
  eventCities: '/api/event/cities',
  orgEvents: '/api/event/org_events', // события текущего организатора

  // --- справочники ---
  tags: '/api/tags/',
  collections: '/api/collections/',
  collection: (id) => `/api/collections/${id}`,

  // --- записи ---
  purchases: '/api/purchases/',
  myPurchases: '/api/purchases/my',
  guestPurchase: '/api/purchases/reg-purchase', // запись без регистрации

  // --- медиа и соцсети организатора ---
  media: '/api/media/',
  mediaFile: (filename) => `/api/media/${filename}`,
  // Для анкеты студии не используется (см. profileUpdate выше) — судя
  // по всему, это для привязки VK/MAX к аккаунту (vk_linked_id и т.п.),
  // не подключено, назначение уточнить у бэкендеров при необходимости.
  socials: '/api/socials/',

  // --- уведомления ---
  botTestNotify: '/api/bots/test-notify',
}

/**
 * Значения роли (user_type) при регистрации.
 * Подтверждено бэкендерами: участник — "mem", организатор — "org".
 */
export const USER_TYPE = {
  client: 'mem',
  organizer: 'org',
}
