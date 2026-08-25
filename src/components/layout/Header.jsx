import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import Logo from '../ui/Logo'
import Icon from '../ui/Icon'

const NAV = [
  { to: '/collections', label: 'Подборки' },
  { to: '/catalog', label: 'Каталог' },
  { to: '/contacts', label: 'Контакты' },
  { to: '/about', label: 'О платформе' },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const close = () => setMobileOpen(false)

  return (
    <header className="kt-header">
      <div className="kt-container kt-header__inner">
        <Logo />

        <nav className="kt-header__nav">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `kt-header__link ${isActive && item.to !== '/collections' ? 'is-active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Правый блок — только на десктопе */}
        <div className="kt-header__right">
          <label className="kt-header__search">
            <Icon name="search" size={16} />
            <input placeholder="Поиск" aria-label="Поиск по сайту" />
          </label>
          <Link to="/login" className="kt-header__reg">
            Регистрация
          </Link>
          <Link to="/login" className="kt-btn kt-btn--gold kt-btn--sm">
            Вход
          </Link>
          <Link to="/client" className="kt-header__avatar" aria-label="Личный кабинет">
            <Icon name="user" size={20} />
          </Link>
        </div>

        {/* Бургер — только на мобильном */}
        <button
          className="kt-burger"
          aria-label={mobileOpen ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          <Icon name={mobileOpen ? 'close' : 'menu'} size={26} />
        </button>
      </div>

      {mobileOpen && (
        <>
          <div className="kt-mobilemenu__overlay" onClick={close} />
          <nav className="kt-mobilemenu">
            <div className="kt-mobilemenu__nav">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={close}
                  className={({ isActive }) =>
                    `kt-mobilemenu__link ${isActive && item.to !== '/collections' ? 'is-active' : ''}`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>

            <Link to="/client" className="kt-mobilemenu__profile" onClick={close}>
              <span className="kt-mobilemenu__avatar">
                <Icon name="user" size={18} />
              </span>
              Личный кабинет
            </Link>

            <div className="kt-mobilemenu__auth">
              <Link to="/login" className="kt-btn kt-btn--ghost kt-btn--block" onClick={close}>
                Регистрация
              </Link>
              <Link to="/login" className="kt-btn kt-btn--gold kt-btn--block" onClick={close}>
                Вход
              </Link>
            </div>
          </nav>
        </>
      )}
    </header>
  )
}
