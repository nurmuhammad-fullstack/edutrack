import { redirect } from "next/navigation";
import { getTrainerId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canUseAttendance } from "@/lib/plan";
import { AttendanceClient } from "@/components/dashboard/attendance-client";

export default async function AttendancePage() {
  const trainerId = await getTrainerId();
  if (!trainerId) redirect("/login");

  const trainer = await prisma.trainer.findUnique({
    where: { id: trainerId },
    select: { plan: true },
  });

  // PRO gate
  if (!canUseAttendance(trainer?.plan)) {
    return (
      <div className="px-4 py-5">
        <h1 className="font-semibold text-foreground mb-4">Davomat</h1>
        <div className="flex flex-col items-center justify-center py-12 text-center gap-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/20 px-6">
          <span className="text-4xl">⭐</span>
          <div>
            <p className="font-semibold text-foreground">Davomat — PRO funksiyasi</p>
            <p className="text-muted-foreground text-sm mt-1 max-w-[260px]">
              O&apos;quvchilar davomatini kunma-kun belgilash va statistikasini ko&apos;rish PRO
              tarifda mavjud.
            </p>
          </div>
          <a
            href="https://t.me/study_track_uz_bot"
            className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
          >
            PRO&apos;ga o&apos;tish — admin bilan bog&apos;laning
          </a>
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
