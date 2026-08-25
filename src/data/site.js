/* Подборки для лендинга + мок текущего пользователя (заглушка авторизации) */

export const COLLECTIONS = [
  {
    id: 'music',
    title: 'Концерты и живая музыка',
    categories: ['Музыка и концерты', 'Театр и кино'],
    image: 'concert',
  },
  {
    id: 'family',
    title: 'Семейные мастер-классы',
    categories: ['Творчество и хобби', 'Кулинария и еда', 'Ремёсла и народное творчество', 'Для детей'],
    image: 'art',
  },
  {
    id: 'nature',
    title: 'Летний отдых на природе',
    categories: ['Здоровье и саморазвитие', 'Движение и спорт', 'Природа и активный отдых'],
    image: 'yoga',
  },
]

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
