import { useState } from 'react'
import Sidebar from '../../components/cabinet/Sidebar'
import EventsTabs from '../../components/cabinet/EventsTabs'
import ProfileSection from '../../components/cabinet/ProfileSection'
import SettingsSection from '../../components/cabinet/SettingsSection'
import InterestsSection from '../../components/cabinet/InterestsSection'
import HelpSection from '../../components/cabinet/HelpSection'
import FavoritesSection from '../../components/cabinet/FavoritesSection'
import { useProfile } from '../../store/ProfileContext'
import { useAuth } from '../../store/AuthContext'
import { EVENTS } from '../../data/events'
import { CURRENT_USER } from '../../data/site'

const NAV = [
  { key: 'profile', label: 'Профиль' },
  { key: 'events', label: 'Мои события' },
  { key: 'favorites', label: 'Избранное' },
  { key: 'interests', label: 'Интересы' },
  { key: 'settings', label: 'Настройки' },
  { key: 'help', label: 'Помощь' },
]

function isPast(dateStr) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(dateStr)
  d.setHours(0, 0, 0, 0)
  return d < today
}

export default function ClientDashboard() {
  const [active, setActive] = useState('events')
  const { profile, fullName, initials, bookings, cancelBooking } = useProfile()
  const { user: authUser } = useAuth()
  // после реального входа показываем имя/телефон с сервера, а не демо-профиль
  const displayName = authUser?.name || fullName
  const displayPhone = authUser?.phone || profile.phone
  const displayInitials = authUser?.initials || initials
  const firstName = (authUser?.name || fullName || profile.firstName).split(' ')[0]

  const booked = EVENTS.filter((e) => bookings.includes(e.id))
  const upcoming = booked.filter((e) => !isPast(e.date))
  const past = booked.filter((e) => isPast(e.date))

  return (
    <div className="kt-container kt-cabinet">
      <Sidebar
        role="Клиента"
        user={{ name: displayName, email: displayPhone, initials: displayInitials }}
        items={NAV}
        active={active}
        onSelect={setActive}
      />

      <div>
        <div className="kt-panel">
          <h1 className="kt-greet__title">Привет, {firstName}!</h1>
          <p className="kt-greet__sub">Добро пожаловать в ваш личный кабинет</p>
        </div>

        {active === 'events' && (
          <div className="kt-cabsection">
            <EventsTabs
              upcoming={upcoming}
              past={past}
              onCancel={cancelBooking}
              emptyUpcoming="Вы пока никуда не записаны. Загляните в каталог!"
              emptyPast="Здесь появятся события, которые уже прошли."
            />
          </div>
        )}

        {active === 'favorites' && <FavoritesSection />}
        {active === 'interests' && <InterestsSection />}
        {active === 'profile' && <ProfileSection role="client" />}
        {active === 'settings' && <SettingsSection />}
        {active === 'help' && <HelpSection role="client" />}
      </div>
    </div>
  )
}
