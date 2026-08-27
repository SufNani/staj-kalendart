/* ============================================================
   Перевод данных: формат бэкенда <-> формат наших компонентов.
   Сверено с полной выгрузкой Swagger (27 ручек, август 2026).

   Схема события на бэкенде:
   { id, name, description, image_url, city, location,
     available_places, age, author_id,
     tag: {id, name},
     event_dates:   [{id, start_date, end_date, description,
                      occupied_places, free_places}],
     event_tariffs: [{id, price, name, description}] }

   Главные изменения по сравнению с прошлой версией API:
   - city теперь ОТДЕЛЬНОЕ поле (не нужно резать location по запятой)
   - у каждой даты события есть occupied_places / free_places —
     статистику по сеансам теперь можно строить честно
   ============================================================ */

import { slugify, formatDateLabel, formatDayLabel } from '../data/events'

function initialsFrom(name) {
  const words = String(name || '')
    .replace(/[«»"'()]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
  return (words.slice(0, 2).map((w) => w[0]).join('') || 'КА').toUpperCase()
}

/** "2026-09-10T19:00:00Z" -> ["2026-09-10", "19:00"] */
function splitIso(value) {
  if (!value) return ['', '']
  const str = String(value)
  const [date, rest] = str.includes('T') ? str.split('T') : [str, '']
  return [date, (rest || '').slice(0, 5)]
}

/** Ответ API -> событие в формате наших компонентов. */
export function eventFromApi(dto) {
  if (!dto) return null

  const id = dto.id
  const title = dto.name || 'Без названия'

  const dates = Array.isArray(dto.event_dates) ? dto.event_dates : []
  const tariffs = Array.isArray(dto.event_tariffs) ? dto.event_tariffs : []

  // цена: минимальный тариф (price приходит строкой — на бэке decimal)
  const prices = tariffs.map((t) => Number(t.price) || 0)
  const price = prices.length ? Math.min(...prices) : 0

  const sorted = [...dates].sort((a, b) =>
    String(a.start_date).localeCompare(String(b.start_date))
  )
  const first = sorted[0]
  const [firstDate, firstTime] = splitIso(first?.start_date)
  const [, firstEnd] = splitIso(first?.end_date)

  // общие места по всем сеансам (для карточки/шапки события)
  const totalFree = sorted.reduce((a, d) => a + (Number(d.free_places) || 0), 0)
  const totalOccupied = sorted.reduce((a, d) => a + (Number(d.occupied_places) || 0), 0)

  return {
    id,
    apiId: id,
    slug: `${slugify(title)}-${id}`,
    title,
    description: dto.description || '',
    image: dto.image_url || '',
    city: dto.city || '',
    address: dto.location || '',
    category: dto.tag?.name || '',
    tagId: dto.tag?.id ?? null,
    authorId: dto.author_id ?? null,
    age: dto.age || '0+',
    price,
    tariffs: tariffs.map((t) => ({
      id: t.id,
      name: t.name || 'Базовый',
      price: Number(t.price) || 0,
      description: t.description || '',
    })),
    places: Number(dto.available_places) || 0,
    freeSeats: totalFree,
    occupiedSeats: totalOccupied,
    date: firstDate || '',
    dateLabel: formatDateLabel(firstDate),
    timeLabel: firstTime ? (firstEnd ? `с ${firstTime} до ${firstEnd}` : `в ${firstTime}`) : '',
    // имени организатора в API по-прежнему нет — только author_id
    org: dto.author_name || `Организатор #${dto.author_id ?? '—'}`,
    orgInitials: initialsFrom(dto.author_name || 'Организатор'),
    // статуса (черновик/опубликовано) в API всё ещё нет
    status: 'published',
    sessions: sorted.map((d, i) => {
      const [dDate, dTime] = splitIso(d.start_date)
      const [, dEnd] = splitIso(d.end_date)
      return {
        id: d.id,
        label: d.description || (i === 0 ? 'Ближайший сеанс' : `Сеанс ${i + 1}`),
        dayLabel: formatDayLabel(dDate),
        timeLabel: dEnd ? `${dTime}–${dEnd}` : dTime,
        free: Number(d.free_places) || 0,
        total: Number(d.occupied_places) || 0,
        isoDate: dDate,
      }
    }),
  }
}

/** Данные формы организатора -> тело POST/PUT /api/event/ */
export function eventToApi(form, tagId = null) {
  const start = form.date && form.time ? `${form.date}T${form.time}:00` : null

  let end = null
  if (start && form.duration) {
    const dt = new Date(start)
    dt.setMinutes(dt.getMinutes() + Math.round(Number(form.duration) * 60))
    end = dt.toISOString().slice(0, 19)
  }

  return {
    name: form.title?.trim() || '',
    description: form.description?.trim() || '',
    image_url: form.image || '',
    city: form.city || '',
    location: form.address?.trim() || '',
    available_places: Number(form.seats) || 0,
    age: form.age || '0+',
    tag_id: tagId,
    event_dates: start
      ? [{ start_date: start, end_date: end || start, description: 'Ближайший сеанс' }]
      : [],
    event_tariffs: [{ name: 'Базовый', price: Number(form.price) || 0, description: '' }],
  }
}

/** Профиль: { id, name, phone, user_type, vk_linked_id, max_linked_id } */
/**
 * Профиль: { id, name, phone, user_type, vk_linked_id, max_linked_id,
 *            city, studio_name, description, studio_logo,
 *            instagram, telegram, vkontakte }
 * Анкета студии (28.08) переехала прямо в профиль пользователя —
 * отдельная ручка /api/socials/ с max_url/vk_url осталась как есть,
 * видимо для другого сценария (привязка соцсетей к аккаунту).
 */
export function userFromApi(dto) {
  if (!dto) return null
  const name = dto.name || 'Пользователь'
  return {
    id: dto.id,
    name,
    initials: initialsFrom(name),
    phone: dto.phone || '',
    city: dto.city || '',
    userType: dto.user_type || null,
    role: dto.user_type === 'org' ? 'organizer' : 'client',
    vkLinked: Boolean(dto.vk_linked_id),
    maxLinked: Boolean(dto.max_linked_id),
    // анкета студии — теперь настоящие поля с сервера
    studioName: dto.studio_name || '',
    studioAbout: dto.description || '',
    studioLogo: dto.studio_logo || '',
    instagram: dto.instagram || '',
    telegram: dto.telegram || '',
    vk: dto.vkontakte || '',
    project: dto.studio_name || name,
    // интересов (тегов) тут нет — отдельная ручка preferred_tags
    interests: [],
  }
}

export function tokenFromApi(dto) {
  return dto?.access_token || null
}

/** Данные анкеты (наш формат) -> тело PATCH /api/users/profile */
export function profilePatchToApi(patch) {
  const body = {}
  if (patch.name !== undefined) body.name = patch.name
  if (patch.phone !== undefined) body.phone = patch.phone
  if (patch.city !== undefined) body.city = patch.city
  if (patch.studioName !== undefined) body.studio_name = patch.studioName
  if (patch.studioAbout !== undefined) body.description = patch.studioAbout
  if (patch.studioLogo !== undefined) body.studio_logo = patch.studioLogo
  if (patch.instagram !== undefined) body.instagram = patch.instagram
  if (patch.telegram !== undefined) body.telegram = patch.telegram
  if (patch.vk !== undefined) body.vkontakte = patch.vk
  return body
}

/** Подборка: { id, title, description, image_url, events: [...] } */
export function collectionFromApi(dto) {
  if (!dto) return null
  return {
    id: dto.id,
    title: dto.title || '',
    description: dto.description || '',
    image: dto.image_url || '',
    events: Array.isArray(dto.events) ? dto.events.map(eventFromApi) : [],
  }
}

/** Запись на событие (моя запись / список участников). */
export function purchaseFromApi(dto) {
  if (!dto) return null
  return {
    id: dto.id,
    userId: dto.user_id,
    event: eventFromApi(dto.event),
    tariff: dto.tariff
      ? { id: dto.tariff.id, name: dto.tariff.name, price: Number(dto.tariff.price) || 0 }
      : null,
    eventDateId: dto.event_date?.id,
    dateLabel: formatDateLabel(splitIso(dto.event_date?.start_date)[0]),
    purchaseDate: dto.purchase_date,
    status: dto.status || '',
    extra: dto.extra_data || {},
  }
}
