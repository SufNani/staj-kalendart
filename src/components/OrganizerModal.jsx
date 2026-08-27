import { useEffect } from 'react'
import Icon from './ui/Icon'

/**
 * Окно с информацией об организаторе события.
 * props: organizer: {
 *   name, initials, logo, city, about,
 *   instagram, telegram, vk,
 *   incomplete: true — если полного профиля нет (честно об этом пишем,
 *   не показываем выдуманные данные)
 * }
 */
export default function OrganizerModal({ organizer, onClose }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose])

  if (!organizer) return null

  const hasSocials = organizer.instagram || organizer.telegram || organizer.vk

  return (
    <div className="kt-modal-overlay" onClick={onClose}>
      <div className="kt-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className="kt-modal__close" onClick={onClose} aria-label="Закрыть">
          <Icon name="close" size={20} />
        </button>

        <div className="kt-modal__org-head">
          <div className="kt-modal__org-logo">
            {organizer.logo ? (
              <img src={organizer.logo} alt="" />
            ) : (
              <span>{organizer.initials}</span>
            )}
          </div>
          <div>
            <div className="kt-modal__org-name">{organizer.name}</div>
            {organizer.city && <div className="kt-modal__org-city">{organizer.city}</div>}
          </div>
        </div>

        {organizer.about ? (
          <p className="kt-modal__org-about">{organizer.about}</p>
        ) : (
          <p className="kt-field__hint" style={{ marginTop: 4 }}>
            {organizer.incomplete
              ? 'Организатор пока не заполнил описание студии.'
              : 'Профиль организатора недоступен для просмотра.'}
          </p>
        )}

        {hasSocials && (
          <div className="kt-modal__org-socials">
            {organizer.instagram && (
              <a href={`https://instagram.com/${organizer.instagram.replace('@', '')}`} target="_blank" rel="noreferrer">
                <Icon name="instagram" size={18} /> {organizer.instagram}
              </a>
            )}
            {organizer.telegram && (
              <a href={`https://t.me/${organizer.telegram.replace('@', '')}`} target="_blank" rel="noreferrer">
                <Icon name="telegram" size={18} /> {organizer.telegram}
              </a>
            )}
            {organizer.vk && (
              <a href={organizer.vk.startsWith('http') ? organizer.vk : `https://${organizer.vk}`} target="_blank" rel="noreferrer">
                <Icon name="vk" size={18} /> {organizer.vk}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
