import { Link, useNavigate, useParams } from 'react-router-dom'
import { useCollections } from '../store/useCollections'
import EventCard from '../components/EventCard'
import Icon from '../components/ui/Icon'

function pluralEvents(n) {
  const a = Math.abs(n) % 100
  const b = n % 10
  if (a > 10 && a < 20) return `${n} событий`
  if (b > 1 && b < 5) return `${n} события`
  if (b === 1) return `${n} событие`
  return `${n} событий`
}

/** Сетка карточек подборок — «Все подборки». */
function AllCollections({ collections }) {
  const navigate = useNavigate()

  return (
    <>
      <h1 className="kt-section__title">Все подборки</h1>
      <p className="kt-section__lead">
        Подборки формируются автоматически по категориям событий —
        выберите тему, и откроется каталог по ней.
      </p>

      <div className="kt-collgrid">
        {collections.map((c) => {
          const go = () =>
            c.category
              ? navigate(`/catalog?category=${encodeURIComponent(c.category)}`)
              : navigate(`/collections/${c.id}`)
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
                {c.image && <img src={c.image} alt={c.title} loading="lazy" />}
              </div>
              <div className="kt-collection__body">
                <h3 className="kt-collection__title">{c.title}</h3>
                <div className="kt-collection__count">{pluralEvents(c.count)}</div>
              </div>
            </article>
          )
        })}
      </div>
    </>
  )
}

/** Одна подборка — реальный список её событий. */
function OneCollection({ collection }) {
  // подборки на моках — просто категория, у них нет своего списка событий;
  // такая подборка нормально открывается кликом в каталоге, а не здесь,
  // но при прямом переходе по ссылке ведём туда же вместо падения
  if (!collection.events) {
    return (
      <div className="kt-catalog__empty">
        Эта подборка открывается в каталоге.{' '}
        <Link
          to={`/catalog?category=${encodeURIComponent(collection.category || '')}`}
          className="kt-link-arrow"
        >
          Перейти в каталог →
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="kt-crumbs" style={{ paddingTop: 0, marginBottom: 16 }}>
        <Link to="/collections">Все подборки</Link>
        <Icon name="chevronRight" size={14} />
        <span>{collection.title}</span>
      </div>
      <h1 className="kt-section__title">{collection.title}</h1>
      {collection.description && (
        <p className="kt-section__lead">{collection.description}</p>
      )}
      <p className="kt-section__subline">{pluralEvents(collection.count)}</p>

      {collection.events.length === 0 ? (
        <div className="kt-catalog__empty">В этой подборке пока нет событий.</div>
      ) : (
        <div className="kt-eventgrid" style={{ marginTop: 24 }}>
          {collection.events.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      )}
    </>
  )
}

export default function CollectionsPage() {
  const { id } = useParams()
  const { collections, loading, error } = useCollections()

  return (
    <section className="kt-section">
      <div className="kt-container">
        {loading ? (
          <div className="kt-catalog__empty">Загружаем подборки…</div>
        ) : error ? (
          <div className="kt-catalog__empty">{error}</div>
        ) : id ? (
          (() => {
            const collection = collections.find((c) => String(c.id) === String(id))
            if (!collection) {
              return (
                <div className="kt-catalog__empty">
                  Подборка не найдена.{' '}
                  <Link to="/collections" className="kt-link-arrow">
                    Ко всем подборкам →
                  </Link>
                </div>
              )
            }
            // на моках у подборки нет своего списка событий (только категория) —
            // такая подборка открывается сразу в каталоге, сюда не попадает
            return <OneCollection collection={collection} />
          })()
        ) : (
          <AllCollections collections={collections} />
        )}
      </div>
    </section>
  )
}
