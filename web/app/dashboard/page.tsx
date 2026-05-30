import { redirect } from "next/navigation";
import { getTrainerId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getInviteData } from "@/lib/invite";
import { getLocale } from "@/lib/get-locale";
import { dashboard } from "@/lib/i18n";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { PendingCard } from "@/components/dashboard/pending-card";
import { InviteCard } from "@/components/dashboard/invite-card";

export default async function DashboardPage() {
  const trainerId = await getTrainerId();
  if (!trainerId) redirect("/login");

  const t = dashboard[await getLocale()];

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const [allStudents, pendingStudents, payments, invite] = await Promise.all([
    prisma.student.findMany({ where: { trainerId } }),
    prisma.student.findMany({
      where: { trainerId, status: "PENDING" },
      include: { group: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.payment.findMany({
      where: { student: { trainerId }, month, year, status: "PAID" },
    }),
    getInviteData(trainerId),
  ]);

  const activeStudents = allStudents.filter((s) => s.status === "ACTIVE");
  const paidIds = new Set(payments.map((p) => p.studentId));
  const unpaid = activeStudents.filter((s) => !paidIds.has(s.id)).length;

  const stats = {
    total: allStudents.length,
    active: activeStudents.length,
    pending: pendingStudents.length,
    unpaid,
  };

  return (
    <div className="px-4 py-5 flex flex-col gap-5">
      <StatsCards stats={stats} labels={{ total: t.statTotal, active: t.statActive, pending: t.statPending, unpaid: t.statUnpaid }} />

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-foreground">{t.pendingTitle}</h2>
          {pendingStudents.length > 0 && (
            <span className="text-xs font-medium bg-orange-50 text-orange-700 px-2.5 py-0.5 rounded-full">
              {pendingStudents.length} {t.countSuffix}
            </span>
          )}
        </div>

        {pendingStudents.length === 0 ? (
          allStudents.length === 0 ? (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col items-center text-center gap-1.5 pt-2 pb-1">
                <span className="text-3xl">👋</span>
                <p className="text-sm font-medium text-foreground">{t.inviteFirstTitle}</p>
                <p className="text-xs text-muted-foreground">{t.inviteFirstSub}</p>
              </div>
              <InviteCard link={invite.link} qrDataUrl={invite.qrDataUrl} compact />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-3 bg-card rounded-2xl border border-border">
              <span className="text-3xl">🎉</span>
              <p className="text-muted-foreground text-sm">{t.allReviewed}</p>
            </div>
          )
        ) : (
          <div className="flex flex-col gap-3">
            {pendingStudents.map((student, i) => (
              <PendingCard key={student.id} student={student} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
