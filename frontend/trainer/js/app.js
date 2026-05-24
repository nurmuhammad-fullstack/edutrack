/* =========================================================
   Trainer Dashboard — main logic
   ========================================================= */
import {
  listGroups,
  listStudents,
  confirmStudent,
  rejectStudent,
  listPayments,
} from '../../shared/js/api.js';

/* ---------- DOM ---------- */
const $ = (id) => document.getElementById(id);
const pendingGrid   = $('pending-grid');
const pendingEmpty  = $('pending-empty');
const studentsTable = $('students-table');
const studentsEmpty = $('students-empty');

/* ---------- State ---------- */
let groups = [];
let payments = [];
let activeGroupFilter = 'all';

/* ---------- Helpers ---------- */
function initials(name) {
  return name.split(' ').filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase();
}
function avatarClass(id) {
  return 'av-' + ((id % 5) + 1);
}
function groupName(group_id) {
  return groups.find(g => g.id === group_id)?.name || '—';
}
function groupShort(group_id) {
  return groupName(group_id).split('·')[0].trim();
}
function groupFee(group_id) {
  return groups.find(g => g.id === group_id)?.monthly_fee || 0;
}
function fmtMoney(n) {
  return n.toLocaleString('uz-UZ') + " so'm";
}
function relTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const months = ['yan','fev','mar','apr','may','iyn','iyl','avg','sen','okt','noy','dek'];
  const date = d.getDate() + ' ' + months[d.getMonth()];
  const time = String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
  return `${date}, ${time}`;
}
function paymentStatusFor(student) {
  const now = new Date();
  const pay = payments.find(p =>
    p.student_id === student.id && p.month === now.getMonth()+1 && p.year === now.getFullYear()
  );
  if (!pay)           return { cls: 'st-pending', text: "Kutilmoqda" };
  if (pay.status === 'paid') return { cls: 'st-paid', text: "To'langan" };
  return { cls: 'st-pending', text: "Kutilmoqda" };
}

/* ---------- Toast ---------- */
let toastTimer;
function toast(text, type = 'success') {
  const t = $('toast');
  $('toast-text').textContent = text;
  t.classList.remove('error', 'pending');
  if (type !== 'success') t.classList.add(type);
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2500);
}

/* =========================================================
   RENDER: stats
   ========================================================= */
async function renderStats() {
  const all = await listStudents();
  const total   = all.length;
  const active  = all.filter(s => s.status === 'active').length;
  const pending = all.filter(s => s.status === 'pending').length;

  // unpaid = active без оплаты за текущий месяц
  const now = new Date();
  const paidIds = payments
    .filter(p => p.month === now.getMonth()+1 && p.year === now.getFullYear() && p.status === 'paid')
    .map(p => p.student_id);
  const unpaid = all.filter(s => s.status === 'active' && !paidIds.includes(s.id)).length;

  $('stat-total').textContent   = total;
  $('stat-active').textContent  = active;
  $('stat-pending').textContent = pending;
  $('stat-unpaid').textContent  = unpaid;

  $('nav-count').textContent    = pending;
  $('pending-pill').textContent = pending;
}

/* =========================================================
   RENDER: pending applications
   ========================================================= */
async function renderPending() {
  const pending = await listStudents({ status: 'pending' });

  if (pending.length === 0) {
    pendingGrid.innerHTML = '';
    pendingEmpty.hidden = false;
    return;
  }
  pendingEmpty.hidden = true;

  pendingGrid.innerHTML = pending.map(s => `
    <div class="req-card" data-id="${s.id}">
      <div class="req-top">
        <div class="req-avatar ${avatarClass(s.id)}">${initials(s.full_name)}</div>
        <div class="req-info">
          <div class="req-name">${s.full_name}</div>
          <div class="req-phone">${s.phone}</div>
        </div>
        <span class="req-tag">${groupShort(s.group_id)}</span>
      </div>
      <div class="req-meta">
        <div class="meta-item">
          <span class="meta-k">Ariza</span>
          <span class="meta-v">${relTime(s.created_at)}</span>
        </div>
        <div class="meta-item">
          <span class="meta-k">Oylik to'lov</span>
          <span class="meta-v">${fmtMoney(groupFee(s.group_id))}</span>
        </div>
      </div>
      <div class="req-actions">
        <button class="btn-reject" data-action="reject" data-id="${s.id}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          Rad etish
        </button>
        <button class="btn-confirm" data-action="confirm" data-id="${s.id}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          Tasdiqlash
        </button>
      </div>
    </div>
  `).join('');
}

/* =========================================================
   RENDER: active students table
   ========================================================= */
async function renderStudents() {
  let students = await listStudents({ status: 'active' });
  if (activeGroupFilter !== 'all') {
    students = students.filter(s => s.group_id === Number(activeGroupFilter));
  }

  if (students.length === 0) {
    studentsTable.innerHTML = '';
    studentsEmpty.hidden = false;
    return;
  }
  studentsEmpty.hidden = true;

  studentsTable.innerHTML = students.map(s => {
    const pay = paymentStatusFor(s);
    return `
      <div class="table-row" data-id="${s.id}">
        <div class="row-id">#${s.id}</div>
        <div class="row-student">
          <div class="row-av ${avatarClass(s.id)}">${initials(s.full_name)}</div>
          <span class="row-name">${s.full_name}</span>
        </div>
        <div class="row-phone">${s.phone}</div>
        <div class="row-group">${groupShort(s.group_id)}</div>
        <div class="row-pay">${fmtMoney(groupFee(s.group_id))}</div>
        <div class="status-cell">
          <span class="status ${pay.cls}"><span class="dot"></span>${pay.text}</span>
        </div>
      </div>
    `;
  }).join('');
}

/* =========================================================
   Group filter tabs (для таблицы активных)
   ========================================================= */
function renderGroupTabs() {
  const tabsContainer = document.querySelectorAll('.panel-head .tabs')[1];
  if (!tabsContainer) return;
  tabsContainer.innerHTML =
    `<button class="tab active" data-group="all">Hammasi</button>` +
    groups.map(g => `<button class="tab" data-group="${g.id}">${groupShort(g.id)}</button>`).join('');

  tabsContainer.addEventListener('click', (e) => {
    const t = e.target.closest('.tab');
    if (!t) return;
    tabsContainer.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    activeGroupFilter = t.dataset.group;
    renderStudents();
  });
}

/* =========================================================
   Confirm / Reject actions
   ========================================================= */
pendingGrid.addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const id = Number(btn.dataset.id);
  const action = btn.dataset.action;
  const card = btn.closest('.req-card');
  const name = card.querySelector('.req-name').textContent;

  // disable both buttons
  card.querySelectorAll('button').forEach(b => b.disabled = true);

  try {
    if (action === 'confirm') {
      await confirmStudent(id);
      toast(`${name} tasdiqlandi`, 'success');
      // здесь backend сам отправит сообщение боту student.telegram_id
    } else {
      await rejectStudent(id);
      toast(`${name} rad etildi`, 'error');
    }

    // animate out
    card.classList.add('removing');
    setTimeout(async () => {
      card.remove();
      await Promise.all([renderStats(), renderStudents()]);
      // если карточек больше нет — показать empty
      if (!pendingGrid.children.length) pendingEmpty.hidden = false;
    }, 340);
  } catch (err) {
    console.error(err);
    toast("Xatolik yuz berdi", 'error');
    card.querySelectorAll('button').forEach(b => b.disabled = false);
  }
});

/* =========================================================
   Top tabs (Hammasi / Bugun / Bu hafta) — фильтр заявок
   ========================================================= */
document.querySelectorAll('.panel-head').forEach(panel => {
  if (panel.parentElement.querySelector('#pending-grid')) {
    const tabs = panel.querySelector('.tabs');
    tabs?.addEventListener('click', (e) => {
      const t = e.target.closest('.tab');
      if (!t) return;
      tabs.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      // фильтр временно визуальный, реализуем когда появится бэк
    });
  }
});

/* =========================================================
   Init
   ========================================================= */
async function init() {
  try {
    [groups, payments] = await Promise.all([listGroups(), listPayments()]);
    renderGroupTabs();
    await Promise.all([renderStats(), renderPending(), renderStudents()]);
  } catch (err) {
    console.error(err);
    toast("Ma'lumotlarni yuklab bo'lmadi", 'error');
  }
}
init();
