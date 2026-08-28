/* ============================================================
   Мок-данные каталога.
   Бэкенда нет — это заглушка. Поле `image` пустое: реальные
   обложки придут с API, а пока рендерится тематический
   градиент (см. компонент Cover).
   ============================================================ */



import painting from "../assets/events/painting.png";
import desserts from "../assets/events/desserts.png";
import yoga from "../assets/events/yoga.png";
import pottery from "../assets/events/pottery.png";
import film from "../assets/events/film.png";
import dance from "../assets/events/dance.png";
import books from "../assets/events/books.png";
import concert from "../assets/events/concert.png";
import candles from "../assets/events/candles.png";
import festival from "../assets/events/festival.png";
import conference from "../assets/events/conference.png";
import art from "../assets/events/art.png";

// Карта картинок по имени — используется в подборках на лендинге
export const EVENT_IMAGES = {
  painting, desserts, yoga, pottery, film, dance,
  books, concert, candles, festival, conference, art,
};



// Категории — из выпадающего меню «Категория» в макете

export const CATEGORIES = [
  'Творчество и хобби',
  'Кулинария и еда',
  'Здоровье и саморазвитие',
  'Движение и спорт',
  'Музыка и концерты',
  'Образование и лекции',
  'Природа и активный отдых',
  'Технологии и цифровое творчество',
  'Ремёсла и народное творчество',
  'Театр и кино',
  'Искусство и культура',
  'Интеллектуальные игры',
  'Бизнес',
  'Для детей',
]

// Города — из выпадающего меню «Город»
export const CITIES = [
  'Москва',
  'Санкт-Петербург',
  'Ижевск',
  'Томск',
  'Казань',
  'Екатеринбург',
  'Краснодар',
  'Сочи',
  'Владивосток',
  'Омск',
  'Красноярск',
  'Онлайн',
]

// Ценовые диапазоны — из выпадающего меню «Цена»
export const PRICE_RANGES = [
  { id: 'free', label: 'Бесплатно', max: 0 },
  { id: '500', label: 'До 500 ₽', max: 500 },
  { id: '1000', label: 'До 1 000 ₽', max: 1000 },
  { id: '3000', label: 'До 3 000 ₽', max: 3000 },
  { id: '5000', label: 'До 5 000 ₽', max: 5000 },
  { id: 'any', label: 'Любая цена', max: Infinity },
]

// Тематические градиенты для обложек-заглушек (без неона, из палитры)
const COVERS = [
  ['#c8a86b', '#8a6f3e'],
  ['#a98bc0', '#6a4e9c'],
  ['#7fa88c', '#4c7a5e'],
  ['#c98f7a', '#9c5a48'],
  ['#8a9bc0', '#4e5c9c'],
  ['#c0a88a', '#8a6a4e'],
  ['#b58bc0', '#7c4e9c'],
  ['#c0b06b', '#8a7a3e'],
]

export function coverFor(category) {
  let hash = 0
  for (let i = 0; i < category.length; i++) hash = (hash * 31 + category.charCodeAt(i)) | 0
  return COVERS[Math.abs(hash) % COVERS.length]
}

export function priceLabel(price) {
  return price === 0 ? 'Бесплатно' : `${price.toLocaleString('ru-RU')} ₽`
}

const s = (id, label, dayLabel, timeLabel, free, total) => ({
  id,
  label,
  dayLabel,
  timeLabel,
  free,
  total,
})

export const EVENTS = [
  {
    id: 1,
    image: painting,
    slug: 'risovanie-interernyh-kartin',
    title: 'Мастер-класс по рисованию интерьерных картин',
    org: 'Арт-угол',
    orgInitials: 'АУ',
    category: 'Творчество и хобби',
    city: 'Санкт-Петербург',
    address: 'ул. Рубинштейна, 12',
    dateLabel: '18 июня',
    timeLabel: 'с 11:00 до 14:00',
    date: '2026-06-18',
    price: 2500,
    age: '16+',
    description:
      'Напишем абстрактную картину для интерьера с нуля. Все материалы включены, опыт не нужен — покажем базовые техники работы с акрилом и композицией. Готовую работу забираете с собой.',
    sessions: [
      s('1a', 'через неделю', '18 июня, чт', '11:00', 10, 15),
      s('1b', 'через 3 недели', '2 июля, чт', '11:00', 20, 2),
      s('1c', 'через месяц', '16 июля, чт', '11:00', 0, 30),
    ],
  },
  {
    id: 2,
    image: desserts,
    slug: 'poleznye-deserty',
    title: 'Учимся печь полезные десерты',
    org: 'Сладкий домик',
    orgInitials: 'СД',
    category: 'Кулинария и еда',
    city: 'Краснодар',
    address: 'ул. Красная, 45',
    dateLabel: '17 июня',
    timeLabel: 'с 18:30 до 21:30',
    date: '2026-06-17',
    price: 1800,
    age: '16+',
    description:
      'Печём десерты без сахара и глютена: чизкейк на финиках, овсяное печенье и шоколадные трюфели. Разбираем замены продуктов и уносим готовые сладости домой.',
    sessions: [
      s('2a', 'через неделю', '17 июня, ср', '18:30', 6, 8),
      s('2b', 'через 2 недели', '1 июля, ср', '18:30', 8, 6),
    ],
  },
  {
    id: 3,
    slug: 'utrennyaya-yoga',
    image: yoga,
    title: 'Утренняя йога на берегу с чаепитием',

    org: 'Дыхание и спокойствие',
    orgInitials: 'ДС',
    category: 'Здоровье и саморазвитие',
    city: 'Сочи',
    address: 'наб. Ривьера, 1',
    dateLabel: '22 июня',
    timeLabel: 'с 08:00 до 11:00',
    date: '2026-06-22',
    price: 0,
    age: '16+',
    description:
      'Мягкая практика на рассвете у моря: дыхание, растяжка и медитация. После занятия — травяной чай и знакомство с участниками. Коврики предоставляем.',
    sessions: [
      s('3a', 'через неделю', '22 июня, пн', '08:00', 12, 3),
      s('3b', 'через 3 недели', '6 июля, пн', '08:00', 15, 0),
    ],
  },
  {
    id: 4,
    slug: 'lepka-iz-gliny',
    image: pottery,
    title: 'Мастер-класс по лепке из глины (создаём чашку)',
    org: 'Гончарная мастерская «art day»',
    orgInitials: 'ГМ',
    category: 'Ремёсла и народное творчество',
    city: 'Москва',
    address: 'ул. Тимура Фрунзе, 11',
    dateLabel: '25 июня',
    timeLabel: 'с 18:00 до 21:00',
    date: '2026-06-25',
    price: 3200,
    age: '16+',
    description:
      'Сделаем чашку на гончарном круге под руководством мастера. Обжиг и глазуровку берём на себя — готовое изделие можно забрать через неделю.',
    sessions: [
      s('4a', 'через неделю', '25 июня, ср', '18:00', 4, 6),
      s('4b', 'через 2 недели', '9 июля, ср', '18:00', 6, 4),
    ],
  },
  {
    id: 5,
    image: film,
    slug: 'kinovecher',
    title: 'Киновечер: фильм + уютные разговоры',
    org: 'Киноклуб «НОЧЬ КИНО»',
    orgInitials: 'НК',
    category: 'Театр и кино',
    city: 'Томск',
    address: 'пр. Ленина, 36',
    dateLabel: '29 июня',
    timeLabel: 'с 19:30 до 22:00',
    date: '2026-06-29',
    price: 500,
    age: '16+',
    description:
      'Смотрим авторское кино на большом экране, а потом обсуждаем за чаем. Атмосфера камерная — приходите одни или с друзьями.',
    sessions: [s('5a', 'через неделю', '29 июня, пн', '19:30', 18, 12)],
  },
  {
    id: 6,
    image: dance,
    slug: 'tancevalnyy-intensiv',
    title: 'Танцевальный интенсив (контемпорари)',
    org: 'Dance academy',
    orgInitials: 'DA',
    category: 'Движение и спорт',
    city: 'Казань',
    address: 'ул. Баумана, 58',
    dateLabel: '1–5 июля',
    timeLabel: 'с 18:00 до 20:00',
    date: '2026-07-01',
    price: 4500,
    age: '16+',
    description:
      'Пятидневный интенсив по современной хореографии: работа с телом, импровизация и постановка небольшого номера. Для любого уровня подготовки.',
    sessions: [
      s('6a', 'поток в июле', '1–5 июля', '18:00', 5, 20),
      s('6b', 'поток в августе', '5–9 августа', '18:00', 25, 0),
    ],
  },
  {
    id: 7,
    image: books,
    slug: 'knizhnyy-klub',
    title: 'Читаем и обсуждаем современную прозу',
    org: 'Книжный клуб «BOOKS»',
    orgInitials: 'BK',
    category: 'Образование и лекции',
    city: 'Владивосток',
    address: 'ул. Светланская, 29',
    dateLabel: '7 июля',
    timeLabel: 'с 19:00 до 21:00',
    date: '2026-07-07',
    price: 0,
    age: '16+',
    description:
      'Встреча книжного клуба: обсуждаем современный роман, делимся впечатлениями и советуем друг другу книги. Читать заранее не обязательно.',
    sessions: [s('7a', 'через неделю', '7 июля, вт', '19:00', 14, 6)],
  },
  {
    id: 8,
    image: concert,
    slug: 'zhivoy-zvuk-koncert',
    title: 'Концерт живой музыки на открытом воздухе',
    org: 'Живой звук',
    orgInitials: 'ЖЗ',
    category: 'Музыка и концерты',
    city: 'Омск',
    address: 'парк «Зелёный остров»',
    dateLabel: '15 июля',
    timeLabel: 'с 20:00 до 23:00',
    date: '2026-07-15',
    price: 1200,
    age: '16+',
    description:
      'Вечер живой музыки под открытым небом: инди, соул и немного джаза. Берите плед и хорошее настроение — остальное за нами.',
    sessions: [s('8a', 'через 2 недели', '15 июля, ср', '20:00', 60, 40)],
  },
  {
    id: 9,
    image: candles,
    slug: 'svechi-iz-voska',
    title: 'Создаём свечи из натурального воска',
    org: 'Свет и воск',
    orgInitials: 'СВ',
    category: 'Ремёсла и народное творчество',
    city: 'Красноярск',
    address: 'ул. Мира, 10',
    dateLabel: '23 июля',
    timeLabel: 'с 16:00 до 19:00',
    date: '2026-07-23',
    price: 1500,
    age: '16+',
    description:
      'Сделаем ароматические свечи из соевого и пчелиного воска: выбираем аромат, цвет и форму. Уносим две свечи собственного изготовления.',
    sessions: [
      s('9a', 'через 3 недели', '23 июля, чт', '16:00', 8, 4),
      s('9b', 'через месяц', '6 августа, чт', '16:00', 12, 0),
    ],
  },
  {
    id: 10,
    image: festival,
    slug: 'muzykalnyy-festival',
    title: 'Музыкальный фестиваль',
    org: 'Сад «Эрмитаж»',
    orgInitials: 'СЭ',
    category: 'Музыка и концерты',
    city: 'Москва',
    address: 'Сад «Эрмитаж»',
    dateLabel: '15 сентября',
    timeLabel: 'с 18:00',
    date: '2026-09-15',
    price: 3000,
    age: '16+',
    description:
      'Приглашаем на главное музыкальное событие лета! Живая музыка, лучшие артисты и незабываемая атмосфера.',
    sessions: [s('10a', 'основная дата', '15 сентября, вт', '18:00', 119, 300)],
  },
  {
    id: 11,
    image: conference, 
    slug: 'biznes-konferenciya',
    title: 'Бизнес-конференция',
    org: 'Технопарк',
    orgInitials: 'ТП',
    category: 'Бизнес',
    city: 'Москва',
    address: 'Технопарк',
    dateLabel: '10 октября',
    timeLabel: 'с 10:00',
    date: '2026-10-10',
    price: 5000,
    age: '16+',
    description:
      'Практическая конференция для предпринимателей: выступления спикеров, нетворкинг и разбор реальных кейсов.',
    sessions: [s('11a', 'основная дата', '10 октября, сб', '10:00', 40, 160)],
  },
  {
    id: 12,
    image: art,
    slug: 'art-vecherinka',
    title: 'Арт-вечеринка',
    org: 'Арт пространство',
    orgInitials: 'АП',
    category: 'Искусство и культура',
    city: 'Москва',
    address: 'Арт пространство',
    dateLabel: '22 июня',
    timeLabel: 'с 16:00',
    date: '2026-06-22',
    price: 800,
    age: '16+',
    description:
      'Творческий вечер с рисованием, музыкой и общением. Приходите за вдохновением и новыми знакомствами.',
    sessions: [s('12a', 'основная дата', '22 июня, пн', '16:00', 30, 20)],
  },
]

export function findEvent(slug) {
  return EVENTS.find((e) => e.slug === slug)
}

/* ============================================================
   Хелперы для создания нового события организатором.
   (Пока без бэкенда — собираем объект на клиенте.)
   ============================================================ */

const TRANSLIT = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
  и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch',
  ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
}

export function slugify(str) {
  const base = (str || '')
    .toLowerCase()
    .split('')
    .map((ch) => (ch in TRANSLIT ? TRANSLIT[ch] : ch))
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return base || 'event'
}

const MONTHS_GEN = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
]
const DOW_SHORT = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб']

/** "2026-06-25" -> "25 июня" */
export function formatDateLabel(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  return `${d} ${MONTHS_GEN[m - 1] || ''}`
}

/** "2026-06-25" -> "25 июня, ср" */
export function formatDayLabel(iso) {
  if (!iso) return ''
  const dt = new Date(iso + 'T00:00:00')
  return `${formatDateLabel(iso)}, ${DOW_SHORT[dt.getDay()]}`
}

/** "18:00" + длительность (часы) -> "с 18:00 до 21:00" */
export function formatTimeRange(time, durationHours) {
  if (!time) return ''
  const d = Number(durationHours)
  if (!d) return `в ${time}`
  const [h, min] = time.split(':').map(Number)
  const end = new Date(2000, 0, 1, h, min)
  end.setMinutes(end.getMinutes() + Math.round(d * 60))
  const pad = (n) => String(n).padStart(2, '0')
  return `с ${time} до ${pad(end.getHours())}:${pad(end.getMinutes())}`
}

function initialsFrom(name) {
  const words = (name || '')
    .replace(/[«»"'()]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
  return (words.slice(0, 2).map((w) => w[0]).join('') || 'КА').toUpperCase()
}

/**
 * Собирает полный объект события из данных формы организатора.
 * organizer — { project } автора; publish — true/false (черновик).
 */
export function makeEvent(form, organizer, publish = true) {
  const id = Date.now()
  const seats = Math.max(0, Number(form.seats) || 0)
  const price = Math.max(0, Number(form.price) || 0)
  return {
    id,
    slug: `${slugify(form.title)}-${String(id).slice(-5)}`,
    title: form.title.trim(),
    org: organizer?.project || 'Мой проект',
    orgInitials: initialsFrom(organizer?.project),
    category: form.category || 'Творчество и хобби',
    city: form.city || 'Онлайн',
    address: form.address?.trim() || '—',
    dateLabel: formatDateLabel(form.date),
    timeLabel: formatTimeRange(form.time, form.duration),
    date: form.date || '',
    price,
    age: form.age || '0+',
    description: form.description?.trim() || '',
    sessions: [
      {
        id: `${id}-s1`,
        label: 'Ближайший сеанс',
        dayLabel: formatDayLabel(form.date),
        timeLabel: form.time || '',
        free: seats, // свободно
        total: 0, // занято
      },
    ],
    mine: true,
    status: publish ? 'published' : 'draft',
  }
}

/**
 * Правки формы поверх УЖЕ существующего события (демо-редактирование) —
 * в отличие от makeEvent, сохраняет id/slug/принадлежность, а не создаёт
 * новое событие с нуля.
 */
export function applyFormToEvent(existing, form, publish = true) {
  const seats = Math.max(0, Number(form.seats) || 0)
  const price = Math.max(0, Number(form.price) || 0)
  const firstSession = existing.sessions?.[0]
  return {
    ...existing,
    title: form.title.trim(),
    category: form.category || existing.category,
    city: form.city || existing.city,
    address: form.address?.trim() || existing.address,
    dateLabel: formatDateLabel(form.date),
    timeLabel: formatTimeRange(form.time, form.duration),
    date: form.date || existing.date,
    price,
    description: form.description?.trim() || '',
    image: form.image || existing.image,
    sessions: [
      {
        id: firstSession?.id || `${existing.id}-s1`,
        label: firstSession?.label || 'Ближайший сеанс',
        dayLabel: formatDayLabel(form.date),
        timeLabel: form.time || '',
        isoDate: form.date || '',
        free: seats,
        total: firstSession?.total || 0,
      },
      ...(existing.sessions?.slice(1) || []),
    ],
    status: publish ? 'published' : 'draft',
  }
}

/**
 * Событие (демо или пришедшее из API) -> объект формы CreateEventPage,
 * чтобы «Редактировать событие» открывало форму с уже заполненными
 * данными, а не пустую. Данные о времени/длительности у события хранятся
 * только в виде готовых подписей (timeLabel и т.п.), поэтому здесь по
 * возможности вытаскиваем из них исходные значения — лучшее, что можно
 * сделать без изменения формата хранения событий.
 */
export function eventToForm(event) {
  if (!event) return null

  const sessions = event.sessions || []
  const first = sessions[0]

  const timeFrom = (label) => (label || '').match(/\d{1,2}:\d{2}/)?.[0] || ''
  const rawTime = timeFrom(first?.timeLabel) || timeFrom(event.timeLabel)

  let duration = ''
  const range = (event.timeLabel || '').match(/(\d{1,2}:\d{2}).*?(\d{1,2}:\d{2})/)
  if (range) {
    const [h1, m1] = range[1].split(':').map(Number)
    const [h2, m2] = range[2].split(':').map(Number)
    const diffHours = (h2 * 60 + m2 - (h1 * 60 + m1)) / 60
    if (diffHours > 0) duration = String(Math.round(diffHours * 2) / 2)
  }

  const seats =
    Number(event.places) ||
    (first ? (Number(first.free) || 0) + (Number(first.total) || 0) : 0)

  const extraDates = sessions.slice(1).map((s) => ({
    date: s.isoDate || '',
    time: timeFrom(s.timeLabel),
  }))

  return {
    form: {
      title: event.title || '',
      category: event.category || '',
      tagId: event.tagId ?? null,
      city: event.city || '',
      address: event.address && event.address !== '—' ? event.address : '',
      date: event.date || first?.isoDate || '',
      time: rawTime,
      duration,
      seats: seats ? String(seats) : '',
      price: event.price != null ? String(event.price) : '',
      description: event.description || '',
      image: event.image || '',
    },
    extraDates,
  }
}

/**
 * Подборки на лендинге и на странице «Все подборки».
 * Формируются автоматически: одна подборка = одна категория из
 * CATEGORIES, у которой есть хотя бы одно событие. Ничего не задаётся
 * руками — добавили событие новой категории, появилась и подборка.
 *
 * Обложка берётся из первого попавшегося события этой категории
 * (реальное фото, а не произвольная картинка), количество — честный
 * подсчёт по каталогу. Отсортировано по числу событий (сначала самые
 * наполненные категории).
 */
export function buildCollections() {
  return CATEGORIES.map((category) => {
    const matches = EVENTS.filter((e) => e.category === category)
    if (matches.length === 0) return null
    return {
      id: slugify(category),
      title: category,
      category,
      count: matches.length,
      image: matches[0].image,
    }
  })
    .filter(Boolean)
    .sort((a, b) => b.count - a.count)
}
