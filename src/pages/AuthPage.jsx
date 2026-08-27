import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../store/AuthContext'

export default function AuthPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from // куда шёл до того, как его перекинуло на вход
  const { login, register } = useAuth()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [role, setRole] = useState('organizer') // 'organizer' | 'client' — нужно для user_type при регистрации
  const [form, setForm] = useState({
    name: '',
    phone: '',
    password: '',
    consent: false,
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const isLogin = mode === 'login'

  async function submit(e) {
    e.preventDefault()
    setError('')
    if (!form.phone.trim() || !form.password.trim()) {
      setError('Введите телефон и пароль.')
      return
    }
    if (mode === 'register' && !form.name.trim()) {
      setError('Укажите имя.')
      return
    }
    if (mode === 'register' && !form.consent) {
      setError('Нужно согласие на обработку персональных данных.')
      return
    }

    setBusy(true)
    try {
      const payload = { ...form, role }
      const user = isLogin ? await login(payload) : await register(payload)
      const homePath = (user?.role || role) === 'organizer' ? '/organizer' : '/client'
      // возвращаем туда, откуда перекинуло, но только если это его раздел
      // (иначе, если ролью ошиблись, унесём в правильный кабинет, а не в чужой)
      const target = from && from.startsWith(homePath) ? from : homePath
      navigate(target)
    } catch (err) {
      setError(err.message || 'Не удалось выполнить вход. Попробуйте ещё раз.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="kt-auth">
      <div className="kt-auth__card">
        <div className="kt-auth__head">
          <h1 className="kt-auth__title">
            {isLogin ? 'Вход в аккаунт' : 'Регистрация'}
          </h1>
          <p className="kt-auth__welcome">
            {isLogin ? 'добро пожаловать!' : 'создайте аккаунт за пару шагов'}
          </p>
        </div>

        {/* Роль нужна и при входе, и при регистрации: бэкенд не знает
            роль по логину/паролю, у него это отдельное поле user_type,
            которое мы задаём один раз при регистрации. */}
        <div className="kt-roletabs">
          <button
            type="button"
            className={`kt-roletabs__tab ${role === 'organizer' ? 'is-active' : ''}`}
            onClick={() => setRole('organizer')}
          >
            Я организатор
          </button>
          <button
            type="button"
            className={`kt-roletabs__tab ${role === 'client' ? 'is-active' : ''}`}
            onClick={() => setRole('client')}
          >
            Я участник
          </button>
        </div>

        <form className="kt-auth__form" onSubmit={submit}>
          {!isLogin && (
            <div className="kt-field">
              <label className="kt-field__label" htmlFor="au-name">
                Имя
              </label>
              <input
                id="au-name"
                className="kt-input"
                autoComplete="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Иван Иванов"
              />
            </div>
          )}

          <div className="kt-field">
            <label className="kt-field__label" htmlFor="au-phone">
              Телефон
            </label>
            <input
              id="au-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              className="kt-input"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Введите номер"
            />
          </div>

          <div className="kt-field">
            <label className="kt-field__label" htmlFor="au-pass">
              Пароль
            </label>
            <input
              id="au-pass"
              type="password"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              className="kt-input"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Введите пароль"
            />
          </div>

          {!isLogin && (
            <label className="kt-checkline">
              <input
                type="checkbox"
                checked={form.consent}
                onChange={(e) => setForm({ ...form, consent: e.target.checked })}
              />
              <span>
                Я согласен(а) на обработку персональных данных и принимаю{' '}
                <a href="#">политику конфиденциальности</a>.
              </span>
            </label>
          )}

          {error && (
            <div style={{ color: 'var(--kt-danger)', fontSize: 14, fontWeight: 600 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="kt-btn kt-btn--gold kt-btn--block kt-btn--lg"
            disabled={busy}
          >
            {busy ? 'Подождите…' : isLogin ? 'Войти' : 'Зарегистрироваться'}
          </button>

          {isLogin && (
            <div className="kt-auth__forgot">
              <a href="#">Забыли пароль?</a>
            </div>
          )}
        </form>

        <button
          type="button"
          className="kt-btn kt-btn--ghost kt-btn--block kt-btn--lg"
          onClick={() => {
            setError('')
            setMode(isLogin ? 'register' : 'login')
          }}
        >
          {isLogin ? 'Зарегистрироваться' : 'Уже есть аккаунт — войти'}
        </button>
      </div>
    </div>
  )
}
