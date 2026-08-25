import { useState } from 'react'
import Icon from '../ui/Icon'

// Общие вопросы + отдельные под роль
const COMMON = [
  {
    q: 'Как записаться на событие?',
    a: 'Откройте страницу события в каталоге, выберите удобный сеанс и нажмите «Записаться». Подтверждение придёт в подключённый мессенджер.',
  },
  {
    q: 'Куда приходят напоминания?',
    a: 'В разделе «Настройки» можно подключить Telegram и/или MAX. Туда придут подтверждение записи и напоминание за 24 часа до события.',
  },
  {
    q: 'Не приходят уведомления — что делать?',
    a: 'Проверьте, что бот подключён в «Настройках» и что вы не остановили его в мессенджере. Нажмите «Проверить статус», чтобы обновить подключение.',
  },
  {
    q: 'Как сменить пароль?',
    a: 'Раздел «Настройки» → «Смена пароля»: введите текущий пароль, затем дважды новый.',
  },
]

const CLIENT = [
  {
    q: 'Как отменить запись?',
    a: 'В разделе «Мои события» откройте нужное событие и нажмите «Отменить запись». Если у события есть правила возврата, они будут показаны там же.',
  },
  {
    q: 'Как работают интересы?',
    a: 'В разделе «Интересы» отметьте близкие темы — события с этими тегами поднимутся выше в каталоге и получат отметку «подобрано для вас».',
  },
]

const ORGANIZER = [
  {
    q: 'Как создать событие?',
    a: 'Сначала заполните анкету студии в разделе «Профиль» (название и хотя бы одна соцсеть). После этого станет доступна кнопка «Создать событие».',
  },
  {
    q: 'Зачем нужна анкета студии?',
    a: 'Название, описание и соцсети студии клиенты видят на странице события. Без анкеты создание событий заблокировано.',
  },
  {
    q: 'Где посмотреть участников события?',
    a: 'В «Моих событиях» нажмите на событие — откроется страница со списком записавшихся и возможностью выгрузить его.',
  },
]

export default function HelpSection({ role = 'client' }) {
  const [open, setOpen] = useState(0)
  const [query, setQuery] = useState('')

  const list = [...COMMON, ...(role === 'organizer' ? ORGANIZER : CLIENT)]
  const q = query.trim().toLowerCase()
  const filtered = q
    ? list.filter((i) => i.q.toLowerCase().includes(q) || i.a.toLowerCase().includes(q))
    : list

  return (
    <div className="kt-cabsection">
      <div className="kt-panel">
        <div className="kt-cabsection__title" style={{ marginBottom: 6 }}>
          Помощь
        </div>
        <p className="kt-field__hint" style={{ marginBottom: 16 }}>
          Частые вопросы. Не нашли ответ — напишите в поддержку, блок ниже.
        </p>

        <label className="kt-help__search">
          <Icon name="search" size={16} />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(-1)
            }}
            placeholder="Поиск по вопросам"
          />
        </label>

        <div className="kt-faq" style={{ marginTop: 16 }}>
          {filtered.length === 0 && (
            <p className="kt-field__hint">Ничего не нашлось. Попробуйте иначе или напишите в поддержку.</p>
          )}
          {filtered.map((item, i) => {
            const isOpen = open === i
            return (
              <div key={item.q} className={`kt-faq__item ${isOpen ? 'is-open' : ''}`}>
                <button className="kt-faq__q" onClick={() => setOpen(isOpen ? -1 : i)}>
                  <span>{item.q}</span>
                  <Icon name={isOpen ? 'chevronUp' : 'chevronDown'} size={18} />
                </button>
                {isOpen && <div className="kt-faq__a">{item.a}</div>}
              </div>
            )
          })}
        </div>
      </div>

      {/* Блок поддержки */}
      <div className="kt-panel" style={{ marginTop: 20 }}>
        <div className="kt-cabsection__title" style={{ marginBottom: 6 }}>
          Не нашли ответ?
        </div>
        <p className="kt-field__hint" style={{ marginBottom: 16 }}>
          Напишите нам — ответим в течение дня, поддержка работает Пн–Вс, 10:00–22:00 (МСК).
        </p>
        <div className="kt-help__contacts">
          <a className="kt-help__contact" href="mailto:help@site.ru">
            <Icon name="mail" size={18} />
            <div>
              <div className="kt-help__contact-name">Почта</div>
              <div className="kt-help__contact-val">help@site.ru</div>
            </div>
          </a>
          <a className="kt-help__contact" href="tel:+79991234567">
            <Icon name="phone" size={18} />
            <div>
              <div className="kt-help__contact-name">Телефон</div>
              <div className="kt-help__contact-val">+7 (999) 123-45-67</div>
            </div>
          </a>
          <a className="kt-help__contact" href="https://t.me/" target="_blank" rel="noreferrer">
            <Icon name="telegram" size={18} />
            <div>
              <div className="kt-help__contact-name">Telegram</div>
              <div className="kt-help__contact-val">@kalendart_support</div>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}
