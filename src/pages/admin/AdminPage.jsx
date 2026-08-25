import { useState } from 'react'
import Icon from '../../components/ui/Icon'
import { EVENTS } from '../../data/events'
import { STATUS_LABEL } from '../../data/site'

const ORGS = [
  { name: 'Гончарная мастерская «art day»', email: 'ivanov@mail.ru', events: 4, blocked: false },
  { name: 'Арт-угол', email: 'artugol@mail.ru', events: 2, blocked: false },
  { name: 'Сладкий домик', email: 'sweet@mail.ru', events: 1, blocked: false },
  { name: 'Dance academy', email: 'dance@mail.ru', events: 3, blocked: true },
]

export default function AdminPage() {
  const [tab, setTab] = useState('orgs')
  const [orgs, setOrgs] = useState(ORGS)

  function toggleBlock(email) {
    setOrgs((prev) =>
      prev.map((o) => (o.email === email ? { ...o, blocked: !o.blocked } : o))
    )
  }

  return (
    <div className="kt-container" style={{ paddingBlock: 28 }}>
      <h1 style={{ fontSize: 28, marginBottom: 4 }}>Панель администратора</h1>
      <p className="kt-field__hint" style={{ marginBottom: 20 }}>
        Модерация организаторов и событий платформы.
      </p>

      <div className="kt-auth__tabs" style={{ maxWidth: 360, marginBottom: 20 }}>
        <button
          className={`kt-auth__tab ${tab === 'orgs' ? 'is-active' : ''}`}
          onClick={() => setTab('orgs')}
        >
          Организаторы
        </button>
        <button
          className={`kt-auth__tab ${tab === 'events' ? 'is-active' : ''}`}
          onClick={() => setTab('events')}
        >
          События
        </button>
      </div>

      <div className="kt-panel" style={{ overflowX: 'auto' }}>
        {tab === 'orgs' ? (
          <table className="kt-table">
            <thead>
              <tr>
                <th>Организатор</th>
                <th>Email</th>
                <th>Событий</th>
                <th>Статус</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orgs.map((o) => (
                <tr key={o.email}>
                  <td style={{ fontWeight: 600 }}>{o.name}</td>
                  <td className="kt-mono">{o.email}</td>
                  <td className="kt-mono">{o.events}</td>
                  <td>
                    <span className={`kt-status ${o.blocked ? 'kt-status--draft' : 'kt-status--pub'}`}>
                      {o.blocked ? 'Заблокирован' : 'Активен'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className={`kt-btn kt-btn--sm ${o.blocked ? 'kt-btn--gold' : 'kt-btn--danger'}`}
                      onClick={() => toggleBlock(o.email)}
                    >
                      {o.blocked ? 'Разблокировать' : 'Заблокировать'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="kt-table">
            <thead>
              <tr>
                <th>Событие</th>
                <th>Организатор</th>
                <th>Город</th>
                <th>Дата</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {EVENTS.map((e) => (
                <tr key={e.id}>
                  <td style={{ fontWeight: 600 }}>{e.title}</td>
                  <td>{e.org}</td>
                  <td>{e.city}</td>
                  <td className="kt-mono">{e.dateLabel}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button className="kt-iconbtn" aria-label="Скрыть">
                        <Icon name="thumbsDown" size={18} />
                      </button>
                      <button className="kt-iconbtn" aria-label="Удалить">
                        <Icon name="trash" size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
