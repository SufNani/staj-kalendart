import { useNavigate } from 'react-router-dom'
import { buildCollections } from '../data/events'

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
  const collections = buildCollections()

  return (
    <section className="kt-section">
      <div className="kt-container">
        <h1 className="kt-section__title">Все подборки</h1>
        <p className="kt-section__lead">
          Подборки формируются автоматически по категориям событий —
          выберите тему, и откроется каталог по ней.
        </p>

        <div className="kt-collgrid">
          {collections.map((c) => {
            const go = () => navigate(`/catalog?category=${encodeURIComponent(c.category)}`)
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
                  <img src={c.image} alt={c.title} loading="lazy" />
                </div>
                <div className="kt-collection__body">
                  <h3 className="kt-collection__title">{c.title}</h3>
                  <div className="kt-collection__count">{pluralEvents(c.count)}</div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
