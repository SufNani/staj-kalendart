import { useState } from 'react'
import { useProfile } from '../../store/ProfileContext'
import Icon from '../ui/Icon'

function PasswordCard() {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [msg, setMsg] = useState({ text: '', ok: false })
  const [show, setShow] = useState(false)

  function submit(e) {
    e.preventDefault()
    if (!form.current || !form.next || !form.confirm) {
      setMsg({ text: 'Заполните все поля.', ok: false })
      return
    }
    if (form.next.length < 6) {
      setMsg({ text: 'Новый пароль слишком короткий (минимум 6 символов).', ok: false })
      return
    }
    if (form.next !== form.confirm) {
      setMsg({ text: 'Новый пароль и подтверждение не совпадают.', ok: false })
      return
    }
    // Саму проверку пароля вернёт бэкенд; на фронте — совпадение и длина.
    setMsg({ text: 'Пароль обновлён.', ok: true })
    setForm({ current: '', next: '', confirm: '' })
  }

  return (
    <div className="kt-panel">
      <div className="kt-cabsection__title" style={{ marginBottom: 18 }}>Смена пароля</div>
      <form className="kt-formgrid" onSubmit={submit}>
        <div className="kt-field kt-formgrid--full">
          <label className="kt-field__label" htmlFor="st-cur">Текущий пароль</label>
          <div className="kt-pwd">
            <input id="st-cur" type={show ? 'text' : 'password'} className="kt-input" value={form.current}
              onChange={(e) => setForm({ ...form, current: e.target.value })} />
            <button type="button" className="kt-pwd__toggle" onClick={() => setShow((v) => !v)}
              aria-label={show ? 'Скрыть пароль' : 'Показать пароль'}>
              <Icon name={show ? 'eyeOff' : 'eye'} size={18} />
            </button>
          </div>
        </div>
        <div className="kt-field">
          <label className="kt-field__label" htmlFor="st-new">Новый пароль</label>
          <div className="kt-pwd">
            <input id="st-new" type={show ? 'text' : 'password'} className="kt-input" value={form.next}
              onChange={(e) => setForm({ ...form, next: e.target.value })} />
          </div>
        </div>
        <div className="kt-field">
          <label className="kt-field__label" htmlFor="st-conf">Повторите новый</label>
          <div className="kt-pwd">
            <input id="st-conf" type={show ? 'text' : 'password'} className="kt-input" value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
          </div>
        </div>
        {msg.text && (
          <div className="kt-formgrid--full"
            style={{ color: msg.ok ? 'var(--kt-free)' : 'var(--kt-danger)', fontWeight: 600, fontSize: 14 }}>
            {msg.text}
          </div>
        )}
        <div className="kt-formgrid--full">
          <button type="submit" className="kt-btn kt-btn--gold">Обновить пароль</button>
        </div>
      </form>
    </div>
  )
}

/* Карточка мессенджера: Не подключено -> Подключить -> (ушли в бота) ->
   Проверить статус -> Подключено -> Отключить */
function NotifyCard({ icon, name, hint, link, connected, onSetConnected }) {
  const [pending, setPending] = useState(false)

  function connect() {
    setPending(true)
    window.open(link, '_blank', 'noopener') // диплинк в бота (заглушка)
  }
  function check() {
    // В демо считаем, что пользователь нажал Start в боте.
    setPending(false)
    onSetConnected(true)
  }
  function disconnect() {
    setPending(false)
    onSetConnected(false)
  }

  return (
    <div className="kt-notify">
      <div className="kt-notify__top">
        <div className="kt-notify__name">
          <Icon name={icon} size={18} /> {name}
        </div>
        {connected && (
          <span className="kt-notify__badge">
            <Icon name="check" size={14} strokeWidth={3} /> Подключено
          </span>
        )}
      </div>
      <p className="kt-notify__hint">{hint}</p>

      {connected ? (
        <button className="kt-btn kt-btn--ghost kt-btn--sm" onClick={disconnect}>Отключить</button>
      ) : pending ? (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="kt-btn kt-btn--gold kt-btn--sm" onClick={check}>Проверить статус</button>
          <button className="kt-btn kt-btn--ghost kt-btn--sm" onClick={() => setPending(false)}>Отмена</button>
        </div>
      ) : (
        <button className="kt-btn kt-btn--gold kt-btn--sm" onClick={connect}>Подключить</button>
      )}
      {pending && !connected && (
        <p className="kt-field__hint" style={{ marginTop: 8 }}>
          Откройте бота, нажмите «Start», затем — «Проверить статус».
        </p>
      )}
    </div>
  )
}

function DeleteCard() {
  const [confirm, setConfirm] = useState(false)
  return (
    <div className="kt-panel kt-panel--danger" style={{ marginTop: 20 }}>
      <div className="kt-cabsection__title" style={{ marginBottom: 6 }}>Удаление аккаунта</div>
      <p className="kt-field__hint" style={{ marginBottom: 16 }}>
        Действие необратимо: профиль, записи и история будут удалены.
      </p>
      {confirm ? (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, color: 'var(--kt-danger)' }}>Точно удалить аккаунт?</span>
          <button className="kt-btn kt-btn--danger kt-btn--sm">Да, удалить</button>
          <button className="kt-btn kt-btn--ghost kt-btn--sm" onClick={() => setConfirm(false)}>Отмена</button>
        </div>
      ) : (
        <button className="kt-btn kt-btn--danger kt-btn--sm" onClick={() => setConfirm(true)}>
          <Icon name="trash" size={16} /> Удалить аккаунт
        </button>
      )}
    </div>
  )
}

export default function SettingsSection() {
  const { profile, update } = useProfile()

  return (
    <div className="kt-cabsection">
      <PasswordCard />

      <div className="kt-panel" style={{ marginTop: 20 }}>
        <div className="kt-cabsection__title" style={{ marginBottom: 6 }}>Уведомления</div>
        <p className="kt-field__hint" style={{ marginBottom: 18 }}>
          Куда присылать подтверждения и напоминания о событиях. Можно подключить оба.
        </p>
        <div className="kt-notify__grid">
          <NotifyCard
            icon="telegram"
            name="Telegram"
            hint="Бот пришлёт подтверждение записи и напоминание за 24 часа."
            link="https://t.me/"
            connected={profile.notifyTelegram}
            onSetConnected={(v) => update({ notifyTelegram: v })}
          />
          <NotifyCard
            icon="bell"
            name="MAX"
            hint="То же самое в мессенджере MAX — на ваш выбор."
            link="https://max.ru/"
            connected={profile.notifyMax}
            onSetConnected={(v) => update({ notifyMax: v })}
          />
        </div>
      </div>

      <DeleteCard />
    </div>
  )
}
