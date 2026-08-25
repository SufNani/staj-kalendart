import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AuthPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    consent: false,
  })
  const [error, setError] = useState('')

  function submit(e) {
    e.preventDefault()
    setError('')
    if (!form.phone.trim() || !form.password.trim()) {
      setError('Введите телефон и пароль.')
      return
    }
    if (mode === 'register' && (!form.firstName.trim() || !form.lastName.trim())) {
      setError('Укажите имя и фамилию.')
      return
    }
    if (mode === 'register' && !form.consent) {
      setError('Нужно согласие на обработку персональных данных.')
      return
    }
    // Заглушка: бэкенда нет, просто ведём в кабинет организатора
    navigate('/organizer')
  }

  const isLogin = mode === 'login'

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

        <form className="kt-auth__form" onSubmit={submit}>
          {!isLogin && (
            <>
              <div className="kt-field">
                <label className="kt-field__label" htmlFor="au-first">
                  Имя
                </label>
                <input
                  id="au-first"
                  className="kt-input"
                  autoComplete="given-name"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  placeholder="Введите имя"
                />
              </div>
              <div className="kt-field">
                <label className="kt-field__label" htmlFor="au-last">
                  Фамилия
                </label>
                <input
                  id="au-last"
                  className="kt-input"
                  autoComplete="family-name"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  placeholder="Введите фамилию"
                />
              </div>
            </>
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

          <button type="submit" className="kt-btn kt-btn--gold kt-btn--block kt-btn--lg">
            {isLogin ? 'Войти' : 'Зарегистрироваться'}
          </button>

          {isLogin && (
            <div className="kt-auth__forgot">
              <a href="#">Забыли пароль?</a>
            </div>
          )}
        </form>

        <button
          type="button"
          className="kt-btn kt-btn--gold kt-btn--block kt-btn--lg"
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
