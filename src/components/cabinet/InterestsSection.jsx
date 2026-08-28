import { useEffect, useState } from 'react'
import { useProfile } from '../../store/ProfileContext'
import { CATEGORIES } from '../../data/events'
import { fetchTags } from '../../api/events'
import { fetchPreferredTags } from '../../api/auth'
import { USE_MOCKS } from '../../config'
import Icon from '../ui/Icon'

const LOCAL_KEY = 'kalendart:interests-local'

function loadLocalIds() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    return raw ? new Set(JSON.parse(raw)) : null
  } catch {
    return null
  }
}
function saveLocalIds(ids) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify([...ids]))
  } catch {
    /* приватный режим / переполнение — тихо игнорируем */
  }
}

/**
 * Раздел «Интересы».
 *
 *  USE_MOCKS: как раньше — живёт в ProfileContext (localStorage),
 *    интересы — это названия демо-категорий.
 *
 *  Боевой режим: реальные теги с сервера (GET /api/tags/), стартовый
 *    выбор подтягивается с GET /api/users/profile/preferred_tags.
 *    Сохранить отметки на сервере пока негде: в API есть ручка, чтобы
 *    их прочитать, но нет ручки, чтобы записать (ни POST, ни PATCH для
 *    preferred_tags бэкенд не отдаёт — см. ПОДКЛЮЧЕНИЕ-API.md). Поэтому
 *    выбор в боевом режиме держим в этом браузере и честно предупреждаем
 *    об этом, а не делаем вид, что всё сохранилось на сервере.
 */
export default function InterestsSection() {
  const { profile, toggleInterest } = useProfile()

  const [tags, setTags] = useState([])
  const [selected, setSelected] = useState(() => loadLocalIds() || new Set())
  const [loading, setLoading] = useState(!USE_MOCKS)
  const [error, setError] = useState('')

  useEffect(() => {
    if (USE_MOCKS) return
    let cancelled = false
    setLoading(true)
    setError('')
    Promise.all([fetchTags(), fetchPreferredTags()])
      .then(([allTags, preferred]) => {
        if (cancelled) return
        setTags(allTags)
        // если в этом браузере уже что-то отмечали раньше — не затираем
        // локальный выбор, иначе стартуем с того, что реально отмечено
        // на сервере
        const saved = loadLocalIds()
        setSelected(saved || new Set(preferred.map((t) => t.id)))
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || 'Не удалось загрузить интересы.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  function toggleTag(id) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      saveLocalIds(next)
      return next
    })
  }

  if (USE_MOCKS) {
    return (
      <div className="kt-cabsection">
        <div className="kt-panel">
          <div className="kt-cabsection__title" style={{ marginBottom: 6 }}>
            Ваши интересы
          </div>
          <p className="kt-field__hint" style={{ marginBottom: 18 }}>
            Отметьте темы, которые вам близки. События с этими тегами поднимутся
            выше в каталоге и получат отметку «подобрано для вас». Остальной каталог
            остаётся доступен целиком.
          </p>

          <div className="kt-interests">
            {CATEGORIES.map((name) => {
              const active = profile.interests.includes(name)
              return (
                <button
                  key={name}
                  className={`kt-chip ${active ? 'kt-chip--active' : ''}`}
                  onClick={() => toggleInterest(name)}
                >
                  {active && <Icon name="check" size={13} strokeWidth={3} />} {name}
                </button>
              )
            })}
          </div>

          <p className="kt-field__hint" style={{ marginTop: 16 }}>
            Выбрано: {profile.interests.length}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="kt-cabsection">
      <div className="kt-panel">
        <div className="kt-cabsection__title" style={{ marginBottom: 6 }}>
          Ваши интересы
        </div>
        <p className="kt-field__hint" style={{ marginBottom: 18 }}>
          Отметьте темы, которые вам близки. События с этими тегами поднимутся
          выше в каталоге и получат отметку «подобрано для вас». Остальной каталог
          остаётся доступен целиком.
        </p>

        {loading ? (
          <p className="kt-field__hint">Загружаем теги…</p>
        ) : error ? (
          <p className="kt-field__hint" style={{ color: 'var(--kt-danger)' }}>
            {error}
          </p>
        ) : tags.length === 0 ? (
          <p className="kt-field__hint">На сервере пока нет ни одного тега.</p>
        ) : (
          <div className="kt-interests">
            {tags.map((t) => {
              const active = selected.has(t.id)
              return (
                <button
                  key={t.id}
                  className={`kt-chip ${active ? 'kt-chip--active' : ''}`}
                  onClick={() => toggleTag(t.id)}
                >
                  {active && <Icon name="check" size={13} strokeWidth={3} />} {t.name}
                </button>
              )
            })}
          </div>
        )}

        <p className="kt-field__hint" style={{ marginTop: 16 }}>
          Выбрано: {selected.size}
        </p>
        <p className="kt-field__hint" style={{ marginTop: 6 }}>
          Пока сохраняется только в этом браузере: на сервере есть ручка, чтобы
          прочитать отмеченные интересы, но нет ручки, чтобы их записать.
        </p>
      </div>
    </div>
  )
}
