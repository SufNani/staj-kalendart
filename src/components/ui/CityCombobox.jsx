import { useState, useRef } from 'react'
import { suggestCities } from '../../data/cities'
import useOutsideClick from './useOutsideClick'

/**
 * Поле «Город»: свободный ввод + подсказки из локального списка.
 * props: value, onChange(value), id, placeholder
 */
export default function CityCombobox({ value, onChange, id, placeholder = 'Начните вводить город' }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(value || '')
  const ref = useRef(null)
  useOutsideClick(ref, () => setOpen(false))

  const options = suggestCities(query, 6)

  function pick(city) {
    setQuery(city)
    onChange(city)
    setOpen(false)
  }

  function onType(e) {
    const v = e.target.value
    setQuery(v)
    onChange(v) // свободный ввод разрешён — пишем как есть
    setOpen(true)
  }

  return (
    <div className="kt-combo" ref={ref}>
      <input
        id={id}
        className="kt-input"
        value={query}
        onChange={onType}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
      />
      {open && options.length > 0 && (
        <div className="kt-combo__menu">
          {options.map((city) => (
            <button
              type="button"
              key={city}
              className="kt-combo__item"
              onClick={() => pick(city)}
            >
              {city}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
