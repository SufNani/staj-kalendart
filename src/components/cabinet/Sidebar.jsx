import { useNavigate } from 'react-router-dom'
import Icon from '../ui/Icon'
import { useAuth } from '../../store/AuthContext'

/**
 * props:
 *  role: 'Клиента' | 'Организатора'
 *  user: { name, email, initials }
 *  items: [{ key, label }]
 *  active: key
 *  onSelect: (key) => void
 */
export default function Sidebar({ role, user, items, active, onSelect }) {
  const navigate = useNavigate()
  const { logout } = useAuth()

  async function onLogout() {
    await logout()
    navigate('/')
  }

  return (
    <aside className="kt-sidebar">
      <div className="kt-sidebar__eyebrow">Личный кабинет</div>
      <div className="kt-sidebar__title">{role}</div>

      <div className="kt-profilecard">
        <div className="kt-profilecard__ava">{user.initials}</div>
        <div>
          <div className="kt-profilecard__name">{user.name}</div>
          <div className="kt-profilecard__mail">{user.email}</div>
        </div>
      </div>

      <nav className="kt-sidenav">
        {items.map((item) => (
          <button
            key={item.key}
            className={`kt-sidenav__item ${active === item.key ? 'is-active' : ''}`}
            onClick={() => onSelect(item.key)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="kt-sidebar__foot">
        <button className="kt-btn kt-btn--ghost kt-btn--block" onClick={onLogout}>
          <Icon name="logout" size={18} /> Выйти из аккаунта
        </button>
        <button className="kt-btn kt-btn--danger kt-btn--block">Удалить аккаунт</button>
      </div>
    </aside>
  )
}
