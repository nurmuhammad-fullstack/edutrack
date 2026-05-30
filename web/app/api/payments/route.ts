import { NextResponse } from "next/server";
import { getTrainerId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fmtMoney } from "@/lib/utils";
import TelegramBot from "node-telegram-bot-api";

const MONTH_NAMES = [
  "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
  "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr",
];

export async function GET(req: Request) {
  const trainerId = await getTrainerId();
  if (!trainerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  const payments = await prisma.payment.findMany({
    where: {
      student: { trainerId },
      ...(month ? { month: Number(month) } : {}),
      ...(year ? { year: Number(year) } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(payments);
}

export async function POST(req: Request) {
  const trainerId = await getTrainerId();
  if (!trainerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { studentId, month, year, amount, status } = await req.json();

  const student = await prisma.student.findFirst({
    where: { id: Number(studentId), trainerId },
  });
  if (!student) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const paymentStatus = status === "PENDING" ? "PENDING" : "PAID";

  // Look up the previous state so we only notify on a real PENDING→PAID transition
  // (re-marking an already-paid month must not spam the student).
  const existing = await prisma.payment.findUnique({
    where: {
      studentId_month_year: {
        studentId: Number(studentId),
        month: Number(month),
        year: Number(year),
      },
    },
  });

  const payment = await prisma.payment.upsert({
    where: {
      studentId_month_year: {
        studentId: Number(studentId),
        month: Number(month),
        year: Number(year),
      },
    },
    update: {
      status: paymentStatus,
      paidAt: paymentStatus === "PAID" ? new Date() : null,
      amount: Number(amount),
    },
    create: {
      studentId: Number(studentId),
      month: Number(month),
      year: Number(year),
      amount: Number(amount),
      status: paymentStatus,
      paidAt: paymentStatus === "PAID" ? new Date() : null,
    },
  });

  const becamePaid = paymentStatus === "PAID" && existing?.status !== "PAID";

  // Auto-anchor the student's monthly payment day: the first time they're ever
  // marked paid, remember that day-of-month so reminders follow their real
  // cycle (not the registration date). Trainer can still edit it later.
  if (becamePaid && student.paymentDay == null) {
    // Tashkent (UTC+5) day-of-month.
    const day = new Date(Date.now() + 5 * 3600 * 1000).getUTCDate();
    await prisma.student
      .update({ where: { id: student.id }, data: { paymentDay: day } })
      .catch(() => {});
  }

  // Notify the student once, only when this marks them paid for the first time.
  if (becamePaid && student.telegramId && process.env.BOT_TOKEN) {
    const monthLabel = `${MONTH_NAMES[Number(month) - 1] ?? ""} ${year}`.trim();
    const bot = new TelegramBot(process.env.BOT_TOKEN);
    await bot
      .sendMessage(
        student.telegramId,
        `✅ To'lovingiz qabul qilindi!\n\n${monthLabel} oyi uchun ${fmtMoney(
          Number(amount)
        )} to'lov belgilandi. Rahmat! 🙌`
      )
      .catch(() => {});
  }

  return NextResponse.json(payment);
}
