import { NextResponse } from "next/server";
import { getTrainerId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TelegramBot from "node-telegram-bot-api";

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const trainerId = await getTrainerId();
  if (!trainerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const student = await prisma.student.update({
    where: { id: Number(id), trainerId },
    data: { status: "REJECTED" },
  });

  if (student.telegramId && process.env.BOT_TOKEN) {
    const bot = new TelegramBot(process.env.BOT_TOKEN);
    await bot
      .sendMessage(
        student.telegramId,
        "❌ Afsuski, arizangiz rad etildi. Qo'shimcha ma'lumot uchun o'qituvchi bilan bog'laning."
      )
      .catch(() => {});
  }

  return NextResponse.json(student);
}
