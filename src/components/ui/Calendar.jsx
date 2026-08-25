import { useState } from 'react'
import Icon from './Icon'

const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
]
const DOW = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

function iso(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

/**
 * Календарь месяца.
 * props: value (iso-строка), onSelect(iso), markedDates (Set iso) — точки под днём.
 */
export default function Calendar({ value, onSelect, markedDates, initialMonth }) {
  const now = new Date()
  const today = iso(now.getFullYear(), now.getMonth(), now.getDate())
  const start = value
    ? new Date(value)
    : initialMonth
    ? new Date(initialMonth)
    : now
  const [view, setView] = useState({ y: start.getFullYear(), m: start.getMonth() })

  const first = new Date(view.y, view.m, 1)
  const offset = (first.getDay() + 6) % 7 // делаем понедельник первым
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate()

  const cells = []
  for (let i = 0; i < offset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  function shift(delta) {
    setView((v) => {
      let m = v.m + delta
      let y = v.y
      if (m < 0) { m = 11; y-- }
      if (m > 11) { m = 0; y++ }
      return { y, m }
    })
  }

  return (
    <div className="kt-cal">
      <div className="kt-cal__head">
        <button className="kt-cal__nav" onClick={() => shift(-1)} aria-label="Предыдущий месяц">
          <Icon name="chevronLeft" size={16} />
        </button>
        <span className="kt-cal__title">
          {MONTHS[view.m]} {view.y}
        </span>
        <button className="kt-cal__nav" onClick={() => shift(1)} aria-label="Следующий месяц">
          <Icon name="chevronRight" size={16} />
        </button>
      </div>

      <div className="kt-cal__grid" role="grid">
        {DOW.map((d) => (
          <div key={d} className="kt-cal__dow">{d}</div>
        ))}
        {cells.map((d, i) => {
          if (d === null) return <div key={`e${i}`} />
          const day = iso(view.y, view.m, d)
          const cls = [
            'kt-cal__day',
            day === today && 'kt-cal__day--today',
            day === value && 'kt-cal__day--selected',
            markedDates?.has(day) && 'kt-cal__day--dot',
          ]
            .filter(Boolean)
            .join(' ')
          return (
            <button key={day} className={cls} onClick={() => onSelect?.(day)}>
              {d}
            </button>
          )
        })}
      </div>
    </div>
  )
}
