import { useRef, useState } from 'react'
import Icon from './Icon'
import useOutsideClick from './useOutsideClick'

/**
 * Кнопка-фильтр с выпадающим меню (глубокий фиолетовый, как в макете).
 * children рендерятся внутри .kt-menu.
 */
export default function FilterDropdown({ label, active, count, align = 'left', children, menuWidth }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useOutsideClick(ref, () => setOpen(false), open)

  return (
    <div className="kt-filter" ref={ref}>
      <button
        type="button"
        className="kt-filter__btn"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
      >
        <span>{active || label}</span>
        {count ? <span className="kt-filter__badge">{count}</span> : null}
        <Icon name="chevronDown" size={16} className="kt-filter__caret" />
      </button>

      {open && (
        <div
          className={`kt-menu ${align === 'right' ? 'kt-menu--right' : ''}`}
          style={menuWidth ? { minWidth: menuWidth } : undefined}
          role="menu"
        >
          {/* передаём close детям через render-prop */}
          {typeof children === 'function' ? children(() => setOpen(false)) : children}
        </div>
      )}
    </div>
  )
}
