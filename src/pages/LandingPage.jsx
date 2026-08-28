import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import CatalogSection from '../components/CatalogSection'
import { useCollections } from '../store/useCollections'
import heroShapeLeft from '../assets/hero/hero-shape-left.svg'
import heroShapeRight from '../assets/hero/hero-shape-right.svg'

// склонение: 1 событие, 2 события, 5 событий
function pluralEvents(n) {
  const a = Math.abs(n) % 100
  const b = n % 10
  if (a > 10 && a < 20) return `${n} событий`
  if (b > 1 && b < 5) return `${n} события`
  if (b === 1) return `${n} событие`
  return `${n} событий`
}

function CollectionCard({ c }) {
  const navigate = useNavigate()
  // подборки на моках привязаны к категории — ведём в каталог по ней;
  // подборки с сервера — произвольный список событий без категории,
  // ведём на страницу самой подборки
  const go = () =>
    c.category
      ? navigate(`/catalog?category=${encodeURIComponent(c.category)}`)
      : navigate(`/collections/${c.id}`)
  return (
    <article
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
}

function CollectionsCarousel() {
  const trackRef = useRef(null)
  const [index, setIndex] = useState(0)
  const { collections, loading, error } = useCollections()

  function scrollToCard(i) {
    const track = trackRef.current
    if (!track) return
    const card = track.children[i]
    if (card) track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: 'smooth' })
  }

  // синхронизируем точки со скроллом (например, свайп на телефоне)
  function onScroll() {
    const track = trackRef.current
    if (!track) return
    const cards = Array.from(track.children)
    let best = 0
    let bestDist = Infinity
    cards.forEach((card, i) => {
      const c = card.offsetLeft - track.offsetLeft + card.clientWidth / 2
      const d = Math.abs(c - (track.scrollLeft + track.clientWidth / 2))
      if (d < bestDist) {
        bestDist = d
        best = i
      }
    })
    if (best !== index) setIndex(best)
  }

  if (loading) {
    return <div className="kt-catalog__empty">Загружаем подборки…</div>
  }
  if (error) {
    return <div className="kt-catalog__empty">{error}</div>
  }
  if (collections.length === 0) {
    return <div className="kt-catalog__empty">Подборок пока нет.</div>
  }

  return (
    <div className="kt-carousel">
      <div className="kt-carousel__track" ref={trackRef} onScroll={onScroll}>
        {collections.map((c) => (
          <CollectionCard key={c.id} c={c} />
        ))}
      </div>

      <div className="kt-carousel__dots">
        {collections.map((c, i) => (
          <button
            key={c.id}
            className={`kt-carousel__dot ${i === index ? 'is-active' : ''}`}
            aria-label={`Подборка ${i + 1}`}
            onClick={() => {
              setIndex(i)
              scrollToCard(i)
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default function LandingPage() {
  return (
    <>
      {/* Герой */}
      <section className="kt-hero">
        <img src={heroShapeLeft} alt="" className="kt-hero__shape kt-hero__shape--left" aria-hidden="true" />
        <img src={heroShapeRight} alt="" className="kt-hero__shape kt-hero__shape--right" aria-hidden="true" />

        <div className="kt-container kt-hero__inner">
          <h1 className="kt-hero__title">
            КалендАрт — это онлайн-календарь мастер-классов и событий
          </h1>
          <p className="kt-hero__text">
            Находите мастер-классы по душе, пробуйте новое и создавайте свои события.
            <br />
            КалендАрт помогает наполнить жизнь яркими моментами без лишней суеты.
            <br />
            Всё, что нужно для вдохновения, развития
            <br />
            и новых знакомств — в одном месте.
          </p>
          <Link to="/catalog" className="kt-hero__cta">
            Перейти в каталог
          </Link>
        </div>
      </section>

      {/* Подборки */}
      <section className="kt-section" id="collections">
        <div className="kt-container">
          <h2 className="kt-section__title">Подборки</h2>
          <p className="kt-section__lead">
            Найдите свой идеальный мастер-класс или событие! Нажимайте на интересную тему — и
            КалендАрт покажет все доступные занятия, чтобы вы могли выбрать то, что по душе
            именно сегодня.
          </p>
          <p className="kt-section__subline">
            От творчества до саморазвития — подборки на любой вкус!
          </p>

          <CollectionsCarousel />
        </div>
      </section>

      {/* Каталог */}
      <CatalogSection id="catalog" />
    </>
  )
}
