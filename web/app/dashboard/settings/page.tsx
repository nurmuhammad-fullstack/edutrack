import { redirect } from "next/navigation";
import { getTrainerId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getInviteData } from "@/lib/invite";
import { SettingsClient } from "@/components/dashboard/settings-client";

export default async function SettingsPage() {
  const trainerId = await getTrainerId();
  if (!trainerId) redirect("/login");

  const [trainer, groups, invite, activeStudents] = await Promise.all([
    prisma.trainer.findUnique({ where: { id: trainerId } }),
    prisma.group.findMany({
      where: { trainerId },
      orderBy: { createdAt: "asc" },
    }),
    getInviteData(trainerId),
    prisma.student.count({ where: { trainerId, status: "ACTIVE" } }),
  ]);

  return (
    <div className="px-4 py-5 flex flex-col gap-4">
      <h1 className="font-semibold text-foreground">Sozlamalar</h1>
      <SettingsClient
        trainer={trainer}
        groups={groups}
        inviteLink={invite.link}
        inviteQr={invite.qrDataUrl}
        activeStudents={activeStudents}
      />
    </div>
  );
}
