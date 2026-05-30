import { NextResponse } from "next/server";
import { getTrainerId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { planLimits, studentLimitMessage } from "@/lib/plan";
import TelegramBot from "node-telegram-bot-api";

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const trainerId = await getTrainerId();
  if (!trainerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Enforce the active-student limit for the trainer's plan.
  const trainer = await prisma.trainer.findUnique({ where: { id: trainerId }, select: { plan: true } });
  const activeCount = await prisma.student.count({ where: { trainerId, status: "ACTIVE" } });
  if (activeCount >= planLimits(trainer?.plan).maxStudents) {
    return NextResponse.json(
      { error: studentLimitMessage(trainer?.plan ?? "FREE"), code: "LIMIT" },
      { status: 403 }
    );
  }

  const student = await prisma.student.update({
    where: { id: Number(id), trainerId },
    data: { status: "ACTIVE" },
  });

  if (student.telegramId && process.env.BOT_TOKEN) {
    const bot = new TelegramBot(process.env.BOT_TOKEN);
    await bot
      .sendMessage(
        student.telegramId,
        "✅ Tabriklaymiz! Arizangiz tasdiqlandi. Endi o'quvchisiz!"
      )
      .catch(() => {});
  }

  return NextResponse.json(student);
}
