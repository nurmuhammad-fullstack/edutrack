import { prisma } from "@/lib/prisma";
import { fmtMoney } from "@/lib/utils";
import { TrainersPanel, type TrainerRow } from "@/components/admin/trainers-panel";
import { Donut, Sparkline, BarChart, type DonutSegment } from "@/components/admin/charts";

const MONTH_SHORT = ["Yan", "Fev", "Mar", "Apr", "May", "Iyn", "Iyl", "Avg", "Sen", "Okt", "Noy", "Dek"];
const WEEKDAYS = ["Yak", "Du", "Se", "Cho", "Pay", "Ju", "Sha"];

function fmtDate(d: Date) {
  return `${d.getDate()} ${MONTH_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}
function relTime(d: Date) {
  const min = Math.floor((Date.now() - d.getTime()) / 60000);
  if (min < 1) return "hozir";
  if (min < 60) return `${min} daqiqa oldin`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} soat oldin`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days} kun oldin`;
  return fmtDate(d);
}
function trend(series: number[]) {
  if (series.length < 2) return 0;
  const last = series[series.length - 1];
  const prev = series[series.length - 2];
  if (prev === 0) return last > 0 ? 100 : 0;
  return Math.round(((last - prev) / prev) * 100);
}

export default async function AdminDashboardPage() {
  const now = new Date();
  const curMonth = now.getMonth() + 1;
  const curYear = now.getFullYear();

  // Last 6 months window
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(curYear, now.getMonth() - (5 - i), 1);
    return { y: d.getFullYear(), m: d.getMonth() + 1, label: MONTH_SHORT[d.getMonth()] };
  });

  const [
    totalTrainers,
    planGroups,
    trainers,
    studentDates,
    activeStudents,
    pendingCount,
    paidPayments,
    feedbackCount,
    recentFeedback,
    recentStudents,
  ] = await Promise.all([
    prisma.trainer.count(),
    prisma.trainer.groupBy({ by: ["plan"], _count: { _all: true } }),
    prisma.trainer.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { students: true } } },
    }),
    prisma.student.findMany({ select: { createdAt: true, status: true, trainerId: true } }),
    prisma.student.findMany({
      where: { status: "ACTIVE" },
      select: { trainerId: true, group: { select: { monthlyFee: true } } },
    }),
    prisma.student.count({ where: { status: "PENDING" } }),
    prisma.payment.findMany({
      where: { status: "PAID" },
      select: { amount: true, month: true, year: true, student: { select: { trainerId: true } } },
    }),
    prisma.feedback.count(),
    prisma.feedback.findMany({ orderBy: { createdAt: "desc" }, take: 12 }),
    prisma.student.findMany({
      orderBy: { createdAt: "desc" },
      take: 7,
      include: { group: { select: { name: true } }, trainer: { select: { name: true, email: true } } },
    }),
  ]);

  // ── Aggregates ────────────────────────────────────────────────────────────
  const totalStudents = studentDates.length;
  const activeCount = activeStudents.length;

  const collectedThisMonth = paidPayments
    .filter((p) => p.month === curMonth && p.year === curYear)
    .reduce((s, p) => s + p.amount, 0);
  const collectedAllTime = paidPayments.reduce((s, p) => s + p.amount, 0);
  const expectedThisMonth = activeStudents.reduce((s, a) => s + (a.group?.monthlyFee ?? 0), 0);
  const collectionRate = expectedThisMonth > 0 ? Math.round((collectedThisMonth / expectedThisMonth) * 100) : 0;

  // ── Time series ─────────────────────────────────────────────────────────────
  const newStudentsByMonth = months.map(
    (mo) => studentDates.filter((s) => s.createdAt.getFullYear() === mo.y && s.createdAt.getMonth() + 1 === mo.m).length
  );
  const newTrainersByMonth = months.map(
    (mo) => trainers.filter((t) => t.createdAt.getFullYear() === mo.y && t.createdAt.getMonth() + 1 === mo.m).length
  );
  const revenueByMonth = months.map((mo) =>
    paidPayments.filter((p) => p.year === mo.y && p.month === mo.m).reduce((s, p) => s + p.amount, 0)
  );

  // 7-day signups
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(curYear, now.getMonth(), now.getDate() - (6 - i));
    return { d, label: WEEKDAYS[d.getDay()] };
  });
  const activity7 = last7.map((day) => ({
    label: day.label,
    value: studentDates.filter(
      (s) =>
        s.createdAt.getFullYear() === day.d.getFullYear() &&
        s.createdAt.getMonth() === day.d.getMonth() &&
        s.createdAt.getDate() === day.d.getDate()
    ).length,
  }));

  // ── Plan donut ──────────────────────────────────────────────────────────────
  const planCount = (p: string) => planGroups.find((g) => g.plan === p)?._count._all ?? 0;
  const planSegments: DonutSegment[] = [
    { label: "FREE", value: planCount("FREE"), color: "#94a3b8" },
    { label: "BASIC", value: planCount("BASIC"), color: "#0ea5e9" },
    { label: "PRO", value: planCount("PRO"), color: "#f59e0b" },
  ];

  // ── Per-trainer rollups for the table ────────────────────────────────────────
  const activeByTrainer = new Map<string, number>();
  for (const a of activeStudents) activeByTrainer.set(a.trainerId, (activeByTrainer.get(a.trainerId) ?? 0) + 1);
  const collectedByTrainer = new Map<string, number>();
  for (const p of paidPayments) {
    if (p.month === curMonth && p.year === curYear) {
      const t = p.student.trainerId;
      collectedByTrainer.set(t, (collectedByTrainer.get(t) ?? 0) + p.amount);
    }
  }
  const trainerRows: TrainerRow[] = trainers.map((t) => ({
    id: t.id,
    name: t.name,
    phone: t.phone,
    plan: t.plan,
    referral: t.referral,
    students: t._count.students,
    active: activeByTrainer.get(t.id) ?? 0,
    collected: collectedByTrainer.get(t.id) ?? 0,
    joined: fmtDate(t.createdAt),
  }));

  // Ambassador / referral rollup: who brought how many trainers (and revenue).
  const referralMap = new Map<string, { trainers: number; paying: number; collected: number }>();
  for (const t of trainers) {
    if (!t.referral) continue;
    const e = referralMap.get(t.referral) ?? { trainers: 0, paying: 0, collected: 0 };
    e.trainers += 1;
    if (t.plan !== "FREE") e.paying += 1;
    e.collected += collectedByTrainer.get(t.id) ?? 0;
    referralMap.set(t.referral, e);
  }
  const referralRows = [...referralMap.entries()]
    .map(([code, v]) => ({ code, ...v }))
    .sort((a, b) => b.trainers - a.trainers);

  const kpis = [
    {
      label: "O'qituvchilar",
      value: String(totalTrainers),
      series: newTrainersByMonth,
      color: "#6366f1",
      sub: `${months[months.length - 1].label} oyida +${newTrainersByMonth[newTrainersByMonth.length - 1]}`,
    },
    {
      label: "Faol o'quvchilar",
      value: String(activeCount),
      series: newStudentsByMonth,
      color: "#10b981",
      sub: `${pendingCount} ta kutilmoqda`,
    },
    {
      label: "Bu oy yig'ilgan",
      value: fmtMoney(collectedThisMonth),
      small: true,
      series: revenueByMonth,
      color: "#0ea5e9",
      sub: `Jami: ${fmtMoney(collectedAllTime)}`,
    },
  ];

  return (
    <div className="flex flex-col gap-5 pt-1">
      {/* ── KPI strip + plan donut ── */}
      <section id="overview" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 scroll-mt-24">
        {kpis.map((k) => {
          const t = trend(k.series);
          return (
            <div key={k.label} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/60">
              <div className="flex items-start justify-between">
                <span className="text-sm text-slate-500">{k.label}</span>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    t >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                  }`}
                >
                  {t >= 0 ? "↑" : "↓"} {Math.abs(t)}%
                </span>
              </div>
              <div className={`font-bold text-slate-900 mt-2 ${k.small ? "text-xl" : "text-3xl"}`}>{k.value}</div>
              <div className="flex items-end justify-between mt-1">
                <span className="text-xs text-slate-400">{k.sub}</span>
                <Sparkline data={k.series} color={k.color} />
              </div>
            </div>
          );
        })}

        {/* Plan donut */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/60 flex items-center gap-4">
          <Donut segments={planSegments} size={108} stroke={16} centerLabel={String(totalTrainers)} centerSub="trener" />
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700 mb-1">Tariflar</span>
            {planSegments.map((s) => (
              <div key={s.label} className="flex items-center gap-2 text-xs">
                <span className="size-2.5 rounded-full" style={{ background: s.color }} />
                <span className="text-slate-500">{s.label}</span>
                <span className="ml-auto font-semibold text-slate-700">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Activity + collection ── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-3xl p-5 shadow-sm border border-slate-200/60">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-slate-900">Faollik</h2>
              <p className="text-xs text-slate-400">So&apos;nggi 7 kunda yangi o&apos;quvchilar</p>
            </div>
            <span className="text-2xl font-bold text-slate-900">{activity7.reduce((s, d) => s + d.value, 0)}</span>
          </div>
          <BarChart data={activity7} color="#6366f1" />
        </div>

        {/* Collection rate ring */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/60 flex flex-col items-center justify-center gap-3">
          <h2 className="font-semibold text-slate-900 self-start">Bu oy to&apos;lov darajasi</h2>
          <Donut
            segments={[
              { label: "Yig'ilgan", value: collectedThisMonth, color: "#10b981" },
              { label: "Qolgan", value: Math.max(expectedThisMonth - collectedThisMonth, 0), color: "#e2e8f0" },
            ]}
            size={140}
            stroke={18}
            centerLabel={`${collectionRate}%`}
            centerSub="to'landi"
          />
          <div className="text-xs text-slate-400 text-center">
            {fmtMoney(collectedThisMonth)} / {fmtMoney(expectedThisMonth)}
          </div>
        </div>
      </section>

      {/* ── Payments overview + recent students + feedback ── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Payments overview */}
        <div id="payments" className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/60 scroll-mt-24">
          <h2 className="font-semibold text-slate-900 mb-4">To&apos;lovlar holati</h2>
          {(() => {
            const remaining = Math.max(expectedThisMonth - collectedThisMonth, 0);
            const bars = [
              { label: "Bu oy yig'ilgan", value: collectedThisMonth, color: "#10b981", base: expectedThisMonth || 1 },
              { label: "Bu oy kutilmoqda", value: remaining, color: "#f59e0b", base: expectedThisMonth || 1 },
              { label: "Jami yig'ilgan", value: collectedAllTime, color: "#0ea5e9", base: collectedAllTime || 1 },
            ];
            return (
              <div className="flex flex-col gap-4">
                {bars.map((b) => (
                  <div key={b.label}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="text-slate-500">{b.label}</span>
                      <span className="font-semibold text-slate-800">{fmtMoney(b.value)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${Math.min((b.value / b.base) * 100, 100)}%`, background: b.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        {/* Recent students */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/60">
          <h2 className="font-semibold text-slate-900 mb-4">So&apos;nggi o&apos;quvchilar</h2>
          {recentStudents.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">Hozircha yo&apos;q</p>
          ) : (
            <div className="flex flex-col gap-3">
              {recentStudents.map((s) => {
                const color =
                  s.status === "ACTIVE" ? "#10b981" : s.status === "PENDING" ? "#f59e0b" : "#f43f5e";
                return (
                  <div key={s.id} className="flex items-center gap-3 pl-3 border-l-2" style={{ borderColor: color }}>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-800 truncate">{s.fullName}</div>
                      <div className="text-xs text-slate-400 truncate">
                        {s.trainer.name ?? s.trainer.email} · {s.group?.name?.split("·")[0].trim() ?? "—"}
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 whitespace-nowrap">{relTime(s.createdAt)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Feedback */}
        <div id="feedback" className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/60 scroll-mt-24">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">So&apos;nggi fikrlar</h2>
            <span className="text-xs text-slate-400">{feedbackCount} ta</span>
          </div>
          {recentFeedback.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">Hozircha fikr yo&apos;q</p>
          ) : (
            <div className="flex flex-col gap-3 max-h-72 overflow-y-auto">
              {recentFeedback.map((f) => (
                <div key={f.id} className="bg-slate-50 rounded-2xl p-3">
                  <p className="text-sm text-slate-700 leading-relaxed">{f.message}</p>
                  <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400">
                    <span>{f.name ?? "Anonim"}</span>
                    <span className="ml-auto">{relTime(f.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Ambassador / referral report ── */}
      {referralRows.length > 0 && (
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">📣 Ambassadorlar / Referral</h2>
            <span className="text-xs text-slate-400">{referralRows.length} manba</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                  <th className="font-medium px-5 py-3">Promo-kod / manba</th>
                  <th className="font-medium px-3 py-3 text-center">Trenerlar</th>
                  <th className="font-medium px-3 py-3 text-center">To&apos;lovchi</th>
                  <th className="font-medium px-5 py-3 text-right">Bu oy daromad</th>
                </tr>
              </thead>
              <tbody>
                {referralRows.map((r) => (
                  <tr key={r.code} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3 font-medium text-slate-800">{r.code}</td>
                    <td className="px-3 py-3 text-center text-slate-600">{r.trainers}</td>
                    <td className="px-3 py-3 text-center">
                      <span className="text-emerald-600 font-medium">{r.paying}</span>
                    </td>
                    <td className="px-5 py-3 text-right text-slate-700 whitespace-nowrap">{fmtMoney(r.collected)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── Trainers management ── */}
      <section id="trainers" className="scroll-mt-24">
        <TrainersPanel trainers={trainerRows} />
      </section>
    </div>
  );
}
