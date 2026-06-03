import Link from "next/link";
import { redirect } from "next/navigation";
import { getTrainerId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fmtMoney, initials, avatarColor } from "@/lib/utils";
import { getLocale } from "@/lib/get-locale";
import { dashboard } from "@/lib/i18n";
import { computeDebt } from "@/lib/debt";

export const dynamic = "force-dynamic";

export default async function DebtsPage() {
  const trainerId = await getTrainerId();
  if (!trainerId) redirect("/login");

  const t = dashboard[await getLocale()];

  const [students, payments] = await Promise.all([
    prisma.student.findMany({
      where: { trainerId, status: "ACTIVE" },
      include: { group: true },
    }),
    prisma.payment.findMany({
      where: { student: { trainerId } },
      select: { studentId: true, month: true, year: true, status: true, amount: true },
    }),
  ]);

  const byStudent = new Map<number, typeof payments>();
  for (const p of payments) {
    const arr = byStudent.get(p.studentId) ?? [];
    arr.push(p);
    byStudent.set(p.studentId, arr);
  }

  const debtors = students
    .map((s) => {
      const fee = s.group?.monthlyFee ?? 0;
      const d = computeDebt(s.createdAt, s.paymentDay, fee, byStudent.get(s.id) ?? []);
      return { student: s, debt: d };
    })
    .filter((x) => x.debt.unpaidMonths > 0)
    .sort((a, b) => b.debt.amount - a.debt.amount);

  const totalDebt = debtors.reduce((sum, d) => sum + d.debt.amount, 0);

  return (
    <div className="px-4 py-5 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/payments" className="text-sm text-muted-foreground hover:text-foreground">
          ←
        </Link>
        <h1 className="font-semibold text-foreground">{t.debtTitle}</h1>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="text-xs text-muted-foreground mb-1">{t.totalDebt}</div>
          <div className="text-lg font-bold text-red-600 leading-tight">{fmtMoney(totalDebt)}</div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="text-xs text-muted-foreground mb-1">{t.debtorsCount}</div>
          <div className="text-2xl font-bold text-foreground">{debtors.length}</div>
        </div>
      </div>

      {debtors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center gap-3 bg-card rounded-2xl border border-border">
          <span className="text-3xl">🎉</span>
          <p className="text-muted-foreground text-sm">{t.noDebt}</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border px-4">
          {debtors.map(({ student, debt }) => (
            <Link
              key={student.id}
              href={`/dashboard/students/${student.id}`}
              className="flex items-center gap-3 py-3 border-b border-border last:border-0 hover:bg-muted/40 -mx-4 px-4 transition-colors"
            >
              <div
                className={`size-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${avatarColor(student.id)}`}
              >
                {initials(student.fullName)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-foreground truncate">{student.fullName}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {debt.unpaidMonths} {t.monthsUnpaidSuffix}
                  {student.group && <> · {student.group.name.split("·")[0].trim()}</>}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-bold text-red-600 whitespace-nowrap">{fmtMoney(debt.amount)}</div>
                <div className="text-[10px] text-muted-foreground">
                  {debt.lastPaid
                    ? `${t.lastPaid}: ${t.monthsShort[debt.lastPaid.m - 1]} ${debt.lastPaid.y}`
                    : t.neverPaid}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <p className="text-[11px] text-muted-foreground text-center px-4">{t.debtNote}</p>
    </div>
  );
}
