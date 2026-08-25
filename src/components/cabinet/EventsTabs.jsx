import { useState } from 'react'
import { Link } from 'react-router-dom'
import Cover from '../ui/Cover'
import Icon from '../ui/Icon'
import { coverFor } from '../../data/events'

function MiniEvent({ event, onCancel }) {
  return (
    <div className="kt-minievent">
      <Link to={`/event/${event.slug}`} className="kt-minievent__link">
        <Cover
          className="kt-minievent__media"
          image={event.image}
          gradient={coverFor(event.category)}
          initials={event.orgInitials}
          label={event.title}
        />
        <div>
          <div className="kt-minievent__title">{event.title}</div>
          <div className="kt-minievent__meta">
            {event.dateLabel} {event.timeLabel}
            <br />
            {event.city}
            {event.address ? `, ${event.address}` : ''}
          </div>
          {onCancel && (
            <button
              className="kt-btn kt-btn--danger kt-btn--sm"
              style={{ marginTop: 12 }}
              onClick={(e) => {
                e.preventDefault()
                if (window.confirm(`Отменить запись на «${event.title}»?`)) onCancel(event.id)
              }}
            >
              Отменить запись
            </button>
          )}
        </div>
      </Link>
    </div>
  )
}

/**
 * props:
 *  upcoming, past — списки событий
 *  emptyUpcoming, emptyPast — тексты пустого состояния
 *  onCancel(id) — если передан, у предстоящих появляется «Отменить запись»
 */
export default function EventsTabs({ upcoming = [], past = [], emptyUpcoming, emptyPast, onCancel }) {
  const [tab, setTab] = useState('upcoming')
  const list = tab === 'upcoming' ? upcoming : past
  const empty = tab === 'upcoming' ? emptyUpcoming : emptyPast

  return (
    <div className="kt-panel">
      <div className="kt-tabbar">
        <button
          className={`kt-tabbar__tab ${tab === 'upcoming' ? 'is-active' : ''}`}
          onClick={() => setTab('upcoming')}
        >
          Предстоящие
          <span className="kt-tabbar__count">{upcoming.length}</span>
        </button>
        <button
          className={`kt-tabbar__tab ${tab === 'past' ? 'is-active' : ''}`}
          onClick={() => setTab('past')}
        >
          Прошедшие
          <span className="kt-tabbar__count">{past.length}</span>
        </button>
      </div>

      {list.length === 0 ? (
        <p className="kt-field__hint" style={{ padding: '18px 4px' }}>
          {empty || 'Здесь пока пусто.'}
        </p>
      ) : (
        <div className="kt-minigrid">
          {list.map((e) => (
            <MiniEvent key={e.id} event={e} onCancel={tab === 'upcoming' ? onCancel : undefined} />
          ))}
        </div>
      )}

      <div style={{ textAlign: 'right', marginTop: 16 }}>
        <Link to="/catalog" className="kt-link-arrow">
          Найти ещё события <Icon name="arrowRight" size={16} />
        </Link>
      </div>
    </div>
  )
}
