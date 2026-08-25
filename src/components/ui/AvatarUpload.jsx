import { useRef } from 'react'
import Icon from './Icon'

/**
 * Кружок с превью аватара/логотипа + кнопка загрузки.
 * Без бэкенда: читаем файл в dataURL для превью.
 * props: value (dataURL), onChange(dataURL), initials, label
 */
export default function AvatarUpload({ value, onChange, initials = '', label = 'Загрузить фото' }) {
  const inputRef = useRef(null)

  function onFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => onChange(reader.result)
    reader.readAsDataURL(file)
  }

  return (
    <div className="kt-avaupload">
      <div className="kt-avaupload__circle">
        {value ? (
          <img src={value} alt="" />
        ) : (
          <span className="kt-avaupload__initials">{initials || 'фото'}</span>
        )}
      </div>
      <div>
        <button
          type="button"
          className="kt-btn kt-btn--ghost kt-btn--sm"
          onClick={() => inputRef.current?.click()}
        >
          <Icon name="plus" size={16} /> {label}
        </button>
        {value && (
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
          onChange={onFile}
        />
      </div>
    </div>
  )
}
