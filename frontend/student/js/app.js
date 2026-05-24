/* =========================================================
   Student Mini App — main logic
   - Подгружает группы из API
   - Проверяет, не отправлял ли уже этот пользователь заявку
   - Отправляет форму
   - Переключает view: form ↔ pending ↔ confirmed ↔ rejected
   ========================================================= */
import {
  listGroups,
  createStudent,
  getMyStatus,
} from '../../shared/js/api.js';

/* ---------- Telegram WebApp init ---------- */
const tg = window.Telegram?.WebApp;
tg?.ready();
tg?.expand();
// для удобства разработки берём фейковый telegram_id, если открыли в браузере
const tgUser = tg?.initDataUnsafe?.user;
const TELEGRAM_ID = tgUser?.id ?? Number(localStorage.getItem('dev_tg_id') || 9999);

/* ---------- DOM refs ---------- */
const views = {
  form:      document.querySelector('[data-view="form"]'),
  pending:   document.querySelector('[data-view="pending"]'),
  confirmed: document.querySelector('[data-view="confirmed"]'),
  rejected:  document.querySelector('[data-view="rejected"]'),
};
const form = document.getElementById('reg-form');
const submitBtn = document.getElementById('submit-btn');
const groupSelect = document.getElementById('group_id');
const fullNameInput = document.getElementById('full_name');
const phoneInput = document.getElementById('phone');
const pendingCard = document.getElementById('pending-card');
const confirmedCard = document.getElementById('confirmed-card');

let groupsCache = [];

/* ---------- View switcher ---------- */
function showView(name) {
  Object.entries(views).forEach(([k, el]) => {
    el.hidden = k !== name;
  });
}

/* ---------- Toast ---------- */
let toastTimer;
function toast(text, type = 'success') {
  const t = document.getElementById('toast');
  document.getElementById('toast-text').textContent = text;
  t.classList.remove('error', 'pending');
  if (type !== 'success') t.classList.add(type);
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2500);
}

/* ---------- Render status card ---------- */
function renderStatusCard(container, student) {
  const group = groupsCache.find(g => g.id === student.group_id);
  const isConfirmed = student.status === 'active';
  container.innerHTML = `
    <div class="status-row"><span class="k">Ism</span><span class="v">${student.full_name}</span></div>
    <div class="status-row"><span class="k">Telefon</span><span class="v">${student.phone}</span></div>
    <div class="status-row"><span class="k">Guruh</span><span class="v">${group ? group.name : '—'}</span></div>
    <div class="status-row">
      <span class="k">Status</span>
      <span class="badge ${isConfirmed ? 'badge-active' : 'badge-pending'}">
        ${isConfirmed ? 'Active' : 'Pending'}
      </span>
    </div>
  `;
}

/* ---------- Init: проверяем статус и грузим группы ---------- */
async function init() {
  try {
    // если пользователь уже отправлял заявку — сразу показываем её статус
    const existing = await getMyStatus(TELEGRAM_ID);
    if (existing) {
      if (existing.status === 'active') {
        // нужны группы для отображения названия
        groupsCache = await listGroups();
        renderStatusCard(confirmedCard, existing);
        showView('confirmed');
        return;
      }
      if (existing.status === 'rejected') {
        showView('rejected');
        return;
      }
      if (existing.status === 'pending') {
        groupsCache = await listGroups();
        renderStatusCard(pendingCard, existing);
        showView('pending');
        return;
      }
    }

    // нового пользователя — показываем форму, заполняем select
    groupsCache = await listGroups();
    groupSelect.innerHTML =
      '<option value="">Guruhni tanlang...</option>' +
      groupsCache.map(g => `<option value="${g.id}">${g.name}</option>`).join('');

    // если Telegram передал имя — подставим
    if (tgUser?.first_name) {
      const last = tgUser.last_name ? ' ' + tgUser.last_name : '';
      fullNameInput.value = tgUser.first_name + last;
    }
  } catch (err) {
    console.error(err);
    toast("Ma'lumotlarni yuklab bo'lmadi", 'error');
  }
}

/* ---------- Form submit ---------- */
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!form.reportValidity()) return;

  const payload = {
    full_name: fullNameInput.value.trim(),
    phone: '+998' + phoneInput.value.replace(/\D/g, ''),
    group_id: Number(groupSelect.value),
    telegram_id: TELEGRAM_ID,
  };

  submitBtn.classList.add('loading');
  submitBtn.disabled = true;

  try {
    const student = await createStudent(payload);
    renderStatusCard(pendingCard, student);
    toast('Ariza yuborildi', 'pending');
    setTimeout(() => showView('pending'), 400);
  } catch (err) {
    console.error(err);
    toast("Yuborishda xatolik yuz berdi", 'error');
  } finally {
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
  }
});

/* ---------- Back button ---------- */
document.getElementById('back-btn').addEventListener('click', () => {
  if (tg) tg.close();
});

/* ---------- Go ---------- */
init();
