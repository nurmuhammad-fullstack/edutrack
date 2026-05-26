/* =========================================================
   EduTrack — API Client (Mock + Real toggle)
   ---------------------------------------------------------
   Когда backend будет готов:
     1) USE_MOCK = false
     2) API_BASE = адрес backend (например http://localhost:3001/api)
   Сигнатуры функций совпадают с теми, что отдаст реальный API.
   ========================================================= */

const USE_MOCK = false;
const API_BASE = 'https://edutrack-905v.onrender.com/api';

/* ---------------- Mock storage layer ---------------- */
const STORAGE_KEY = 'edutrack_db';

const SEED = {
  groups: [
    { id: 1, name: "1-guruh · Boshlang'ich", monthly_fee: 450000 },
    { id: 2, name: "2-guruh · O'rta",        monthly_fee: 500000 },
    { id: 3, name: "3-guruh · Yuqori",       monthly_fee: 600000 },
  ],
  students: [
    // Active
    { id: 1024, full_name: "Sevinch Xolmatova", phone: "+998901112233", group_id: 1, status: 'active', telegram_id: null, created_at: '2026-04-12T10:00:00Z' },
    { id: 1025, full_name: "Bekzod Toshev",     phone: "+998932223344", group_id: 2, status: 'active', telegram_id: null, created_at: '2026-04-15T10:00:00Z' },
    { id: 1026, full_name: "Nodira Azizova",    phone: "+998973334455", group_id: 1, status: 'active', telegram_id: null, created_at: '2026-04-18T10:00:00Z' },
    { id: 1027, full_name: "Oybek Komilov",     phone: "+998884445566", group_id: 3, status: 'active', telegram_id: null, created_at: '2026-04-22T10:00:00Z' },
    { id: 1028, full_name: "Zarina Sodiqova",   phone: "+998905556677", group_id: 2, status: 'active', telegram_id: null, created_at: '2026-04-25T10:00:00Z' },
    // Pending (новые заявки для дашборда)
    { id: 2001, full_name: "Aziz Karimov",      phone: "+998905551234", group_id: 1, status: 'pending', telegram_id: 1001, created_at: '2026-05-24T14:32:00Z' },
    { id: 2002, full_name: "Madina Yusupova",   phone: "+998934127890", group_id: 2, status: 'pending', telegram_id: 1002, created_at: '2026-05-24T12:08:00Z' },
    { id: 2003, full_name: "Jasur Sobirov",     phone: "+998972206541", group_id: 1, status: 'pending', telegram_id: 1003, created_at: '2026-05-23T19:45:00Z' },
    { id: 2004, full_name: "Diyora Rahimova",   phone: "+998881023456", group_id: 3, status: 'pending', telegram_id: 1004, created_at: '2026-05-23T16:11:00Z' },
  ],
  payments: [
    { id: 1, student_id: 1024, month: 5, year: 2026, amount: 450000, paid_at: '2026-05-03T10:00:00Z', status: 'paid' },
    { id: 2, student_id: 1025, month: 5, year: 2026, amount: 500000, paid_at: '2026-05-05T10:00:00Z', status: 'paid' },
    { id: 3, student_id: 1026, month: 5, year: 2026, amount: 450000, paid_at: null, status: 'pending' },
    { id: 4, student_id: 1028, month: 5, year: 2026, amount: 500000, paid_at: '2026-05-08T10:00:00Z', status: 'paid' },
  ],
};

function db() {
  let raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED));
    raw = JSON.stringify(SEED);
  }
  return JSON.parse(raw);
}
function save(d) { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); }
function delay(ms = 300) { return new Promise(r => setTimeout(r, ms)); }

/* Утилита: сбросить mock-данные к исходным (для отладки) */
export function resetMockDB() {
  localStorage.removeItem(STORAGE_KEY);
}

/* ---------------- HTTP helper для реального режима ---------------- */
async function http(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  return res.json();
}

/* =========================================================
   PUBLIC API
   ========================================================= */

/** GET /api/groups */
export async function listGroups() {
  if (USE_MOCK) { await delay(); return db().groups; }
  return http('/groups');
}

/** POST /api/students  — новая заявка (status=pending) */
export async function createStudent({ full_name, phone, group_id, telegram_id = null }) {
  if (USE_MOCK) {
    await delay();
    const d = db();
    const student = {
      id: Date.now(),
      full_name, phone, group_id: Number(group_id), telegram_id,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    d.students.push(student);
    save(d);
    return student;
  }
  return http('/students', {
    method: 'POST',
    body: JSON.stringify({ full_name, phone, group_id, telegram_id }),
  });
}

/** GET /api/students/me?telegram_id=...  — проверить свой статус */
export async function getMyStatus(telegram_id) {
  if (USE_MOCK) {
    await delay();
    return db().students.find(s => s.telegram_id === telegram_id) || null;
  }
  return http(`/students/me?telegram_id=${telegram_id}`);
}

/** GET /api/students?status=...  — список (для тренера) */
export async function listStudents({ status } = {}) {
  if (USE_MOCK) {
    await delay();
    const all = db().students;
    return status ? all.filter(s => s.status === status) : all;
  }
  const q = status ? `?status=${status}` : '';
  return http(`/students${q}`);
}

/** PATCH /api/students/:id/confirm  — ✅ подтвердить */
export async function confirmStudent(id) {
  if (USE_MOCK) {
    await delay();
    const d = db();
    const s = d.students.find(x => x.id === id);
    if (s) { s.status = 'active'; save(d); }
    return s;
  }
  return http(`/students/${id}/confirm`, { method: 'PATCH' });
}

/** PATCH /api/students/:id/reject  — ❌ отклонить */
export async function rejectStudent(id) {
  if (USE_MOCK) {
    await delay();
    const d = db();
    const s = d.students.find(x => x.id === id);
    if (s) { s.status = 'rejected'; save(d); }
    return s;
  }
  return http(`/students/${id}/reject`, { method: 'PATCH' });
}

/** GET /api/payments?month=...&year=...  */
export async function listPayments({ month, year } = {}) {
  if (USE_MOCK) {
    await delay();
    let p = db().payments;
    if (month) p = p.filter(x => x.month === Number(month));
    if (year)  p = p.filter(x => x.year  === Number(year));
    return p;
  }
  const q = new URLSearchParams({ month, year }).toString();
  return http(`/payments?${q}`);
}
