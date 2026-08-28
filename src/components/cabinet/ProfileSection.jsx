import { useState, useEffect } from 'react'
import { useProfile } from '../../store/ProfileContext'
import { useAuth } from '../../store/AuthContext'
import { USE_MOCKS } from '../../config'
import { uploadMedia } from '../../api/events'
import CityCombobox from '../ui/CityCombobox'
import AvatarUpload from '../ui/AvatarUpload'
import Icon from '../ui/Icon'

const EMPTY_DRAFT = {
  name: '', phone: '', city: '',
  studioName: '', studioAbout: '', studioLogo: '', instagram: '', telegram: '', vk: '',
}

/**
 * Профиль. Для организатора дополнительно показывается анкета студии.
 * props: role: 'client' | 'organizer', highlightOrg (подсветить анкету, если пришли на неё принудительно)
 *
 * Два режима хранения:
 *  - демо (USE_MOCKS): всё живёт в ProfileContext (localStorage), сохраняется по каждой правке.
 *  - боевой: имя/телефон/город/анкета студии реально уходят на сервер
 *    (PATCH /api/users/profile) через AuthContext, по кнопке «Сохранить».
 *    Личного аватара в этой форме нет вообще — в API для него нет
 *    поля (профиль отдаёт только имя/телефон/город/анкету студии),
 *    поэтому загрузку убрали, а не оставили работать «только в браузере».
 */
export default function ProfileSection({ role, highlightOrg = false }) {
  const { profile, update } = useProfile()
  const { user: authUser, updateUser } = useAuth()
  const apiMode = !USE_MOCKS

  const [draft, setDraft] = useState(EMPTY_DRAFT)
  const [toast, setToast] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // подтягиваем текущие серверные значения в форму, когда профиль загрузился
  useEffect(() => {
    if (apiMode && authUser) {
      setDraft({
        name: authUser.name || '',
        phone: authUser.phone || '',
        city: authUser.city || '',
        studioName: authUser.studioName || '',
        studioAbout: authUser.studioAbout || '',
        studioLogo: authUser.studioLogo || '',
        instagram: authUser.instagram || '',
        telegram: authUser.telegram || '',
        vk: authUser.vk || '',
      })
    }
  }, [apiMode, authUser])

  const organizerReady = apiMode
    ? Boolean(authUser?.studioName?.trim()) &&
      Boolean(authUser?.instagram?.trim() || authUser?.telegram?.trim() || authUser?.vk?.trim())
    : Boolean(profile.studioName?.trim()) &&
      Boolean(profile.instagram?.trim() || profile.telegram?.trim() || profile.vk?.trim())

  function setField(key, value) {
    if (apiMode) setDraft((d) => ({ ...d, [key]: value }))
    else update({ [key]: value })
  }
  const val = (key) => (apiMode ? draft[key] : profile[key])

  async function save(patchKeys) {
    setError('')
    if (!apiMode) {
      setToast('Профиль сохранён')
      setTimeout(() => setToast(''), 1800)
      return
    }
    setBusy(true)
    try {
      const patch = Object.fromEntries(patchKeys.map((k) => [k, draft[k]]))
      await updateUser(patch)
      setToast('Сохранено на сервере')
      setTimeout(() => setToast(''), 1800)
    } catch (err) {
      setError(err.message || 'Не удалось сохранить.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="kt-cabsection">
      <div className="kt-panel">
        <div className="kt-cabsection__title" style={{ marginBottom: 20 }}>
          Профиль
        </div>

        <div className="kt-formgrid" style={{ marginTop: 2 }}>
          {apiMode ? (
            <div className="kt-field kt-formgrid--full">
              <label className="kt-field__label" htmlFor="pf-name">Имя</label>
              <input
                id="pf-name"
                className="kt-input"
                value={draft.name}
                onChange={(e) => setField('name', e.target.value)}
              />
            </div>
          ) : (
            <>
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
            </>
          )}
          <div className="kt-field">
            <label className="kt-field__label" htmlFor="pf-phone">Телефон</label>
            <input
              id="pf-phone"
              type="tel"
              className="kt-input"
              value={val('phone')}
              onChange={(e) => setField('phone', e.target.value)}
            />
          </div>
          <div className="kt-field">
            <label className="kt-field__label" htmlFor="pf-city">Город</label>
            <CityCombobox
              id="pf-city"
              value={val('city')}
              onChange={(v) => setField('city', v)}
            />
          </div>
        </div>

        {error && (
          <div style={{ color: 'var(--kt-danger)', fontSize: 14, fontWeight: 600, marginTop: 12 }}>
            {error}
          </div>
        )}

        <div style={{ marginTop: 20 }}>
          <button
            className="kt-btn kt-btn--gold"
            disabled={busy}
            onClick={() => save(['name', 'phone', 'city'])}
          >
            {busy ? 'Сохраняем…' : 'Сохранить профиль'}
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
            value={val('studioLogo')}
            onChange={(v) => setField('studioLogo', v)}
            initials="лого"
            label="Логотип студии"
            onUpload={apiMode ? uploadMedia : undefined}
          />
          {apiMode && (
            <p className="kt-field__hint" style={{ marginTop: 8 }}>
              Файл загружается на сервер сразу, а привязывается к профилю —
              по кнопке «Сохранить анкету» ниже.
            </p>
          )}

          <div className="kt-formgrid" style={{ marginTop: 22 }}>
            <div className="kt-field kt-formgrid--full">
              <label className="kt-field__label" htmlFor="pf-studio">
                Название студии / бренда
              </label>
              <input
                id="pf-studio"
                className="kt-input"
                value={val('studioName')}
                onChange={(e) => setField('studioName', e.target.value)}
                placeholder="Гончарная мастерская «art day»"
              />
            </div>
            <div className="kt-field kt-formgrid--full">
              <label className="kt-field__label" htmlFor="pf-about">Описание</label>
              <textarea
                id="pf-about"
                className="kt-textarea"
                value={val('studioAbout')}
                onChange={(e) => setField('studioAbout', e.target.value)}
                placeholder="Чем занимается студия, для кого мероприятия."
              />
            </div>

            <div className="kt-field">
              <label className="kt-field__label" htmlFor="pf-ig">Instagram</label>
              <input
                id="pf-ig"
                className="kt-input"
                value={val('instagram')}
                onChange={(e) => setField('instagram', e.target.value)}
                placeholder="@studio"
              />
            </div>
            <div className="kt-field">
              <label className="kt-field__label" htmlFor="pf-tg">Telegram</label>
              <input
                id="pf-tg"
                className="kt-input"
                value={val('telegram')}
                onChange={(e) => setField('telegram', e.target.value)}
                placeholder="@studio"
              />
            </div>
            <div className="kt-field">
              <label className="kt-field__label" htmlFor="pf-vk">ВКонтакте</label>
              <input
                id="pf-vk"
                className="kt-input"
                value={val('vk')}
                onChange={(e) => setField('vk', e.target.value)}
                placeholder="vk.com/studio"
              />
            </div>
          </div>

          <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              className="kt-btn kt-btn--gold"
              disabled={busy}
              onClick={() => save(['studioName', 'studioAbout', 'studioLogo', 'instagram', 'telegram', 'vk'])}
            >
              {busy ? 'Сохраняем…' : 'Сохранить анкету'}
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
