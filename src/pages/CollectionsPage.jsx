import { useNavigate } from 'react-router-dom'
import { COLLECTIONS } from '../data/site'
import { EVENTS, EVENT_IMAGES } from '../data/events'

function pluralEvents(n) {
  const a = Math.abs(n) % 100
  const b = n % 10
  if (a > 10 && a < 20) return `${n} событий`
  if (b > 1 && b < 5) return `${n} события`
  if (b === 1) return `${n} событие`
  return `${n} событий`
}

export default function CollectionsPage() {
  const navigate = useNavigate()

  return (
    <section className="kt-section">
      <div className="kt-container">
        <h1 className="kt-section__title">Все подборки</h1>
        <p className="kt-section__lead">
          Тематические подборки событий. Выберите близкую тему — и откроется каталог по ней.
        </p>

        <div className="kt-collgrid">
          {COLLECTIONS.map((c) => {
            const count = EVENTS.filter((e) => c.categories.includes(e.category)).length
            const go = () => navigate(`/catalog?category=${encodeURIComponent(c.categories[0])}`)
            return (
              <article
                key={c.id}
                className="kt-collection"
                onClick={go}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && go()}
              >
                <div className="kt-collection__media">
                  <img src={EVENT_IMAGES[c.image]} alt={c.title} loading="lazy" />
                </div>
                <div className="kt-collection__body">
                  <h3 className="kt-collection__title">{c.title}</h3>
                  <div className="kt-collection__count">{pluralEvents(count)}</div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
