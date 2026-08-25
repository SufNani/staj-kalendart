import { useLocation, Link } from 'react-router-dom'
import Icon from '../components/ui/Icon'
import { priceLabel } from '../data/events'

export default function BookingConfirmPage() {
  const { state } = useLocation()

  if (!state) {
    return (
      <div className="kt-container kt-confirm">
        <h1 className="kt-confirm__title">Здесь появится подтверждение записи</h1>
        <p style={{ color: 'var(--kt-ink-soft)', marginBottom: 24 }}>
          Сначала выберите событие и оставьте заявку.
        </p>
        <Link to="/catalog" className="kt-btn kt-btn--gold">
          Перейти в каталог
        </Link>
      </div>
    )
  }

  return (
    <div className="kt-container kt-confirm">
      <div className="kt-confirm__check">
        <Icon name="check" size={38} strokeWidth={3} />
      </div>
      <h1 className="kt-confirm__title">Привет, {state.name}! Вы записаны 🎉</h1>
      <p style={{ color: 'var(--kt-ink-soft)', marginBottom: 24 }}>
        Мы отправили подтверждение на «{state.contact}». Напоминание придёт за 24 часа до начала.
      </p>

      <div className="kt-panel" style={{ textAlign: 'left' }}>
        <div className="kt-confirm__row">
          <span>Мероприятие</span>
          <span>{state.eventTitle}</span>
        </div>
        <div className="kt-confirm__row">
          <span>Организатор</span>
          <span>{state.org}</span>
        </div>
        <div className="kt-confirm__row">
          <span>Когда</span>
          <span>
            {state.session.dayLabel}, {state.session.timeLabel}
          </span>
        </div>
        <div className="kt-confirm__row">
          <span>Где</span>
          <span>
            {state.city}, {state.address}
          </span>
        </div>
        <div className="kt-confirm__row">
          <span>Стоимость</span>
          <span>{priceLabel(state.price)}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 }}>
        <Link to="/client" className="kt-btn kt-btn--gold">
          Мои события
        </Link>
        <Link to="/catalog" className="kt-btn kt-btn--ghost">
          В каталог
        </Link>
      </div>

      <p className="kt-field__hint" style={{ marginTop: 20 }}>
        Вопросы по записи: help@site.ru · +7 (999) 123-45-67
      </p>
    </div>
  )
}
