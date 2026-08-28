import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Cover from '../components/ui/Cover'
import Icon from '../components/ui/Icon'
import OrganizerModal from '../components/OrganizerModal'
import { coverFor, priceLabel } from '../data/events'
import { useEvents } from '../store/EventsContext'
import { useProfile } from '../store/ProfileContext'
import { useAuth } from '../store/AuthContext'
import { USE_MOCKS } from '../config'
import { ORGANIZER } from '../data/site'
import { createGuestPurchase } from '../api/events'

export default function EventPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { getEvent } = useEvents()
  const event = getEvent(slug)
  const { profile, addBooking } = useProfile()
  const { user: authUser } = useAuth()
  const [orgModalOpen, setOrgModalOpen] = useState(false)

  /**
   * Данные для окна об организаторе.
   *
   * Демо-режим: если событие принадлежит демо-организатору (event.mine),
   * берём его реальную (заполненную в ЛК) анкету студии. Для остальных
   * сид-событий полного профиля у нас просто нет — честно показываем
   * только то, что есть на карточке, без выдумывания.
   *
   * Боевой режим: у API нет ручки «посмотреть чужой публичный профиль
   * по id» — только свой собственный (GET /api/users/profile). Поэтому
   * полную анкету можем показать, только если событие создал сам
   * смотрящий; в остальных случаях — то же самое честное ограничение.
   * Это стоит поднять с бэкендерами отдельно, если нужно показывать
   * профиль организатора клиентам по-настоящему.
   */
  function organizerInfo() {
    if (!event) return null

    if (USE_MOCKS && event.mine) {
      return {
        name: profile.studioName || ORGANIZER.project,
        initials: event.orgInitials,
        logo: profile.studioLogo,
        city: event.city,
        about: profile.studioAbout,
        instagram: profile.instagram,
        telegram: profile.telegram,
        vk: profile.vk,
      }
    }
    if (!USE_MOCKS && authUser && event.authorId === authUser.id) {
      return {
        name: authUser.studioName || authUser.name,
        initials: authUser.initials,
        logo: authUser.studioLogo,
        city: event.city,
        about: authUser.studioAbout,
        instagram: authUser.instagram,
        telegram: authUser.telegram,
        vk: authUser.vk,
      }
    }
    // общий случай: полного профиля организатора нам не видно
    return {
      name: event.org,
      initials: event.orgInitials,
      city: event.city,
      about: '',
      incomplete: true,
    }
  }

  const [sessions, setSessions] = useState([])
  const [selected, setSelected] = useState(null)

  /**
   * Раньше sessions/selected брались из event один раз при самом первом
   * рендере (через ленивый useState-инициализатор). В боевом режиме
   * событие приходит с сервера не мгновенно — при заходе на страницу
   * напрямую (не кликом из уже загруженного каталога, а по прямой
   * ссылке или после обновления страницы) в момент первого рендера
   * event ещё не существовал, и sessions навсегда оставался пустым,
   * даже когда событие потом подгружалось. Форма из-за этого молча
   * не давала записаться — «сеанс не выбран», хотя сеансы были.
   *
   * Пересчитываем при каждой смене event.id — это покрывает и первую
   * загрузку, и переход между разными событиями кликом (React не
   * пересоздаёт компонент заново, если меняется только :slug в URL).
   */
  useEffect(() => {
    if (!event) return
    setSessions(event.sessions.map((s) => ({ ...s })))
    const firstFree = event.sessions.find((s) => s.free > 0)
    setSelected(firstFree?.id ?? event.sessions[0]?.id ?? null)
  }, [event?.id])
  const [form, setForm] = useState({ name: '', contact: '', consent: false })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

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

  async function submit(e) {
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

    setBusy(true)
    try {
      if (USE_MOCKS) {
        // демо: просто уменьшаем число свободных мест и запоминаем
        // событие в «Моих событиях» клиента
        setSessions((prev) =>
          prev.map((s) => (s.id === selected ? { ...s, free: s.free - 1 } : s))
        )
        addBooking(event.id)
      } else {
        /**
         * Боевой режим: гостевая запись без регистрации — ровно то, что
         * нужно по ТЗ (клиент записывается по имени и контакту, без
         * аккаунта). Ручка: POST /api/purchases/reg-purchase.
         *
         * ⚠️ Тариф пока не выбирается в форме — на странице показана
         * одна цена. Если у события несколько тарифов, берём первый;
         * настоящий выбор тарифа предстоит добавить отдельно, если
         * появятся события с более чем одним вариантом цены.
         */
        await createGuestPurchase({
          eventId: event.apiId,
          tariffId: event.tariffs?.[0]?.id ?? null,
          eventDateId: activeSession.id,
          name: form.name.trim(),
          phone: form.contact.trim(),
        })
      }

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
    } catch (err) {
      setError(err.message || 'Не удалось записаться. Попробуйте ещё раз.')
    } finally {
      setBusy(false)
    }
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
          <button
            type="button"
            className="kt-org-chip"
            onClick={() => setOrgModalOpen(true)}
          >
            <span className="kt-eventcard__logo">{event.orgInitials}</span>
            <span>{event.org}</span>
          </button>
          <span style={{ marginLeft: 'auto' }} className="kt-eventcard__age">
            {event.age}
          </span>
        </div>

        {orgModalOpen && (
          <OrganizerModal organizer={organizerInfo()} onClose={() => setOrgModalOpen(false)} />
        )}

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

              <button type="submit" className="kt-btn kt-btn--gold kt-btn--block kt-btn--lg" disabled={busy}>
                {busy ? 'Записываем…' : 'Записаться'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </article>
  )
}
