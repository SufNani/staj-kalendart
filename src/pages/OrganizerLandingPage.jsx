import { useState } from "react";
import "./OrganizerLandingPage.css";

export default function OrganizerLandingPage() {

  const [format, setFormat] = useState("");
  const [type, setType] = useState("");

  return (
    <main className="organizer">

      <section className="hero">

        <div className="hero-text">

          <h1>
            КалендАрт это
            <br />
            сервис для лёгкой организации событий
          </h1>

          <p>
            Хочешь знать, чем живёт твой город? Мы собираем и создаём самые яркие
            события — от уютных камерных встреч до масштабных фестивалей.
          </p>

          <button className="yellow-btn">
            Создать своё первое событие
          </button>

        </div>

      </section>


            <section className="register">

        <h2>Зарегистрируйтесь</h2>

        <p>
          создавай и находи события в своём городе!
        </p>

        <div className="cards">

          {/* Регистрация */}
          <div className="card register-card">

            <div className="register-window">

              <input
                type="text"
                placeholder="Имя"
              />

              <input
                type="email"
                placeholder="E-mail"
              />

              <input
                type="password"
                placeholder="Пароль"
              />

              <button className="yellow-btn">
                Регистрация
              </button>

            </div>

          </div>

          {/* Возможности */}
          <div className="card">

            <div className="feature-list">

              <div className="feature-item">
                ✓ Создание мероприятий
              </div>

              <div className="feature-item">
                ✓ Продажа билетов
              </div>

              <div className="feature-item">
                ✓ Аналитика
              </div>

              <div className="feature-item">
                ✓ Управление участниками
              </div>

            </div>

          </div>

          {/* Карта */}
          <div className="card payment-card">

            <div className="bank-card">

              <div className="bank-title">
                Банковская карта
              </div>

              <input
                type="text"
                placeholder="1234 5678 9012 3456"
              />

              <div className="bank-row">

                <input
                  type="text"
                  placeholder="MM/YY"
                />

                <input
                  type="text"
                  placeholder="CVV"
                />

              </div>

              <input
                type="text"
                placeholder="Имя владельца"
              />

            </div>

          </div>

        </div>

      </section>


      <section className="tariffs">

        <h2>Тарифы</h2>

        <div className="tariff-list">

          <div className="tariff">

            <h3>Ноль</h3>

            <div className="tariff-text">
              Текст
            </div>

            <button className="price-btn">
              Цена
            </button>

          </div>

          <div className="tariff">

            <h3>Пятьдесят</h3>

            <div className="tariff-text">
              Текст
            </div>

            <button className="price-btn">
              Цена
            </button>

          </div>

          <div className="tariff">

            <h3>VIP</h3>

            <div className="tariff-text">
              Текст
            </div>

            <button className="price-btn">
              Цена
            </button>

          </div>

        </div>

      </section>


      <section className="quiz">

        <h2>
          Ответьте на два вопроса, чтобы узнать о сервисах именно
          <br />
          для вашего события
        </h2>

        <p className="question">
          Вы организуете мероприятие онлайн или офлайн?
        </p>

        
          <div className="online-buttons">

            <button
              className={format === "online" ? "quiz-btn active" : "quiz-btn"}
              onClick={() => setFormat("online")}
            >
              Онлайн
            </button>

            <button
              className={format === "offline" ? "quiz-btn active" : "quiz-btn"}
              onClick={() => setFormat("offline")}
            >
              Офлайн
            </button>

          </div>

                <div className="tags">

          <button
            className={type === "conference" ? "active-tag" : ""}
            onClick={() => setType("conference")}
          >
            Конференция
          </button>

          <button
            className={type === "training" ? "active-tag" : ""}
            onClick={() => setType("training")}
          >
            Тренинг
          </button>

          <button
            className={type === "webinar" ? "active-tag" : ""}
            onClick={() => setType("webinar")}
          >
            Вебинар
          </button>

          <button
            className={type === "course" ? "active-tag" : ""}
            onClick={() => setType("course")}
          >
            Курс
          </button>

          <button
            className={type === "corp" ? "active-tag" : ""}
            onClick={() => setType("corp")}
          >
            Корпоративное событие
          </button>

          <button
            className={type === "other" ? "active-tag" : ""}
            onClick={() => setType("other")}
          >
            Другое
          </button>

        </div>

      </section>


      <section className="cta">

        <div className="cta-left">

          <h2>
            Создайте своё первое мероприятие
          </h2>

          <button className="yellow-btn">
            Создать своё первое событие
          </button>

          <button className="purple-btn">
            Узнать про возможности для крупных событий
          </button>

        </div>

        <div className="cta-right">

          <div className="preview"></div>

        </div>

      </section>

    </main>
  );
}