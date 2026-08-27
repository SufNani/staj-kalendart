import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { EVENTS } from '../data/events'
import { ORGANIZER } from '../data/site'
import { USE_MOCKS } from '../config'
import * as eventsApi from '../api/events'
import { useAuth } from './AuthContext'

/* ============================================================
   Хранилище событий.

   Компоненты работают только через useEvents() и не знают,
   откуда данные — из моков или из API.

   USE_MOCKS=true  -> сид из data/events.js + localStorage (как раньше)
   USE_MOCKS=false -> запросы к бэкенду
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

// сид с проставленными владельцем и статусом (демо-режим)
function buildSeed() {
  const statusById = Object.fromEntries(ORGANIZER.events.map((e) => [e.id, e.status]))
  return EVENTS.map((e) => ({
    ...e,
    mine: Object.prototype.hasOwnProperty.call(statusById, e.id),
    status: statusById[e.id] || 'published',
  }))
}

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
function isEventPast(e) {
  const times = eventDayTimes(e)
  if (!times.length) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.max(...times) < today.getTime()
}

const EventsContext = createContext(null)

export function EventsProvider({ children }) {
  const { user, isAuth } = useAuth()

  // --- демо-режим (localStorage) ---
  const [created, setCreated] = useState(() => (USE_MOCKS ? loadJSON(CREATED_KEY, []) : []))
  const [hidden, setHidden] = useState(() => (USE_MOCKS ? loadJSON(HIDDEN_KEY, []) : []))

  // --- режим API ---
  const [remote, setRemote] = useState([])
  const [myRemote, setMyRemote] = useState([]) // события организатора (org_events)
  const [loading, setLoading] = useState(!USE_MOCKS)
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    if (USE_MOCKS) return
    setLoading(true)
    setError('')
    try {
      setRemote(await eventsApi.fetchEvents())
    } catch (e) {
      setError(e.message || 'Не удалось загрузить события.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  // события организатора — отдельная ручка org_events (нужен токен)
  useEffect(() => {
    if (USE_MOCKS || !isAuth || user?.role !== 'organizer') {
      setMyRemote([])
      return
    }
    eventsApi.fetchMyOrgEvents().then(setMyRemote).catch(() => setMyRemote([]))
  }, [isAuth, user])

  const events = useMemo(() => {
    if (!USE_MOCKS) return remote
    const hiddenSet = new Set(hidden)
    return [...created, ...buildSeed()].filter((e) => !hiddenSet.has(e.id))
  }, [remote, created, hidden])

  const addEvent = useCallback(
    async (eventOrForm) => {
      if (USE_MOCKS) {
        setCreated((prev) => {
          const next = [eventOrForm, ...prev]
          saveJSON(CREATED_KEY, next)
          return next
        })
        return eventOrForm
      }
      const saved = await eventsApi.createEvent(eventOrForm)
      setMyRemote((prev) => [saved, ...prev])
      return saved
    },
    []
  )

  const removeEvent = useCallback(async (id) => {
    if (USE_MOCKS) {
      setCreated((prevCreated) => {
        if (prevCreated.some((e) => e.id === id)) {
          const next = prevCreated.filter((e) => e.id !== id)
          saveJSON(CREATED_KEY, next)
          return next
        }
        setHidden((prevHidden) => {
          if (prevHidden.includes(id)) return prevHidden
          const next = [...prevHidden, id]
          saveJSON(HIDDEN_KEY, next)
          return next
        })
        return prevCreated
      })
      return
    }
    await eventsApi.deleteEvent(id)
    setMyRemote((prev) => prev.filter((e) => e.id !== id))
  }, [])

  // «Мои события»: в демо — по флагу mine, в API — из org_events (уже только свои)
  const mineAll = USE_MOCKS ? events.filter((e) => e.mine) : myRemote

  const value = useMemo(
    () => ({
      events,
      myEvents: mineAll.filter((e) => !isEventPast(e)),
      historyEvents: mineAll.filter((e) => isEventPast(e)),
      publishedEvents: events.filter((e) => e.status !== 'draft'),
      getEvent: (slug) => events.find((e) => e.slug === slug),
      fetchEventById: eventsApi.fetchEvent, // для страницы события в режиме API
      addEvent,
      removeEvent,
      reload,
      loading,
      error,
    }),
    [events, mineAll, addEvent, removeEvent, reload, loading, error]
  )

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>
}

export function useEvents() {
  const ctx = useContext(EventsContext)
  if (!ctx) throw new Error('useEvents должен использоваться внутри <EventsProvider>')
  return ctx
}
