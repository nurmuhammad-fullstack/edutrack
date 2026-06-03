import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getTrainerId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fmtMoney, initials, avatarColor } from "@/lib/utils";
import { getLocale } from "@/lib/get-locale";
import { dashboard } from "@/lib/i18n";
import { computeDebt } from "@/lib/debt";
import { DeleteStudentButton } from "@/components/dashboard/delete-student-button";

export const dynamic = "force-dynamic";

export default async function StudentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const trainerId = await getTrainerId();
  if (!trainerId) redirect("/login");

  const { id } = await params;
  const studentId = Number(id);
  if (!Number.isInteger(studentId)) notFound();

  const t = dashboard[await getLocale()];

  const student = await prisma.student.findFirst({
    where: { id: studentId, trainerId },
    include: {
      group: true,
      payments: { select: { month: true, year: true, status: true, amount: true } },
      attendance: { select: { status: true } },
    },
  });
  if (!student) notFound();

  const fee = student.group?.monthlyFee ?? 0;
  const debt = computeDebt(student.createdAt, student.paymentDay, fee, student.payments);
  const history = [...debt.months].reverse(); // newest first

  const att = { PRESENT: 0, ABSENT: 0, LATE: 0 } as Record<string, number>;
  for (const a of student.attendance) att[a.status] = (att[a.status] ?? 0) + 1;
  const attTotal = student.attendance.length;

  const created = new Date(student.createdAt);
  const joinedLabel = `${created.getDate()} ${t.months[created.getMonth()].toLowerCase()} ${created.getFullYear()}`;

  return (
    <div className="px-4 py-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/students"
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          ← {t.backToStudents}
        </Link>
        <DeleteStudentButton id={student.id} name={student.fullName} />
      </div>

      {/* Header card */}
      <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
        <div
          className={`size-14 rounded-full flex items-center justify-center text-lg font-semibold shrink-0 ${avatarColor(student.id)}`}
        >
          {initials(student.fullName)}
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-foreground text-lg truncate">{student.fullName}</div>
          <div className="text-sm text-muted-foreground mt-0.5 flex flex-wrap items-center gap-x-2">
            {student.group && <span>{student.group.name.split("·")[0].trim()}</span>}
            {fee > 0 && (
              <>
                <span>·</span>
                <span>{fmtMoney(fee)}{t.perMonth}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Info + debt */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="text-xs text-muted-foreground mb-1">{t.phoneLabel}</div>
          <a href={`tel:${student.phone}`} className="text-sm font-medium text-foreground hover:text-primary break-all">
            {student.phone || "—"}
          </a>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="text-xs text-muted-foreground mb-1">{t.joined}</div>
          <div className="text-sm font-medium text-foreground">{joinedLabel}</div>
        </div>
        <div className="col-span-2 bg-card border border-border rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground mb-1">{t.debtLabel}</div>
            <div className={`text-lg font-bold leading-tight ${debt.amount > 0 ? "text-red-600" : "text-green-600"}`}>
              {debt.amount > 0 ? fmtMoney(debt.amount) : fmtMoney(0)}
            </div>
          </div>
          {debt.unpaidMonths > 0 && (
            <span className="text-xs font-medium text-red-700 bg-red-50 px-2.5 py-1 rounded-full">
              {debt.unpaidMonths} {t.monthsUnpaidSuffix}
            </span>
          )}
        </div>
      </div>

      {/* Attendance summary */}
      {attTotal > 0 && (
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="text-sm font-medium text-foreground mb-3">{t.attendanceSummary}</div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-xl font-bold text-green-600">{att.PRESENT}</div>
              <div className="text-[11px] text-muted-foreground">{t.present}</div>
            </div>
            <div>
              <div className="text-xl font-bold text-amber-500">{att.LATE}</div>
              <div className="text-[11px] text-muted-foreground">{t.late}</div>
            </div>
            <div>
              <div className="text-xl font-bold text-red-500">{att.ABSENT}</div>
              <div className="text-[11px] text-muted-foreground">{t.absent}</div>
            </div>
          </div>
        </div>
      )}

      {/* Payment history */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border text-sm font-medium text-foreground">{t.paymentHistory}</div>
        {history.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">{t.noPayments}</div>
        ) : (
          history.map((cell) => (
            <div
              key={`${cell.y}-${cell.m}`}
              className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0"
            >
              <div className="text-sm text-foreground">
                {t.months[cell.m - 1]} {cell.y}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-foreground">{fmtMoney(cell.amount)}</span>
                {cell.paid ? (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700 whitespace-nowrap">
                    {t.paid}
                  </span>
                ) : cell.due ? (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-700 whitespace-nowrap">
                    {t.debtLabel}
                  </span>
                ) : (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 whitespace-nowrap">
                    {t.pending}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
