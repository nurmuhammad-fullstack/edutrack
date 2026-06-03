// Debt = months a student has been active but has no PAID payment.
// "Tracking" starts at createdAt (when the trainer added them to EduTrack),
// so we never invent debt from before the trainer started using the app.

const TZ_OFFSET = 5 * 3600 * 1000; // Uzbekistan UTC+5, no DST

export function localNow(base = Date.now()) {
  const d = new Date(base + TZ_OFFSET);
  return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

function daysInMonth(y: number, m: number) {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

// Effective due day clamped to the month length (e.g. 31 → 28/29/30).
function dueDay(paymentDay: number, y: number, m: number) {
  return Math.min(paymentDay, daysInMonth(y, m));
}

export interface MonthCell {
  y: number;
  m: number;
  paid: boolean;
  amount: number;
  due: boolean; // whether this month is already due (past due day)
}

export interface DebtInfo {
  unpaidMonths: number;
  amount: number;
  lastPaid: { y: number; m: number } | null;
  months: MonthCell[]; // chronological, oldest → newest
}

type Pmt = { month: number; year: number; status: string; amount: number };

export function computeDebt(
  createdAt: Date,
  paymentDay: number | null,
  fee: number,
  payments: Pmt[],
  now = localNow()
): DebtInfo {
  const paidMap = new Map<string, number>(); // "y-m" → amount
  let lastPaid: { y: number; m: number } | null = null;
  for (const p of payments) {
    if (p.status !== "PAID") continue;
    paidMap.set(`${p.year}-${p.month}`, p.amount);
    if (!lastPaid || p.year > lastPaid.y || (p.year === lastPaid.y && p.month > lastPaid.m)) {
      lastPaid = { y: p.year, m: p.month };
    }
  }

  const start = new Date(createdAt.getTime() + TZ_OFFSET);
  let y = start.getUTCFullYear();
  let m = start.getUTCMonth() + 1;
  const anchorDay = paymentDay ?? start.getUTCDate();

  const months: MonthCell[] = [];
  let unpaidMonths = 0;

  while (y < now.y || (y === now.y && m <= now.m)) {
    const key = `${y}-${m}`;
    const paid = paidMap.has(key);
    const isCurrent = y === now.y && m === now.m;
    const due = !isCurrent || now.day >= dueDay(anchorDay, y, m);

    months.push({ y, m, paid, amount: paid ? paidMap.get(key)! : fee, due });
    if (fee > 0 && due && !paid) unpaidMonths++;

    m++;
    if (m > 12) {
      m = 1;
      y++;
    }
  }

  return { unpaidMonths, amount: unpaidMonths * fee, lastPaid, months };
}
