import { Link } from 'react-router-dom'

export function ContactsPage() {
  return (
    <div className="kt-container kt-section">
      <h1 className="kt-section__title">Контакты</h1>
      <p className="kt-section__lead">Мы на связи каждый день и рады помочь.</p>
      <div className="kt-panel" style={{ maxWidth: 560, marginTop: 24 }}>
        <div className="kt-confirm__row">
          <span>Служба поддержки</span>
          <span>+7 (999) 123-45-67</span>
        </div>
        <div className="kt-confirm__row">
          <span>Email</span>
          <span>help@site.ru</span>
        </div>
        <div className="kt-confirm__row">
          <span>Часы работы</span>
          <span>Пн–Вс, 10:00–22:00 (МСК)</span>
        </div>
      </div>
    </div>
  )
}

export function AboutPage() {
  return (
    <div className="kt-container kt-section">
      <h1 className="kt-section__title">О платформе</h1>
      <p className="kt-section__lead">
        КалендАрт помогает организаторам мастер-классов, кружков и занятий уйти от ручных таблиц
        и переписок к простому онлайн-инструменту записи. Организатор создаёт событие,
        публикует ссылку — клиент переходит по ней и записывается сам.
      </p>
      <div style={{ marginTop: 24 }}>
        <Link to="/catalog" className="kt-btn kt-btn--gold kt-btn--lg">
          Смотреть события
        </Link>
      </div>
    </div>
  )
}

export function NotFoundPage() {
  return (
    <div className="kt-container kt-section" style={{ textAlign: 'center', paddingBlock: 80 }}>
      <h1 className="kt-section__title">Страница не найдена</h1>
      <p className="kt-section__lead" style={{ margin: '16px auto 24px' }}>
        Возможно, ссылка устарела или страница переехала.
      </p>
      <Link to="/" className="kt-btn kt-btn--gold kt-btn--lg">
        На главную
      </Link>
    </div>
  )
}
