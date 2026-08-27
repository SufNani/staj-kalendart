import { useState, useEffect } from 'react'
import FilterDropdown from './ui/FilterDropdown'
import Calendar from './ui/Calendar'
import Icon from './ui/Icon'
import { CATEGORIES, CITIES, PRICE_RANGES } from '../data/events'
import { USE_MOCKS } from '../config'
import { fetchTags, fetchCities } from '../api/events'

// ISO-дата на N дней вперёд от сегодня
function isoOffset(days = 0) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * props: filters { category, date, price, city }, onChange(patch)
 */
export default function FilterBar({ filters, onChange }) {
  const [citySearch, setCitySearch] = useState('')
  // в боевом режиме категории и города приходят с сервера
  // (/api/tags/, /api/event/cities); если не задались — используем
  // локальные списки, чтобы фильтр не остался пустым
  const [categories, setCategories] = useState(CATEGORIES)
  const [cities, setCities] = useState(CITIES)

  useEffect(() => {
    if (USE_MOCKS) return
    fetchTags()
      .then((tags) => tags.length && setCategories(tags.map((t) => t.name)))
      .catch(() => {})
    fetchCities()
      .then((list) => list.length && setCities(list))
      .catch(() => {})
  }, [])

  const priceLabel = filters.price
    ? PRICE_RANGES.find((p) => p.id === filters.price)?.label
    : null

  const dateLabel = filters.date
    ? new Date(filters.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
    : null

  const filteredCities = cities.filter((c) =>
    c.toLowerCase().includes(citySearch.toLowerCase())
  )

  return (
    <div className="kt-filterbar">
      {/* Категория */}
      <FilterDropdown label="Категория" active={filters.category}>
        {(close) => (
          <>
            {filters.category && (
              <button
                className="kt-menu__item"
                onClick={() => { onChange({ category: null }); close() }}
              >
                ✕ Сбросить категорию
              </button>
            )}
            {categories.map((c) => (
              <button
                key={c}
                className={`kt-menu__item ${filters.category === c ? 'kt-menu__item--active' : ''}`}
                onClick={() => { onChange({ category: c }); close() }}
              >
                {c}
              </button>
            ))}
          </>
        )}
      </FilterDropdown>

      {/* Дата */}
      <FilterDropdown label="Дата" active={dateLabel} menuWidth={300}>
        {(close) => (
          <>
            <Calendar
              value={filters.date}
              onSelect={(d) => { onChange({ date: d }); close() }}
            />
            <div className="kt-menu__actions">
              <button
                className="kt-menu__action"
                onClick={() => { onChange({ date: isoOffset(0) }); close() }}
              >
                Сегодня
              </button>
              <button
                className="kt-menu__action"
                onClick={() => { onChange({ date: isoOffset(1) }); close() }}
              >
                Завтра
              </button>
              <button
                className="kt-menu__action"
                onClick={() => { onChange({ date: null }); close() }}
              >
                Весь месяц
              </button>
            </div>
          </>
        )}
      </FilterDropdown>

      {/* Цена */}
      <FilterDropdown label="Цена" active={priceLabel}>
        {(close) =>
          PRICE_RANGES.map((p) => (
            <button
              key={p.id}
              className={`kt-menu__item ${filters.price === p.id ? 'kt-menu__item--active' : ''}`}
              onClick={() => { onChange({ price: p.id === 'any' ? null : p.id }); close() }}
            >
              {p.label}
            </button>
          ))
        }
      </FilterDropdown>

      {/* Город */}
      <FilterDropdown label="Город" active={filters.city} align="right">
        {(close) => (
          <>
            <input
              className="kt-menu__search"
              placeholder="Поиск города"
              value={citySearch}
              onChange={(e) => setCitySearch(e.target.value)}
            />
            {filters.city && (
              <button
                className="kt-menu__item"
                onClick={() => { onChange({ city: null }); close() }}
              >
                ✕ Все города
              </button>
            )}
            {filteredCities.map((c) => (
              <button
                key={c}
                className={`kt-menu__item ${filters.city === c ? 'kt-menu__item--active' : ''}`}
                onClick={() => { onChange({ city: c }); close() }}
              >
                {c}
              </button>
            ))}
          </>
        )}
      </FilterDropdown>
    </div>
  )
}
