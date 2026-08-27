/* Подборки для лендинга формируются автоматически по категориям —
   см. buildCollections() в data/events.js. Мок текущего пользователя
   (заглушка авторизации) — ниже. */

export const INTERESTS = ['Музыка', 'Искусство', 'Технологии', 'Бизнес', 'Спорт']

// Заглушка сессии пользователя (в MVP авторизация — на фронте, без бэкенда)
export const CURRENT_USER = {
  name: 'Иван Петров',
  email: 'ivanpetrov@mail.ru',
  initials: 'ИП',
  role: 'client', // 'client' | 'organizer'
  interests: ['Музыка', 'Искусство', 'Технологии'],
  // события, на которые записан клиент
  bookedEventIds: [10, 11, 12],
}

// Организатор — для кабинета организатора
export const ORGANIZER = {
  name: 'Иван Иванов',
  email: 'ivanov@mail.ru',
  initials: 'ИИ',
  project: 'Гончарная мастерская «art day»',
  // события организатора со статусами
  events: [
    { id: 4, status: 'published' },
    { id: 6, status: 'published' },
    { id: 9, status: 'draft' },
    { id: 2, status: 'done' },
  ],
}

export const STATUS_LABEL = {
  published: 'Опубликовано',
  draft: 'Черновик',
  done: 'Завершено',
}
