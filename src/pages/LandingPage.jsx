import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import CatalogSection from '../components/CatalogSection'
import Icon from '../components/ui/Icon'
import { COLLECTIONS } from '../data/site'
import { EVENTS, EVENT_IMAGES } from '../data/events'
import heroConcert from '../assets/events/concert.png'
import heroPottery from '../assets/events/pottery.png'
import heroDance from '../assets/events/dance.png'

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
  const count = EVENTS.filter((e) => c.categories.includes(e.category)).length
  const go = () => navigate(`/catalog?category=${encodeURIComponent(c.categories[0])}`)
  return (
    <article
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
}

function CollectionsCarousel() {
  const trackRef = useRef(null)
  const [index, setIndex] = useState(0)

  function scrollToCard(i) {
    const track = trackRef.current
    if (!track) return
    const card = track.children[i]
    if (card) track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: 'smooth' })
  }

  function next() {
    const i = (index + 1) % COLLECTIONS.length
    setIndex(i)
    scrollToCard(i)
  }

  // синхронизируем точки со скроллом (например, свайп на телефоне)
  function onScroll() {
    const track = trackRef.current
    if (!track) return
    const cards = Array.from(track.children)
    const mid = track.scrollLeft + track.clientWidth / 2
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

  return (
    <div className="kt-carousel">
      <div className="kt-carousel__track" ref={trackRef} onScroll={onScroll}>
        {COLLECTIONS.map((c) => (
          <CollectionCard key={c.id} c={c} />
        ))}
      </div>

      <button className="kt-carousel__arrow" onClick={next} aria-label="Следующая подборка">
        <Icon name="arrowRight" size={20} />
      </button>

      <div className="kt-carousel__dots">
        {COLLECTIONS.map((c, i) => (
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
        <div className="kt-container kt-hero__inner">
          <div className="kt-hero__card">
            <h1 className="kt-hero__title">
              КалендАрт — это онлайн-календарь мастер-классов и событий
            </h1>
            <p className="kt-hero__text">
              Находите мастер-классы по душе, пробуйте новое и создавайте свои события.
              КалендАрт помогает наполнить жизнь яркими моментами без лишней суеты. Всё, что
              нужно для вдохновения, развития и новых знакомств — в одном месте.
            </p>
            <Link to="/catalog" className="kt-btn kt-btn--gold kt-btn--lg">
              Перейти в каталог
            </Link>
          </div>

          <div className="kt-hero__collage" aria-hidden="true">
            <img src={heroConcert} alt="" className="kt-hero__photo kt-hero__photo--1" />
            <img src={heroPottery} alt="" className="kt-hero__photo kt-hero__photo--2" />
            <img src={heroDance} alt="" className="kt-hero__photo kt-hero__photo--3" />
          </div>
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

