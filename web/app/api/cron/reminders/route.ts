import { NextResponse } from "next/server";
import TelegramBot from "node-telegram-bot-api";
import { prisma } from "@/lib/prisma";
import { fmtMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";

// Uzbekistan is UTC+5 with no DST.
const TZ_OFFSET = 5 * 3600 * 1000;

function localParts(base: number) {
  const d = new Date(base + TZ_OFFSET);
  return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

function daysInMonth(y: number, m: number) {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

// Effective due day clamped to the month length (e.g. 31 → 28/29/30).
function dueDay(paymentDay: number, y: number, m: number) {
  return Math.min(paymentDay, daysInMonth(y, m));
}

export async function GET(req: Request) {
  // Vercel Cron sends "Authorization: Bearer <CRON_SECRET>" when CRON_SECRET is set.
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Auto-expire free promos: paid plans whose promo period passed drop to FREE.
  const expired = await prisma.trainer.updateMany({
    where: { plan: { not: "FREE" }, planExpiresAt: { not: null, lt: new Date() } },
    data: { plan: "FREE", planExpiresAt: null },
  });

  if (!process.env.BOT_TOKEN) {
    return NextResponse.json({ ok: true, expired: expired.count, note: "BOT_TOKEN missing" });
  }

  const now = Date.now();
  const today = localParts(now);
  const tomorrow = localParts(now + 24 * 3600 * 1000);

  const students = await prisma.student.findMany({
    where: {
      status: "ACTIVE",
      telegramId: { not: null },
      paymentDay: { not: null },
      // Automatic reminders are a paid (BASIC/PRO) feature.
      trainer: { plan: { in: ["BASIC", "PRO"] } },
    },
    include: { group: true },
  });

  const bot = new TelegramBot(process.env.BOT_TOKEN);
  let sentToday = 0;
  let sentTomorrow = 0;

  for (const s of students) {
    const pd = s.paymentDay!;
    const fee = s.group?.monthlyFee ?? 0;
    if (!s.telegramId || fee <= 0) continue;

    let kind: "today" | "tomorrow" | null = null;
    let cycleMonth = today.m;
    let cycleYear = today.y;

    if (today.day === dueDay(pd, today.y, today.m)) {
      kind = "today";
      cycleMonth = today.m;
      cycleYear = today.y;
    } else if (tomorrow.day === dueDay(pd, tomorrow.y, tomorrow.m)) {
      kind = "tomorrow";
      cycleMonth = tomorrow.m;
      cycleYear = tomorrow.y;
    }

    if (!kind) continue;

    // Skip if already paid for the cycle the reminder refers to.
    const paid = await prisma.payment.findFirst({
      where: { studentId: s.id, month: cycleMonth, year: cycleYear, status: "PAID" },
      select: { id: true },
    });
    if (paid) continue;

    const message =
      kind === "today"
        ? `📅 Eslatma: bugun oylik to'lov kuni.\nTo'lov: ${fmtMoney(fee)}.\nRahmat! 🙏`
        : `📅 Eslatma: ertaga oylik to'lov kuni.\nTo'lov: ${fmtMoney(fee)}.\nOldindan rahmat! 🙏`;

    const ok = await bot
      .sendMessage(s.telegramId, message)
      .then(() => true)
      .catch(() => false);

    if (ok) kind === "today" ? sentToday++ : sentTomorrow++;
  }

  return NextResponse.json({
    ok: true,
    expired: expired.count,
    checked: students.length,
    sentToday,
    sentTomorrow,
  });
}
