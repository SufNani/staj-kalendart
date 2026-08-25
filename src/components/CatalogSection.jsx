import { useMemo, useState } from 'react'
import FilterBar from './FilterBar'
import EventCard from './EventCard'
import { PRICE_RANGES } from '../data/events'
import { useEvents } from '../store/EventsContext'

const PAGE = 9

function matches(event, filters) {
  if (filters.category && event.category !== filters.category) return false
  if (filters.city && event.city !== filters.city) return false
  if (filters.date && event.date !== filters.date) return false
  if (filters.price) {
    const range = PRICE_RANGES.find((p) => p.id === filters.price)
    if (range?.id === 'free' && event.price !== 0) return false
    if (range && range.id !== 'free' && event.price > range.max) return false
  }
  return true
}

export default function CatalogSection({ initialCategory = null, id }) {
  const [filters, setFilters] = useState({
    category: initialCategory,
    date: null,
    price: null,
    city: null,
  })
  const [visible, setVisible] = useState(PAGE)
  const { publishedEvents } = useEvents()

  const result = useMemo(
    () => publishedEvents.filter((e) => matches(e, filters)),
    [publishedEvents, filters]
  )

  function patch(p) {
    setFilters((f) => ({ ...f, ...p }))
    setVisible(PAGE)
  }

  return (
    <section className="kt-section" id={id}>
      <div className="kt-container">
        <div className="kt-catalog__head">
          <div>
            <h2 className="kt-section__title">Каталог</h2>
          </div>
          <FilterBar filters={filters} onChange={patch} />
        </div>

        <p className="kt-section__lead">
          В каталоге — все события, которые проходят прямо сейчас. Удобные фильтры помогут
          отобрать то, что вам нужно: по интересам, тематике, дате, цене или городу.{' '}
          <b>Настраивайте поиск под себя и открывайте новые возможности!</b>
        </p>

        <div style={{ marginTop: 32 }}>
          {result.length === 0 ? (
            <div className="kt-catalog__empty">
              По вашим фильтрам событий не нашлось. Попробуйте изменить условия поиска.
            </div>
          ) : (
            <div className="kt-eventgrid">
              {result.slice(0, visible).map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          )}

          {visible < result.length && (
            <div className="kt-catalog__more">
              <button
                className="kt-btn kt-btn--gold kt-btn--lg"
                onClick={() => setVisible((v) => v + PAGE)}
              >
                Показать ещё
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
