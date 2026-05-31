import { redirect } from "next/navigation";
import { getTrainerId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canUseAttendance } from "@/lib/plan";
import { getLocale } from "@/lib/get-locale";
import { dashboard } from "@/lib/i18n";
import { AttendanceClient } from "@/components/dashboard/attendance-client";

export default async function AttendancePage() {
  const trainerId = await getTrainerId();
  if (!trainerId) redirect("/login");

  const trainer = await prisma.trainer.findUnique({
    where: { id: trainerId },
    select: { plan: true, attendanceEnabled: true },
  });

  const t = dashboard[await getLocale()];

  // PRO gate
  if (!canUseAttendance(trainer?.plan)) {
    return (
      <div className="px-4 py-5">
        <h1 className="font-semibold text-foreground mb-4">{t.attendanceTitle}</h1>
        <div className="flex flex-col items-center justify-center py-12 text-center gap-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/20 px-6">
          <span className="text-4xl">⭐</span>
          <div>
            <p className="font-semibold text-foreground">{t.proFeature}</p>
            <p className="text-muted-foreground text-sm mt-1 max-w-[260px]">{t.proFeatureSub}</p>
          </div>
          <a
            href="https://t.me/study_track_uz_bot"
            className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
          >
            {t.upgradeToPro}
          </a>
        </div>
      </div>
    );
  }

  // PRO trainer turned the section off.
  if (!trainer?.attendanceEnabled) {
    return (
      <div className="px-4 py-5">
        <h1 className="font-semibold text-foreground mb-4">{t.attendanceTitle}</h1>
        <div className="flex flex-col items-center justify-center py-12 text-center gap-3 bg-card rounded-2xl border border-border px-6">
          <span className="text-3xl">🙈</span>
          <p className="text-muted-foreground text-sm max-w-[260px]">{t.attendanceOff}</p>
        </div>
      </div>
    );
  }

  const [groups, students] = await Promise.all([
    prisma.group.findMany({ where: { trainerId }, orderBy: { id: "asc" } }),
    prisma.student.findMany({
      where: { trainerId, status: "ACTIVE" },
      include: { group: true },
      orderBy: { fullName: "asc" },
    }),
  ]);

  // Tashkent (UTC+5) today as YYYY-MM-DD
  const today = new Date(Date.now() + 5 * 3600 * 1000).toISOString().slice(0, 10);

  return <AttendanceClient groups={groups} students={students} today={today} />;
}
