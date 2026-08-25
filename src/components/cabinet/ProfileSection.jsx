import { useState } from 'react'
import { useProfile } from '../../store/ProfileContext'
import CityCombobox from '../ui/CityCombobox'
import AvatarUpload from '../ui/AvatarUpload'
import Icon from '../ui/Icon'

/**
 * Профиль. Для организатора дополнительно показывается анкета студии.
 * props: role: 'client' | 'organizer', highlightOrg (подсветить анкету, если пришли на неё принудительно)
 */
export default function ProfileSection({ role, highlightOrg = false }) {
  const { profile, update, initials, organizerReady } = useProfile()
  const [toast, setToast] = useState('')

  function save() {
    // Данные уже сохраняются в контекст на каждом изменении.
    setToast('Профиль сохранён')
    setTimeout(() => setToast(''), 1800)
  }

  return (
    <div className="kt-cabsection">
      <div className="kt-panel">
        <div className="kt-cabsection__title" style={{ marginBottom: 20 }}>
          Профиль
        </div>

        <AvatarUpload
          value={profile.avatar}
          onChange={(v) => update({ avatar: v })}
          initials={initials}
          label="Загрузить аватар"
        />

        <div className="kt-formgrid" style={{ marginTop: 22 }}>
          <div className="kt-field">
            <label className="kt-field__label" htmlFor="pf-first">Имя</label>
            <input
              id="pf-first"
              className="kt-input"
              value={profile.firstName}
              onChange={(e) => update({ firstName: e.target.value })}
            />
          </div>
          <div className="kt-field">
            <label className="kt-field__label" htmlFor="pf-last">Фамилия</label>
            <input
              id="pf-last"
              className="kt-input"
              value={profile.lastName}
              onChange={(e) => update({ lastName: e.target.value })}
            />
          </div>
          <div className="kt-field">
            <label className="kt-field__label" htmlFor="pf-phone">Телефон</label>
            <input
              id="pf-phone"
              type="tel"
              className="kt-input"
              value={profile.phone}
              onChange={(e) => update({ phone: e.target.value })}
            />
          </div>
          <div className="kt-field">
            <label className="kt-field__label" htmlFor="pf-city">Город</label>
            <CityCombobox
              id="pf-city"
              value={profile.city}
              onChange={(v) => update({ city: v })}
            />
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <button className="kt-btn kt-btn--gold" onClick={save}>
            Сохранить профиль
          </button>
        </div>
      </div>

      {/* Анкета организатора */}
      {role === 'organizer' && (
        <div
          className={`kt-panel ${highlightOrg && !organizerReady ? 'kt-panel--flag' : ''}`}
          style={{ marginTop: 20 }}
        >
          <div className="kt-cabsection__title" style={{ marginBottom: 6 }}>
            Анкета студии
          </div>
          <p className="kt-field__hint" style={{ marginBottom: 20 }}>
            Заполните до создания первого события — клиенты увидят это на странице события.
            {!organizerReady && (
              <span style={{ color: 'var(--kt-danger)', fontWeight: 600 }}>
                {' '}Нужны название и хотя бы одна соцсеть.
              </span>
            )}
          </p>

          <AvatarUpload
            value={profile.studioLogo}
            onChange={(v) => update({ studioLogo: v })}
            initials="лого"
            label="Логотип студии"
          />

          <div className="kt-formgrid" style={{ marginTop: 22 }}>
            <div className="kt-field kt-formgrid--full">
              <label className="kt-field__label" htmlFor="pf-studio">
                Название студии / бренда
              </label>
              <input
                id="pf-studio"
                className="kt-input"
                value={profile.studioName}
                onChange={(e) => update({ studioName: e.target.value })}
                placeholder="Гончарная мастерская «art day»"
              />
            </div>
            <div className="kt-field kt-formgrid--full">
              <label className="kt-field__label" htmlFor="pf-about">Описание</label>
              <textarea
                id="pf-about"
                className="kt-textarea"
                value={profile.studioAbout}
                onChange={(e) => update({ studioAbout: e.target.value })}
                placeholder="Чем занимается студия, для кого мероприятия."
              />
            </div>

            <div className="kt-field">
              <label className="kt-field__label" htmlFor="pf-ig">Instagram</label>
              <input
                id="pf-ig"
                className="kt-input"
                value={profile.instagram}
                onChange={(e) => update({ instagram: e.target.value })}
                placeholder="@studio"
              />
            </div>
            <div className="kt-field">
              <label className="kt-field__label" htmlFor="pf-tg">Telegram</label>
              <input
                id="pf-tg"
                className="kt-input"
                value={profile.telegram}
                onChange={(e) => update({ telegram: e.target.value })}
                placeholder="@studio"
              />
            </div>
            <div className="kt-field">
              <label className="kt-field__label" htmlFor="pf-vk">ВКонтакте</label>
              <input
                id="pf-vk"
                className="kt-input"
                value={profile.vk}
                onChange={(e) => update({ vk: e.target.value })}
                placeholder="vk.com/studio"
              />
            </div>
          </div>

          <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
            <button className="kt-btn kt-btn--gold" onClick={save}>
              Сохранить анкету
            </button>
            {organizerReady && (
              <span style={{ color: 'var(--kt-free)', fontWeight: 600, display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                <Icon name="check" size={16} strokeWidth={3} /> Анкета заполнена
              </span>
            )}
          </div>
        </div>
      )}

      {toast && (
        <div className="kt-toast">
          <Icon name="check" size={18} strokeWidth={3} /> {toast}
        </div>
      )}
    </div>
  )
}
