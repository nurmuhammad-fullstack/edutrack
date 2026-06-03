import { redirect } from "next/navigation";
import { getTrainerId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/get-locale";
import { dashboard } from "@/lib/i18n";
import { StudentRow } from "@/components/dashboard/student-row";
import { GroupTabs } from "@/components/dashboard/group-tabs";
import { AddStudent } from "@/components/dashboard/add-student";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string }>;
}) {
  const trainerId = await getTrainerId();
  if (!trainerId) redirect("/login");

  const t = dashboard[await getLocale()];
  const { group: groupFilter } = await searchParams;

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const [students, groups, payments] = await Promise.all([
    prisma.student.findMany({
      where: {
        trainerId,
        status: "ACTIVE",
        ...(groupFilter ? { groupId: Number(groupFilter) } : {}),
      },
      include: { group: true },
      orderBy: { fullName: "asc" },
    }),
    prisma.group.findMany({ where: { trainerId } }),
    prisma.payment.findMany({
      where: { student: { trainerId }, month, year },
    }),
  ]);

  return (
    <div className="px-4 py-5 flex flex-col gap-4">
      <h1 className="font-semibold text-foreground">{t.activeStudentsTitle}</h1>

      <GroupTabs groups={groups} activeGroup={groupFilter} allLabel={t.all} />

      <AddStudent groups={groups} />

      {students.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center gap-3 bg-card rounded-2xl border border-border">
          <span className="text-3xl">👤</span>
          <p className="text-muted-foreground text-sm">{t.noActiveStudents}</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border px-4">
          {students.map((student, i) => (
            <StudentRow key={student.id} student={student} payments={payments} index={i} t={t} />
          ))}
        </div>
      )}
    </div>
  );
}
