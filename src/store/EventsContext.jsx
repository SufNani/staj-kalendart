import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { EVENTS } from '../data/events'
import { ORGANIZER } from '../data/site'

/* ============================================================
   Хранилище событий (демо, без бэкенда).
   - Сид-события берём из data/events.js.
   - Созданные организатором события и удаления храним в
     localStorage, чтобы они переживали перезагрузку страницы.
   При подключении API это заменяется запросами к серверу.
   ============================================================ */

const CREATED_KEY = 'kalendart:created-events'
const HIDDEN_KEY = 'kalendart:hidden-events'

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}
function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* приватный режим / переполнение — тихо игнорируем */
  }
}

// сид с проставленными владельцем и статусом
function buildSeed() {
  const statusById = Object.fromEntries(ORGANIZER.events.map((e) => [e.id, e.status]))
  return EVENTS.map((e) => ({
    ...e,
    mine: Object.prototype.hasOwnProperty.call(statusById, e.id),
    status: statusById[e.id] || 'published',
  }))
}

const EventsContext = createContext(null)

// Все даты события (основная + сеансы) в виде timestamp начала дня
function eventDayTimes(e) {
  const raw = []
  if (Array.isArray(e.dates)) raw.push(...e.dates)
  if (e.date) raw.push(e.date)
  ;(e.sessions || []).forEach((s) => {
    if (s.isoDate) raw.push(s.isoDate)
  })
  return raw
    .filter(Boolean)
    .map((d) => {
      const x = new Date(d)
      x.setHours(0, 0, 0, 0)
      return x.getTime()
    })
    .filter((t) => !Number.isNaN(t))
}

// Событие прошедшее, если известна хотя бы одна дата и ПОСЛЕДНЯЯ из них уже позади.
// Если валидных дат нет — считаем предстоящим (чтобы было видно и можно поправить).
function isEventPast(e) {
  const times = eventDayTimes(e)
  if (!times.length) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.max(...times) < today.getTime()
}

export function EventsProvider({ children }) {
  const [created, setCreated] = useState(() => loadJSON(CREATED_KEY, []))
  const [hidden, setHidden] = useState(() => loadJSON(HIDDEN_KEY, []))

  const events = useMemo(() => {
    const hiddenSet = new Set(hidden)
    return [...created, ...buildSeed()].filter((e) => !hiddenSet.has(e.id))
  }, [created, hidden])

  const addEvent = useCallback((event) => {
    setCreated((prev) => {
      const next = [event, ...prev]
      saveJSON(CREATED_KEY, next)
      return next
    })
    return event
  }, [])

  const removeEvent = useCallback((id) => {
    setCreated((prevCreated) => {
      if (prevCreated.some((e) => e.id === id)) {
        const next = prevCreated.filter((e) => e.id !== id)
        saveJSON(CREATED_KEY, next)
        return next
      }
      // сид-событие — прячем через список скрытых
      setHidden((prevHidden) => {
        if (prevHidden.includes(id)) return prevHidden
        const next = [...prevHidden, id]
        saveJSON(HIDDEN_KEY, next)
        return next
      })
      return prevCreated
    })
  }, [])

 const value = useMemo(
  () => ({
    events,

    myEvents: events.filter((e) => e.mine && !isEventPast(e)),

    historyEvents: events.filter((e) => e.mine && isEventPast(e)),

    publishedEvents: events.filter((e) => e.status !== 'draft'),
    getEvent: (slug) => events.find((e) => e.slug === slug),
    addEvent,
    removeEvent,
  }),
  [events, addEvent, removeEvent]
)

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>
}

export function useEvents() {
  const ctx = useContext(EventsContext)
  if (!ctx) throw new Error('useEvents должен использоваться внутри <EventsProvider>')
  return ctx
}
