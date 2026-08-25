import { Link } from 'react-router-dom'
import Cover from '../ui/Cover'
import Icon from '../ui/Icon'
import { coverFor } from '../../data/events'
import { useProfile } from '../../store/ProfileContext'
import { useEvents } from '../../store/EventsContext'

function FavCard({ event, onRemove }) {
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
        </div>
      </Link>
      <button
        className="kt-iconbtn kt-iconbtn--fav kt-minievent__fav"
        onClick={() => onRemove(event.id)}
        aria-label="Убрать из избранного"
        title="Убрать из избранного"
      >
        <Icon name="heart" size={20} />
      </button>
    </div>
  )
}

export default function FavoritesSection() {
  const { favorites, toggleFavorite } = useProfile()
  const { events } = useEvents()

  const favEvents = favorites
    .map((id) => events.find((e) => e.id === id))
    .filter(Boolean)

  return (
    <div className="kt-cabsection">
      <div className="kt-panel">
        <div className="kt-cabsection__title" style={{ marginBottom: 6 }}>
          Избранное <span className="kt-cabsection__count">{favEvents.length}</span>
        </div>
        <p className="kt-field__hint" style={{ marginBottom: 18 }}>
          События, которые вы отметили сердечком в каталоге.
        </p>

        {favEvents.length === 0 ? (
          <p className="kt-field__hint" style={{ padding: '10px 4px' }}>
            Пока пусто. Нажимайте <Icon name="heart" size={14} /> на карточках в{' '}
            <Link to="/catalog" className="kt-link-arrow" style={{ display: 'inline' }}>
              каталоге
            </Link>
            , чтобы сохранить событие сюда.
          </p>
        ) : (
          <div className="kt-minigrid">
            {favEvents.map((e) => (
              <FavCard key={e.id} event={e} onRemove={toggleFavorite} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
