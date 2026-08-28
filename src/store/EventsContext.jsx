import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { EVENTS, applyFormToEvent, formatDayLabel } from '../data/events'
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
    // hidden относится только к сидовым событиям (см. removeEvent ниже) —
    // «созданные»/отредактированные организатором в него не попадают,
    // даже если у отредактированного события id совпадает с сидовым
    // (см. updateEvent: правка сидового события переносит его в created).
    const seed = buildSeed().filter((e) => !hiddenSet.has(e.id))
    return [...created, ...seed]
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

  /**
   * Правка существующего события (для «Редактировать событие»).
   *  extraDates (опционально, только для USE_MOCKS): [{date, time}] —
   *    если передан массив, доп. сеансы (кроме первого) пересобираются
   *    из него; если не передан — существующие доп. сеансы не трогаем.
   *  USE_MOCKS: если событие уже среди «созданных» — правим на месте;
   *    если это событие из сида (демо-организатор) — переносим его в
   *    «созданные» с тем же id, чтобы правки пережили перезагрузку
   *    (и сразу прячем оригинал из сида через hidden, см. events выше).
   *  API: PUT /api/event/{id}, обновляем локальный кэш (org_events и каталог).
   */
  const updateEvent = useCallback(async (id, form, extraDates) => {
    if (USE_MOCKS) {
      const buildExtraSessions = (baseId) =>
        Array.isArray(extraDates)
          ? extraDates
              .filter((d) => d.date)
              .map((d, i) => ({
                id: `${baseId}-s${i + 2}`,
                label: `Сеанс ${i + 2}`,
                dayLabel: formatDayLabel(d.date),
                timeLabel: d.time || '',
                isoDate: d.date,
                free: Math.max(0, Number(form.seats) || 0),
                total: 0,
              }))
          : null // null = не трогаем существующие доп. сеансы

      let updated = null
      let migratedFromSeed = false
      setCreated((prevCreated) => {
        const idx = prevCreated.findIndex((e) => e.id === id)
        if (idx !== -1) {
          const base = applyFormToEvent(prevCreated[idx], form, true)
          const extra = buildExtraSessions(prevCreated[idx].id)
          updated = extra ? { ...base, sessions: [base.sessions[0], ...extra] } : base
          const next = [...prevCreated]
          next[idx] = updated
          saveJSON(CREATED_KEY, next)
          return next
        }
        const seedEvent = buildSeed().find((e) => e.id === id)
        if (!seedEvent) return prevCreated
        const base = applyFormToEvent(seedEvent, form, true)
        const extra = buildExtraSessions(seedEvent.id)
        updated = extra ? { ...base, sessions: [base.sessions[0], ...extra] } : base
        migratedFromSeed = true
        const next = [updated, ...prevCreated]
        saveJSON(CREATED_KEY, next)
        return next
      })
      if (!updated) {
        throw new Error('Событие не найдено — возможно, оно уже было удалено.')
      }
      if (migratedFromSeed) {
        setHidden((prevHidden) => {
          if (prevHidden.includes(id)) return prevHidden
          const next = [...prevHidden, id]
          saveJSON(HIDDEN_KEY, next)
          return next
        })
      }
      return updated
    }
    const saved = await eventsApi.updateEvent(id, form)
    setMyRemote((prev) => prev.map((e) => (e.id === saved.id ? saved : e)))
    setRemote((prev) => prev.map((e) => (e.id === saved.id ? saved : e)))
    return saved
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
      updateEvent,
      removeEvent,
      reload,
      loading,
      error,
    }),
    [events, mineAll, addEvent, updateEvent, removeEvent, reload, loading, error]
  )

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>
}

export function useEvents() {
  const ctx = useContext(EventsContext)
  if (!ctx) throw new Error('useEvents должен использоваться внутри <EventsProvider>')
  return ctx
}
