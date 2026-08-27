import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Sidebar from '../../components/cabinet/Sidebar'
import Calendar from '../../components/ui/Calendar'
import Icon from '../../components/ui/Icon'
import ProfileSection from '../../components/cabinet/ProfileSection'
import SettingsSection from '../../components/cabinet/SettingsSection'
import HelpSection from '../../components/cabinet/HelpSection'
import FavoritesSection from '../../components/cabinet/FavoritesSection'
import { STATUS_LABEL, ORGANIZER } from '../../data/site'
import { useEvents } from '../../store/EventsContext'
import { useProfile } from '../../store/ProfileContext'
import { useAuth } from '../../store/AuthContext'

const NAV = [
  { key: 'profile', label: 'Профиль' },
  { key: 'events', label: 'Мои события' },
  { key: 'favorites', label: 'Избранное' },
  { key: 'create', label: 'Создание события' },
  { key: 'settings', label: 'Настройки' },
  { key: 'help', label: 'Помощь' },
]

const STATUS_CLASS = { published: 'kt-status--pub', draft: 'kt-status--draft', done: 'kt-status--done' }

export default function OrganizerDashboard() {
  const navigate = useNavigate()
  const { myEvents, historyEvents, removeEvent } = useEvents()
  const { profile, fullName, initials, organizerReady } = useProfile()
  const { user: authUser } = useAuth()
  const displayName = authUser?.name || fullName
  const displayPhone = authUser?.phone || profile.phone
  const displayInitials = authUser?.initials || initials
  const [active, setActive] = useState('events')
  const [tab, setTab] = useState('upcoming') // вкладки «Мои события»
  const [flagOrg, setFlagOrg] = useState(false) // подсветить анкету при принудительном заходе

  const markedDates = new Set([...myEvents, ...historyEvents].map((e) => e.date))

  async function onDelete(e) {
    if (!window.confirm(`Удалить событие «${e.title}»?`)) return
    try {
      await removeEvent(e.id)
    } catch (err) {
      window.alert(err.message || 'Не удалось удалить событие.')
    }
  }

  // Блокировка создания события до заполнения анкеты (по плану)
  function goCreate() {
    if (!organizerReady) {
      setActive('profile')
      setFlagOrg(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    navigate('/organizer/create')
  }

  function onNav(key) {
    if (key === 'create') {
      goCreate()
      return
    }
    setFlagOrg(false)
    setActive(key)
  }

  const rows = tab === 'upcoming' ? myEvents : historyEvents

  return (
    <div className="kt-container kt-cabinet">
      <Sidebar
        role="Организатора"
        user={{ name: displayName, email: displayPhone, initials: displayInitials }}
        items={NAV}
        active={active}
        onSelect={onNav}
      />

      <div>
        <div
          className="kt-panel"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}
        >
          <div>
            <h1 className="kt-greet__title">Мои события</h1>
            <p className="kt-greet__sub">{authUser?.studioName || profile.studioName || ORGANIZER.project}</p>
          </div>
          <button className="kt-btn kt-btn--gold kt-btn--lg" onClick={goCreate}>
            <Icon name="plus" size={18} /> Создать событие
          </button>
        </div>

        {/* Напоминание про анкету */}
        {active === 'events' && !organizerReady && (
          <div className="kt-panel kt-panel--flag" style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <Icon name="user" size={20} />
              <div style={{ flex: 1, minWidth: 200 }}>
                <strong>Заполните анкету студии</strong>
                <div className="kt-field__hint">
                  Название и хотя бы одна соцсеть — без этого нельзя создавать события.
                </div>
              </div>
              <button
                className="kt-btn kt-btn--gold"
                onClick={() => {
                  setActive('profile')
                  setFlagOrg(true)
                }}
              >
                Заполнить анкету
              </button>
            </div>
          </div>
        )}

        {active === 'events' && (
          <div className="kt-cabsection">
            <div className="kt-tabbar">
              <button
                className={`kt-tabbar__tab ${tab === 'upcoming' ? 'is-active' : ''}`}
                onClick={() => setTab('upcoming')}
              >
                Предстоящие <span className="kt-tabbar__count">{myEvents.length}</span>
              </button>
              <button
                className={`kt-tabbar__tab ${tab === 'past' ? 'is-active' : ''}`}
                onClick={() => setTab('past')}
              >
                Прошедшие <span className="kt-tabbar__count">{historyEvents.length}</span>
              </button>
            </div>

            <div className={tab === 'upcoming' ? 'kt-orggrid' : ''}>
              {tab === 'upcoming' && (
                <div className="kt-panel" style={{ background: 'var(--kt-pink-soft)' }}>
                  <Calendar markedDates={markedDates} />
                  <p style={{ fontSize: 13, color: 'var(--kt-ink-soft)', padding: '0 6px', marginTop: 8 }}>
                    Точками отмечены дни, где у вас есть события.
                  </p>
                </div>
              )}

              <div className="kt-panel" style={{ overflowX: 'auto' }}>
                <table className="kt-table">
                  <thead>
                    <tr>
                      <th>Событие</th>
                      <th>Дата</th>
                      <th>Места</th>
                      <th>Статус</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '32px 12px', color: 'var(--kt-ink-soft)' }}>
                          {tab === 'upcoming' ? (
                            <>
                              Предстоящих событий нет.{' '}
                              <button className="kt-link-arrow" onClick={goCreate}>
                                Создать →
                              </button>
                            </>
                          ) : (
                            'Прошедших событий пока нет.'
                          )}
                        </td>
                      </tr>
                    )}
                    {rows.map((e) => {
                      const free = e.sessions.reduce((a, s) => a + s.free, 0)
                      const total = e.sessions.reduce((a, s) => a + s.total + s.free, 0)
                      return (
                        <tr key={e.id}>
                          <td>
                            <div style={{ fontWeight: 600 }}>{e.title}</div>
                            <div className="kt-eventcard__city">{e.city}</div>
                          </td>
                          <td className="kt-mono">
                            {e.dateLabel}
                            <br />
                            {e.timeLabel}
                          </td>
                          <td className="kt-mono">
                            {free}/{total}
                          </td>
                          <td>
                            <span
                              className={`kt-status ${
                                tab === 'past' ? 'kt-status--done' : STATUS_CLASS[e.status]
                              }`}
                            >
                              {tab === 'past' ? 'Завершено' : STATUS_LABEL[e.status]}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
                              <Link to={`/organizer/event/${e.slug}`} className="kt-btn kt-btn--ghost kt-btn--sm">
                                <Icon name="users" size={16} /> Подробнее
                              </Link>
                              {tab === 'upcoming' && (
                                <>
                                  <Link to="/organizer/create" className="kt-iconbtn" aria-label="Редактировать">
                                    <Icon name="edit" size={18} />
                                  </Link>
                                  <button className="kt-iconbtn" aria-label="Удалить" onClick={() => onDelete(e)}>
                                    <Icon name="trash" size={18} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {active === 'favorites' && <FavoritesSection />}
        {active === 'profile' && <ProfileSection role="organizer" highlightOrg={flagOrg} />}
        {active === 'settings' && <SettingsSection />}
        {active === 'help' && <HelpSection role="organizer" />}
      </div>
    </div>
  )
}
