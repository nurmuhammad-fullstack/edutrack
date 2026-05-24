# EduTrack

Mini App + Web Dashboard для учёта посещаемости и оплаты учеников.
Заменяет Excel для частных репетиторов и небольших школ.

## Stack

| Слой       | Технология                       |
|------------|----------------------------------|
| Frontend   | Vanilla HTML / CSS / JS (ES modules) |
| Backend    | Node.js + Express (планируется)  |
| DB         | PostgreSQL (планируется)         |
| Bot        | node-telegram-bot-api (планируется) |

## Структура

```
edutrack/
├── frontend/
│   ├── shared/
│   │   ├── css/tokens.css      ← единые цвета, шрифты, тосты
│   │   └── js/api.js           ← API client (mock + real switch)
│   ├── student/                ← Telegram Mini App
│   │   ├── index.html
│   │   ├── css/student.css
│   │   └── js/app.js
│   └── trainer/                ← Web Dashboard
│       ├── index.html
│       ├── css/trainer.css
│       └── js/app.js
└── README.md
```

## Как запустить (только frontend, mock API)

Открыть оба приложения через локальный сервер (file:// не подходит для ES modules):

```bash
cd frontend
python3 -m http.server 8080
```

Затем:
- O'quvchi Mini App: <http://localhost:8080/student/>
- O'qituvchi panel: <http://localhost:8080/trainer/>

Заявка, отправленная из Mini App, появится у тренера (общий `localStorage`).

## Mock → Real backend

В файле `frontend/shared/js/api.js` есть переключатель:

```js
const USE_MOCK = true;                              // → false когда backend готов
const API_BASE = 'http://localhost:3001/api';
```

Контракты функций (`createStudent`, `listStudents`, `confirmStudent`, etc.) не изменятся — поменяется только реализация внутри.

## Сброс mock-данных

В DevTools консоли:

```js
localStorage.removeItem('edutrack_db');
location.reload();
```

## Поток данных (когда backend подключится)

```
Telegram → Mini App → POST /api/students {status:pending}
                    → запись в БД
Dashboard         ← GET /api/students?status=pending
Trainer ✅        → PATCH /api/students/:id/confirm
                    → status=active
                    → bot.sendMessage(telegram_id, "Tasdiqlandingiz")
```

## Что готово

- [x] Mini App: форма регистрации с валидацией
- [x] Mini App: 4 экрана (форма / pending / confirmed / rejected)
- [x] Mini App: интеграция с Telegram WebApp SDK
- [x] Dashboard: sidebar с навигацией и счётчиком заявок
- [x] Dashboard: stat-карточки (всего / faol / pending / to'lamagan)
- [x] Dashboard: pending карточки с ✅ / ❌
- [x] Dashboard: таблица faol o'quvchilar с фильтром по группам
- [x] Mock API + localStorage persistence

## Дальше

- [ ] Backend: Express server + pg
- [ ] Backend: маршруты `/students`, `/attendance`, `/payments`, `/groups`
- [ ] DB: применить `schema.sql`
- [ ] Bot: интеграция отправки сообщений при подтверждении
- [ ] Dashboard: экраны Davomat, To'lovlar, Guruhlar
