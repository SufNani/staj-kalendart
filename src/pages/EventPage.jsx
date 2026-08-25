import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Cover from '../components/ui/Cover'
import Icon from '../components/ui/Icon'
import { coverFor, priceLabel } from '../data/events'
import { useEvents } from '../store/EventsContext'

export default function EventPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { getEvent } = useEvents()
  const event = getEvent(slug)

  const [sessions, setSessions] = useState(() => event?.sessions.map((s) => ({ ...s })) || [])
  const [selected, setSelected] = useState(() => {
    const firstFree = event?.sessions.find((s) => s.free > 0)
    return firstFree?.id || null
  })
  const [form, setForm] = useState({ name: '', contact: '', consent: false })
  const [error, setError] = useState('')

  if (!event) {
    return (
      <div className="kt-container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h1 style={{ marginBottom: 16 }}>Событие не найдено</h1>
        <Link to="/catalog" className="kt-btn kt-btn--gold">
          Вернуться в каталог
        </Link>
      </div>
    )
  }

  const activeSession = sessions.find((s) => s.id === selected)

  function submit(e) {
    e.preventDefault()
    setError('')
    if (!activeSession || activeSession.free <= 0) {
      setError('Выберите сеанс со свободными местами.')
      return
    }
    if (!form.name.trim() || !form.contact.trim()) {
      setError('Заполните имя и контакт.')
      return
    }
    if (!form.consent) {
      setError('Нужно согласие на обработку персональных данных.')
      return
    }

    // Заглушка бронирования: уменьшаем число свободных мест
    setSessions((prev) =>
      prev.map((s) => (s.id === selected ? { ...s, free: s.free - 1 } : s))
    )

    navigate('/booking-confirmed', {
      state: {
        eventTitle: event.title,
        org: event.org,
        city: event.city,
        address: event.address,
        session: activeSession,
        price: event.price,
        name: form.name,
        contact: form.contact,
      },
    })
  }

  return (
    <article>
      {/* Обложка */}
      <div className="kt-event__hero">
        <Cover
          image={event.image}
          gradient={coverFor(event.category)}
          label={event.title}
          initials={event.orgInitials}
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      <div className="kt-container">
        <div className="kt-crumbs">
          <Link to="/catalog">Каталог</Link>
          <Icon name="chevronRight" size={14} />
          <span>{event.category}</span>
        </div>

        {/* Плашки адрес / цена */}
        <div className="kt-event__bar">
          <span className="kt-event__addr">
            {event.city}, {event.address}
          </span>
          <span className="kt-pricepill" style={{ marginLeft: 'auto' }}>
            {priceLabel(event.price)}
          </span>
          <a href="#zapis" className="kt-btn kt-btn--gold">
            Выбрать сеанс
          </a>
        </div>

        {/* Категория */}
        <div className="kt-event__cat">
          <span className="kt-eventcard__logo">{event.orgInitials}</span>
          <span>{event.org}</span>
          <span style={{ marginLeft: 'auto' }} className="kt-eventcard__age">
            {event.age}
          </span>
        </div>

        {/* Тело: описание + запись */}
        <div className="kt-event__body">
          <div>
            <h1 className="kt-section__title" style={{ fontSize: 34, marginBottom: 20 }}>
              {event.title}
            </h1>
            <div className="kt-event__desc">
              <h3>Описание</h3>
              <p>{event.description}</p>
            </div>
          </div>

          {/* Запись */}
          <div id="zapis" className="kt-panel">
            <h2 className="kt-sessions__title">Записаться</h2>
            <p className="kt-field__hint" style={{ marginBottom: 4 }}>
              Выберите удобный сеанс
            </p>

            {sessions.map((s) => {
              const full = s.free <= 0
              return (
                <button
                  type="button"
                  key={s.id}
                  disabled={full}
                  onClick={() => setSelected(s.id)}
                  className={`kt-session ${selected === s.id ? 'kt-session--active' : ''} ${
                    full ? 'kt-session--full' : ''
                  }`}
                >
                  <div>
                    <div className="kt-session__label">{s.label}</div>
                    <div className="kt-session__when">
                      {s.dayLabel} · {s.timeLabel}
                    </div>
                  </div>
                  <div className="kt-session__seats">
                    {full ? (
                      <span className="kt-session__busy">Мест нет</span>
                    ) : (
                      <>
                        <div className="kt-session__free">{s.free} свободно</div>
                        <div className="kt-session__busy">{s.total} занято</div>
                      </>
                    )}
                  </div>
                </button>
              )
            })}

            <form className="kt-bookform" onSubmit={submit} style={{ marginTop: 20 }}>
              <div className="kt-field">
                <label className="kt-field__label" htmlFor="bk-name">
                  Имя
                </label>
                <input
                  id="bk-name"
                  className="kt-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Как к вам обращаться"
                />
              </div>
              <div className="kt-field">
                <label className="kt-field__label" htmlFor="bk-contact">
                  Контакт (email или телефон)
                </label>
                <input
                  id="bk-contact"
                  className="kt-input"
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  placeholder="example@mail.ru или +7 ..."
                />
              </div>
              <label className="kt-checkline">
                <input
                  type="checkbox"
                  checked={form.consent}
                  onChange={(e) => setForm({ ...form, consent: e.target.checked })}
                />
                <span>
                  Я согласен(а) на обработку персональных данных и принимаю{' '}
                  <a href="#">политику конфиденциальности</a>.
                </span>
              </label>

              {error && (
                <div style={{ color: 'var(--kt-danger)', fontSize: 14, fontWeight: 600 }}>
                  {error}
                </div>
              )}

              <button type="submit" className="kt-btn kt-btn--gold kt-btn--block kt-btn--lg">
                Записаться
              </button>
            </form>
          </div>
        </div>
      </div>
    </article>
  )
}
