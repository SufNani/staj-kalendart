import { useRef, useState } from 'react'
import Icon from './Icon'

/**
 * Кружок с превью аватара/логотипа + кнопка загрузки.
 *
 * По умолчанию (без onUpload) — читаем файл в dataURL, превью живёт
 * только в браузере. Если передан onUpload — реальная загрузка на
 * сервер (например, uploadMedia() из src/api/events.js): файл уходит
 * на POST /api/media/, в value попадает ссылка, которую вернул сервер.
 *
 * props: value (dataURL/ссылка), onChange(value), initials, label,
 *        onUpload?: (file) => Promise<url>
 */
export default function AvatarUpload({
  value,
  onChange,
  initials = '',
  label = 'Загрузить фото',
  onUpload,
}) {
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  function onFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')

    if (!onUpload) {
      const reader = new FileReader()
      reader.onload = () => onChange(reader.result)
      reader.readAsDataURL(file)
      return
    }

    setBusy(true)
    onUpload(file)
      .then((url) => onChange(url))
      .catch((err) => setError(err.message || 'Не удалось загрузить файл.'))
      .finally(() => setBusy(false))
  }

  return (
    <div className="kt-avaupload">
      <div className="kt-avaupload__circle">
        {value ? (
          <img src={value} alt="" />
        ) : (
          <span className="kt-avaupload__initials">{busy ? '…' : initials || 'фото'}</span>
        )}
      </div>
      <div>
        <button
          type="button"
          className="kt-btn kt-btn--ghost kt-btn--sm"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
        >
          <Icon name="plus" size={16} /> {busy ? 'Загружаем…' : label}
        </button>
        {value && !busy && (
          <button
            type="button"
            className="kt-avaupload__remove"
            onClick={() => onChange('')}
          >
            Удалить
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          disabled={busy}
          onChange={onFile}
        />
        {error && (
          <p className="kt-field__hint" style={{ color: 'var(--kt-danger)', marginTop: 8 }}>
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
