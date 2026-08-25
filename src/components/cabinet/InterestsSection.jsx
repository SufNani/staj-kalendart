import { useProfile } from '../../store/ProfileContext'
import { CATEGORIES } from '../../data/events'
import Icon from '../ui/Icon'

export default function InterestsSection() {
  const { profile, toggleInterest } = useProfile()

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
