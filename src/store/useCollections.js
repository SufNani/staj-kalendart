import { useEffect, useState } from 'react'
import { buildCollections } from '../data/events'
import { fetchCollections } from '../api/events'
import { USE_MOCKS } from '../config'

/**
 * Подборки на лендинге и на странице «Все подборки».
 *
 * USE_MOCKS=true  -> считаются локально по демо-каталогу (buildCollections):
 *                     одна подборка = одна категория, у которой есть события.
 * USE_MOCKS=false -> берутся с сервера (GET /api/collections/) — реальные
 *                     подборки со своим списком событий и честным счётчиком.
 *
 * Раньше лендинг всегда показывал buildCollections() независимо от режима,
 * поэтому цифры на нём не менялись, что бы ни отдавал бэкенд.
 */
export function useCollections() {
  const [remote, setRemote] = useState([])
  const [loading, setLoading] = useState(!USE_MOCKS)
  const [error, setError] = useState('')

  useEffect(() => {
    if (USE_MOCKS) return
    let cancelled = false
    setLoading(true)
    setError('')
    fetchCollections()
      .then((data) => {
        if (!cancelled) setRemote(data)
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || 'Не удалось загрузить подборки.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (USE_MOCKS) {
    return { collections: buildCollections(), loading: false, error: '' }
  }

  const collections = remote.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    // у подборок с сервера нет привязки к одной категории — это
    // произвольный список событий, поэтому карточка ведёт на саму
    // подборку (/collections/:id), а не в каталог по категории
    category: null,
    count: c.events.length,
    image: c.image || c.events[0]?.image || '',
    events: c.events,
  }))

  return { collections, loading, error }
}
