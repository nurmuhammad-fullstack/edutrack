import { redirect } from "next/navigation";
import { getTrainerId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fmtMoney } from "@/lib/utils";
import { getLocale } from "@/lib/get-locale";
import { dashboard } from "@/lib/i18n";
import { canUseReports } from "@/lib/plan";
import { BarChart } from "@/components/admin/charts";
import { ExportButton } from "@/components/dashboard/export-button";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const trainerId = await getTrainerId();
  if (!trainerId) redirect("/login");

  const t = dashboard[await getLocale()];
  const trainer = await prisma.trainer.findUnique({ where: { id: trainerId }, select: { plan: true } });

  // PRO gate
  if (!canUseReports(trainer?.plan)) {
    return (
      <div className="px-4 py-5">
        <h1 className="font-semibold text-foreground mb-4">{t.reportsTitle}</h1>
        <div className="flex flex-col items-center justify-center py-12 text-center gap-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/20 px-6">
          <span className="text-4xl">⭐</span>
          <p className="font-semibold text-foreground">{t.proFeature}</p>
          <a
            href="https://t.me/study_track_uz_bot"
            className="inline-flex items-center justify-center h-10 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
          >
            {t.upgradeToPro}
          </a>
        </div>
      </div>
    );
  }

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(year, now.getMonth() - (5 - i), 1);
    return { y: d.getFullYear(), m: d.getMonth() + 1, label: t.monthsShort[d.getMonth()] };
  });

  const [students, paidAll] = await Promise.all([
    prisma.student.findMany({
      where: { trainerId, status: "ACTIVE" },
      include: { group: true },
      orderBy: { fullName: "asc" },
    }),
    prisma.payment.findMany({
      where: { status: "PAID", student: { trainerId } },
      select: { amount: true, month: true, year: true, studentId: true },
    }),
  ]);

  const isThisMonth = (p: { month: number; year: number }) => p.month === month && p.year === year;
  const collectedThisMonth = paidAll.filter(isThisMonth).reduce((s, p) => s + p.amount, 0);
  const allTime = paidAll.reduce((s, p) => s + p.amount, 0);
  const paidIds = new Set(paidAll.filter(isThisMonth).map((p) => p.studentId));
  const expected = students.reduce((s, st) => s + (st.group?.monthlyFee ?? 0), 0);
  const rate = expected > 0 ? Math.round((collectedThisMonth / expected) * 100) : 0;

  const revenue6 = months.map((mo) => ({
    label: mo.label,
    value: paidAll.filter((p) => p.year === mo.y && p.month === mo.m).reduce((s, p) => s + p.amount, 0),
  }));

  // Per-group rollup
  const groupName = (st: (typeof students)[number]) => st.group?.name?.split("·")[0].trim() ?? t.noGroup;
  const byGroup = new Map<string, { students: number; collected: number }>();
  for (const st of students) {
    const k = groupName(st);
    const e = byGroup.get(k) ?? { students: 0, collected: 0 };
    e.students += 1;
    byGroup.set(k, e);
  }
  const studentGroup = new Map(students.map((st) => [st.id, groupName(st)]));
  for (const p of paidAll) {
    if (!isThisMonth(p)) continue;
    const k = studentGroup.get(p.studentId);
    if (k && byGroup.has(k)) byGroup.get(k)!.collected += p.amount;
  }
  const groupRows = [...byGroup.entries()].map(([name, v]) => ({ name, ...v }));

  // CSV
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const header = [t.fullName, t.groups, t.monthly, t.paidCount, t.paymentDayPh].map(esc).join(",");
  const rows = students.map((st) =>
    [
      st.fullName,
      st.group?.name?.split("·")[0].trim() ?? "",
      st.group?.monthlyFee ?? 0,
      paidIds.has(st.id) ? t.paid : t.pending,
      st.paymentDay ?? "",
    ]
      .map(esc)
      .join(",")
  );
  const csv = [header, ...rows].join("\n");
  const filename = `EduTrack-${t.months[month - 1]}-${year}.csv`;

  return (
    <div className="px-4 py-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-foreground">{t.reportsTitle}</h1>
        <ExportButton csv={csv} filename={filename} label={t.exportExcel} />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="text-xs text-muted-foreground mb-1">{t.collected}</div>
          <div className="text-lg font-bold text-foreground leading-tight">{fmtMoney(collectedThisMonth)}</div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="text-xs text-muted-foreground mb-1">{t.allTimeCollected}</div>
          <div className="text-lg font-bold text-foreground leading-tight">{fmtMoney(allTime)}</div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="text-xs text-muted-foreground mb-1">{t.statActive}</div>
          <div className="text-2xl font-bold text-foreground">{students.length}</div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="text-xs text-muted-foreground mb-1">{t.collectionRate}</div>
          <div className="text-2xl font-bold text-foreground">{rate}%</div>
        </div>
      </div>

      {/* Revenue chart */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="text-sm font-medium text-foreground mb-3">{t.revenue6mo}</div>
        <BarChart data={revenue6} />
      </div>

      {/* By group */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border text-sm font-medium text-foreground">{t.byGroup}</div>
        {groupRows.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">{t.noActiveStudents}</div>
        ) : (
          groupRows.map((g) => (
            <div key={g.name} className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0">
              <div className="text-sm font-medium text-foreground">{g.name}</div>
              <div className="text-right">
                <div className="text-sm font-medium text-foreground">{fmtMoney(g.collected)}</div>
                <div className="text-xs text-muted-foreground">{g.students} {t.students.toLowerCase()}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
