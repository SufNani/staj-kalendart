import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { CURRENT_USER, ORGANIZER } from '../data/site'
import { USE_MOCKS } from '../config'
import { useAuth } from './AuthContext'

/* ============================================================
   Профиль пользователя в ЛК (демо, без бэкенда).
   Хранит: профиль, интересы, анкету организатора, уведомления.
   Сохраняется в localStorage, чтобы переживать перезагрузку.
   При подключении API это заменится запросами к серверу.
   ============================================================ */

const KEY = 'kalendart:profile'

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return null
}
function save(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
}

const DEFAULT = {
  // общий профиль
  firstName: 'Иван',
  lastName: 'Иванов',
  phone: '+7 999 123-45-67',
  city: 'Москва',
  avatar: '', // dataURL превью
  // интересы клиента (названия категорий)
  interests: CURRENT_USER.interests || [],
  // избранные события (id) — сохраняются по клику на сердечко
  favorites: [],
  // записи клиента (id событий) — можно отменить в кабинете
  bookings: CURRENT_USER.bookedEventIds || [],
  // анкета организатора
  studioName: '',
  studioAbout: '',
  instagram: '',
  telegram: '',
  vk: '',
  studioLogo: '',
  // уведомления
  notifyTelegram: false,
  notifyMax: false,
}

const ProfileContext = createContext(null)

export function ProfileProvider({ children }) {
  const { user: authUser } = useAuth()
  const [profile, setProfile] = useState(() => ({ ...DEFAULT, ...(load() || {}) }))

  const update = useCallback((patch) => {
    setProfile((prev) => {
      const next = { ...prev, ...patch }
      save(next)
      return next
    })
  }, [])

  const toggleInterest = useCallback((name) => {
    setProfile((prev) => {
      const has = prev.interests.includes(name)
      const interests = has
        ? prev.interests.filter((i) => i !== name)
        : [...prev.interests, name]
      const next = { ...prev, interests }
      save(next)
      return next
    })
  }, [])

  const toggleFavorite = useCallback((id) => {
    setProfile((prev) => {
      const has = (prev.favorites || []).includes(id)
      const favorites = has
        ? prev.favorites.filter((f) => f !== id)
        : [...(prev.favorites || []), id]
      const next = { ...prev, favorites }
      save(next)
      return next
    })
  }, [])

  const cancelBooking = useCallback((id) => {
    setProfile((prev) => {
      const next = { ...prev, bookings: (prev.bookings || []).filter((b) => b !== id) }
      save(next)
      return next
    })
  }, [])

  const addBooking = useCallback((id) => {
    setProfile((prev) => {
      if ((prev.bookings || []).includes(id)) return prev
      const next = { ...prev, bookings: [...(prev.bookings || []), id] }
      save(next)
      return next
    })
  }, [])

  // Анкета организатора считается заполненной, если есть название студии
  // и хотя бы одна ссылка на соцсеть (по плану).
  // В боевом режиме смотрим на реальный профиль с сервера (authUser),
  // а не на локальный — иначе после настоящего входа организатора,
  // который ещё не открывал этот браузер, форму создания события
  // блокировало бы навсегда.
  const organizerReady = useMemo(() => {
    const src = !USE_MOCKS && authUser ? authUser : profile
    return (
      Boolean(src.studioName?.trim()) &&
      Boolean(src.instagram?.trim() || src.telegram?.trim() || src.vk?.trim())
    )
  }, [authUser, profile.studioName, profile.instagram, profile.telegram, profile.vk])

  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ')
  const initials =
    (profile.firstName?.[0] || '') + (profile.lastName?.[0] || '') || ORGANIZER.initials

  const value = useMemo(
    () => ({
      profile,
      update,
      toggleInterest,
      toggleFavorite,
      isFavorite: (id) => (profile.favorites || []).includes(id),
      favorites: profile.favorites || [],
      bookings: profile.bookings || [],
      cancelBooking,
      addBooking,
      isBooked: (id) => (profile.bookings || []).includes(id),
      organizerReady,
      fullName,
      initials: initials.toUpperCase(),
    }),
    [profile, update, toggleInterest, toggleFavorite, cancelBooking, addBooking, organizerReady, fullName, initials]
  )

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}

export function useProfile() {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfile должен использоваться внутри <ProfileProvider>')
  return ctx
}
