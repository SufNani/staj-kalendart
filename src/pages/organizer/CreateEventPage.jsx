import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Icon from '../../components/ui/Icon'
import { CATEGORIES, CITIES, makeEvent, eventToForm, formatDayLabel } from '../../data/events'
import { ORGANIZER } from '../../data/site'
import { useEvents } from '../../store/EventsContext'
import { USE_MOCKS } from '../../config'
import { useProfile } from '../../store/ProfileContext'
import { useAuth } from '../../store/AuthContext'
import { fetchTags, uploadMedia } from '../../api/events'

const empty = {
  title: '',
  category: '',
  tagId: null, // реальный id тега с сервера (боевой режим)
  city: '',
  address: '',
  date: '',
  time: '', 
  duration: '',
  seats: '',
  price: '',
  description: '',
  image: '',
}

export default function CreateEventPage() {
  const navigate = useNavigate()
  const { slug: editSlug } = useParams() // есть только на /organizer/create/:slug
  const isEditing = Boolean(editSlug)
  const { addEvent, updateEvent, getEvent, fetchEventById, myEvents, historyEvents } = useEvents()
  const { organizerReady } = useProfile()
  const { loading: authLoading } = useAuth()

  // Без заполненной анкеты студии создавать событие нельзя (по плану).
  // Важно: пока сессия восстанавливается (authLoading), profile ещё не
  // пришёл с сервера — organizerReady в этот момент временно false,
  // и без проверки authLoading организатора уносило бы обратно ещё
  // до того, как успевал загрузиться его настоящий профиль.
  useEffect(() => {
    if (!authLoading && !organizerReady) navigate('/organizer', { replace: true })
  }, [authLoading, organizerReady, navigate])

  const [form, setForm] = useState(empty)
  const [extraDates, setExtraDates] = useState([])

  // --- редактирование: подгружаем существующее событие и заполняем форму ---
  const [editingEvent, setEditingEvent] = useState(null)
  const [loadingEvent, setLoadingEvent] = useState(isEditing)
  const [loadEventError, setLoadEventError] = useState('')

  useEffect(() => {
    if (!editSlug) {
      setEditingEvent(null)
      setLoadingEvent(false)
      setLoadEventError('')
      return
    }

    setLoadingEvent(true)
    setLoadEventError('')

    // сначала — то, что уже есть под рукой (каталог/«Мои события»),
    // чтобы форма заполнилась сразу, не дожидаясь сети
    const local =
      getEvent(editSlug) || [...myEvents, ...historyEvents].find((e) => e.slug === editSlug)

    if (local) {
      setEditingEvent(local)
      const { form: filled, extraDates: filledExtra } = eventToForm(local)
      setForm(filled)
      setExtraDates(filledExtra)
    }

    if (USE_MOCKS) {
      setLoadingEvent(false)
      if (!local) setLoadEventError('Событие не найдено.')
      return
    }

    // боевой режим: дотягиваем актуальную версию с сервера — то, что
    // лежит в каталоге/org_events, может быть устаревшим кэшем
    const apiId = local?.apiId ?? local?.id
    if (apiId == null) {
      setLoadingEvent(false)
      if (!local) setLoadEventError('Событие не найдено.')
      return
    }
    fetchEventById(apiId)
      .then((fresh) => {
        setEditingEvent(fresh)
        const { form: filled, extraDates: filledExtra } = eventToForm(fresh)
        setForm(filled)
        setExtraDates(filledExtra)
      })
      .catch((err) => setLoadEventError(err.message || 'Не удалось загрузить событие.'))
      .finally(() => setLoadingEvent(false))
    // подгружаем заново только при смене редактируемого события —
    // не хотим перезатирать правки пользователя на каждый ре-рендер
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editSlug])

  /**
   * В боевом режиме категория — это не название, а конкретная строка
   * в таблице тегов на сервере (нужен её id). Раньше мы держали свой
   * список названий и пытались сопоставить его с тем, что вернёт
   * сервер по имени — при малейшем расхождении в написании сервер
   * отвечал 422 (tag_id: не число), потому что совпадения не было.
   *
   * Сейчас список категорий в форме приходит НАПРЯМУЮ с сервера
   * (GET /api/tags/), поэтому в выпадающем списке всегда будут ровно
   * те теги, что реально существуют в базе — что бы там ни лежало.
   * Как только бэкендеры заведут настоящие категории вместо тестовых,
   * здесь появятся именно они, без единой правки кода.
   */
  const [realTags, setRealTags] = useState([])
  useEffect(() => {
    if (USE_MOCKS) return
    fetchTags().then(setRealTags).catch(() => {})
  }, [])

  const [photoBusy, setPhotoBusy] = useState(false)
  const [photoError, setPhotoError] = useState('')

  /** Загрузка обложки события.
   *  Демо-режим: локальное превью (dataURL), на сервер ничего не уходит.
   *  Боевой режим: реальная загрузка на POST /api/media/, в форму
   *  сохраняется ссылка, которую вернул сервер. */
  function onPhotoPick(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoError('')

    if (USE_MOCKS) {
      const reader = new FileReader()
      reader.onload = () => set('image', reader.result)
      reader.readAsDataURL(file)
      return
    }

    setPhotoBusy(true)
    uploadMedia(file)
      .then((url) => set('image', url))
      .catch((err) => setPhotoError(err.message || 'Не удалось загрузить фото.'))
      .finally(() => setPhotoBusy(false))
  }
  const [toast, setToast] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
    if (error) setError('')
  }

      function addDate() {
      setExtraDates((prev) => [
        ...prev,
        {
          date: '',
          time: '',
        },
      ])
    }

    function updateExtraDate(index, key, value) {
      setExtraDates((prev) =>
        prev.map((item, i) =>
          i === index ? { ...item, [key]: value } : item
        )
      )
    }

function removeExtraDate(index) {
  setExtraDates((prev) => prev.filter((_, i) => i !== index))
}
  function validate(publish) {
    if (!form.title.trim()) return 'Укажите название события.'
    if (!publish) return '' // черновик можно сохранить только с названием
    if (!form.category) return 'Выберите категорию.'
    if (!form.date) return 'Укажите дату начала.'
    if (!form.time) return 'Укажите время начала.'
    if (!form.seats || Number(form.seats) < 1) return 'Укажите количество мест (минимум 1).'
    return ''
  }

  async function save(publish) {
    const problem = validate(publish)
    if (problem) {
      setError(problem)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setBusy(true)
    try {
      if (isEditing) {
        const targetId = USE_MOCKS ? editingEvent.id : editingEvent.apiId ?? editingEvent.id
        if (USE_MOCKS) {
          await updateEvent(targetId, form, extraDates)
        } else {
          // боевой режим: как и при создании, отправляем форму как есть —
          // перевод в тело PUT-запроса делает src/api/mappers.js
          await updateEvent(targetId, form)
        }
        setToast('Изменения сохранены')
      } else if (USE_MOCKS) {
        const event = makeEvent(form, ORGANIZER, publish)

        // все даты события: основная + дополнительные (для деления
        // на предстоящие/прошедшие и сортировки)
        const seats = Number(form.seats) || 0
        const allDates = [form.date, ...extraDates.map((d) => d.date)].filter(Boolean).sort()

        extraDates
          .filter((d) => d.date)
          .forEach((d, i) => {
            event.sessions.push({
              id: `${event.id}-s${i + 2}`,
              label: `Сеанс ${i + 2}`,
              dayLabel: formatDayLabel(d.date),
              timeLabel: d.time || '',
              isoDate: d.date,
              free: seats,
              total: 0,
            })
          })

        if (event.sessions[0]) event.sessions[0].isoDate = form.date || allDates[0] || ''
        event.dates = allDates
        if (!event.date && allDates[0]) event.date = allDates[0]

        await addEvent(event)
        setToast(publish ? 'Событие опубликовано 🎉' : 'Черновик сохранён')
      } else {
        // боевой режим: отправляем данные формы на сервер как есть,
        // перевод в тело запроса делает src/api/mappers.js
        await addEvent(form)
        setToast(publish ? 'Событие опубликовано 🎉' : 'Черновик сохранён')
      }
      setTimeout(() => navigate('/organizer'), 1000)
    } catch (err) {
      setError(err.message || 'Не удалось сохранить событие.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setBusy(false)
    }
  }

  if (isEditing && loadingEvent) {
    return (
      <div className="kt-container" style={{ padding: '80px 0', textAlign: 'center' }}>
        Загружаем событие…
      </div>
    )
  }

  if (isEditing && loadEventError) {
    return (
      <div className="kt-container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h1 style={{ marginBottom: 16 }}>{loadEventError}</h1>
        <Link to="/organizer" className="kt-btn kt-btn--gold">
          К моим событиям
        </Link>
      </div>
    )
  }

  return (
    <div className="kt-container" style={{ paddingBlock: 28, maxWidth: 900 }}>
      <div className="kt-crumbs" style={{ paddingTop: 0, marginBottom: 16 }}>
        <Link to="/organizer">Мои события</Link>
        <Icon name="chevronRight" size={14} />
        <span>{isEditing ? 'Редактирование события' : 'Создание события'}</span>
      </div>

      <div className="kt-panel">
        <h1 style={{ fontSize: 26, marginBottom: 6 }}>
          {isEditing ? 'Редактировать событие' : 'Создать событие'}
        </h1>
        <p className="kt-field__hint" style={{ marginBottom: 24 }}>
          {isEditing
            ? 'Правки увидят все, кто уже открывал страницу события.'
            : 'Заполните детали — клиенты увидят их на публичной странице.'}
        </p>

        {error && (
          <div
            role="alert"
            style={{
              background: 'var(--kt-danger-soft, #fbe4e0)',
              color: 'var(--kt-danger)',
              border: '1px solid var(--kt-danger)',
              borderRadius: 'var(--kt-r-md)',
              padding: '12px 16px',
              marginBottom: 20,
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            save(true)
          }}
          className="kt-formgrid"
        >
          <div className="kt-field kt-formgrid--full">
            <label className="kt-field__label" htmlFor="ce-title">
              Название
            </label>
            <input
              id="ce-title"
              className="kt-input"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="Мастер-класс по лепке из глины"
            />
          </div>

          <div className="kt-field">
            <label className="kt-field__label" htmlFor="ce-cat">
              Ниша / категория
            </label>
            <select
              id="ce-cat"
              className="kt-select"
              value={USE_MOCKS ? form.category : form.tagId ?? ''}
              onChange={(e) => {
                if (USE_MOCKS) {
                  set('category', e.target.value)
                  return
                }
                // выбираем сразу и id (уйдёт на сервер), и имя (для отображения)
                const id = e.target.value ? Number(e.target.value) : null
                const tag = realTags.find((t) => t.id === id)
                setForm((f) => ({ ...f, tagId: id, category: tag?.name || '' }))
              }}
            >
              <option value="">Выберите категорию</option>
              {USE_MOCKS
                ? CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))
                : realTags.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
            </select>
            {!USE_MOCKS && realTags.length === 1 && (
              <p className="kt-field__hint" style={{ color: 'var(--kt-busy)', marginTop: 6 }}>
                На сервере пока только тестовая категория — это временно,
                бэкендеры ещё не наполнили справочник настоящими.
              </p>
            )}
          </div>
                     
          <div className="kt-field">
            <label className="kt-field__label" htmlFor="ce-city">
              Город
            </label>
            <select
              id="ce-city"
              className="kt-select"
              value={form.city}
              onChange={(e) => set('city', e.target.value)}
            >
              <option value="">Выберите город</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="kt-field kt-formgrid--full">
            <label className="kt-field__label" htmlFor="ce-addr">
              Адрес или площадка
            </label>
            <input
              id="ce-addr"
              className="kt-input"
              value={form.address}
              onChange={(e) => set('address', e.target.value)}
              placeholder="ул. Тимура Фрунзе, 11 (или «Онлайн»)"
            />
          </div>

          <div className="kt-field">
            <label className="kt-field__label" htmlFor="ce-date">
              Дата начала
            </label>
            <input
              id="ce-date"
              type="date"
              className="kt-input"
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
            />
          </div>


          <div className="kt-field">
            <label className="kt-field__label" htmlFor="ce-time">
              Время начала
            </label>
            <input
              id="ce-time"
              type="time"
              className="kt-input"
              value={form.time}
              onChange={(e) => set('time', e.target.value)}
            />
          </div>
       
       <div className="kt-formgrid--full" style={{ marginTop: -6, marginBottom: 16 }}>
        <button
          type="button"
          className="kt-btn kt-btn--gold"
          onClick={addDate}
        >
          + Добавить дату
        </button>
      </div>

      {extraDates.map((item, index) => (
        <div
          key={index}
          className="kt-formgrid--full"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr auto',
            gap: 12,
            marginBottom: 16,
            alignItems: 'end',
            
          }}
        >
          <div className="kt-field">
            <label className="kt-field__label">
              Дополнительная дата
            </label>

            <input
              type="date"
              className="kt-input"
              value={item.date}
              onChange={(e) =>
                updateExtraDate(index, 'date', e.target.value)
              }
            />
          </div>

          <div className="kt-field">
            <label className="kt-field__label">
              Время
            </label>

            <input
              type="time"
              required
              className="kt-input"
              value={item.time}
              onChange={(e) =>
                updateExtraDate(index, 'time', e.target.value)
              }
            />
          </div>

          <button
            type="button"
            className="kt-btn kt-btn--ghost"
            onClick={() => removeExtraDate(index)}
          >
            ✕
          </button>
        </div>
      ))}

          <div className="kt-field">
            <label className="kt-field__label" htmlFor="ce-dur">
              Длительность (часы)
            </label>
            <input
              id="ce-dur"
              type="number"
              min="0"
              step="0.5"
              className="kt-input"
              value={form.duration}
              onChange={(e) => set('duration', e.target.value)}
              placeholder="3"
            />
          </div>
               
          <div className="kt-field">
            <label className="kt-field__label" htmlFor="ce-seats">
              Количество мест
            </label>
            <input
              id="ce-seats"
              type="number"
              min="1"
              className="kt-input"
              value={form.seats}
              onChange={(e) => set('seats', e.target.value)}
              placeholder="10"
            />
          </div>

          <div className="kt-field">
            <label className="kt-field__label" htmlFor="ce-price">
              Цена (₽), 0 — бесплатно
            </label>
            <input
              id="ce-price"
              type="number"
              min="0"
              className="kt-input"
              value={form.price}
              onChange={(e) => set('price', e.target.value)}
              placeholder="2500"
            />
          </div>

          <div className="kt-field">
            <label className="kt-field__label">Обложка события</label>
            <label className="kt-uploadbox" style={{ cursor: photoBusy ? 'wait' : 'pointer' }}>
              {form.image ? (
                <img
                  src={form.image}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }}
                />
              ) : (
                <>
                  <Icon name={photoBusy ? 'clock' : 'plus'} size={24} />
                  <span>{photoBusy ? 'Загружаем…' : 'Добавить фото'}</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                hidden
                disabled={photoBusy}
                onChange={onPhotoPick}
              />
            </label>
            {photoError && (
              <p className="kt-field__hint" style={{ color: 'var(--kt-danger)', marginTop: 6 }}>
                {photoError}
              </p>
            )}
          </div>

          <div className="kt-field kt-formgrid--full">
            <label className="kt-field__label" htmlFor="ce-desc">
              Краткое описание
            </label>
            <textarea
              id="ce-desc"
              className="kt-textarea"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Расскажите, что будет на событии, что нужно взять и для кого оно."
            />
          </div>

          <div
            className="kt-formgrid--full"
            style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap' }}
          >
            {!isEditing && (
              <button type="button" className="kt-btn kt-btn--ghost" onClick={() => save(false)} disabled={busy}>
                Сохранить черновик
              </button>
            )}
            <button type="submit" className="kt-btn kt-btn--gold kt-btn--lg" disabled={busy}>
              {busy ? 'Сохраняем…' : isEditing ? 'Сохранить изменения' : 'Опубликовать событие'}
            </button>
          </div>
        </form>
      </div>

      {toast && (
        <div className="kt-toast">
          <Icon name="check" size={18} strokeWidth={3} /> {toast}
        </div>
      )}
    </div>
  )
}
