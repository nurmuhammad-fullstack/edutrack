import { NextResponse } from "next/server";
import TelegramBot from "node-telegram-bot-api";
import { prisma } from "@/lib/prisma";
import { fmtMoney } from "@/lib/utils";
import { botMsg, botLang } from "@/lib/i18n";
import { canUseAttendance } from "@/lib/plan";

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

  // ── Daily digest to linked trainers ───────────────────────────────────────
  const weekday = new Date(now + TZ_OFFSET).getUTCDay();
  const linkedTrainers = await prisma.trainer.findMany({
    where: { telegramId: { not: null } },
    select: { id: true, telegramId: true, plan: true, attendanceEnabled: true },
  });
  let digestSent = 0;

  for (const tr of linkedTrainers) {
    if (!tr.telegramId) continue;

    const pending = await prisma.student.count({ where: { trainerId: tr.id, status: "PENDING" } });

    const activeWithDay = await prisma.student.count({
      where: { trainerId: tr.id, status: "ACTIVE", paymentDay: { not: null } },
    });
    const paidThisMonth = await prisma.payment.count({
      where: { status: "PAID", month: today.m, year: today.y, student: { trainerId: tr.id } },
    });
    const dueUnpaid = Math.max(activeWithDay - paidThisMonth, 0);

    let attendanceNotTaken = 0;
    if (canUseAttendance(tr.plan) && tr.attendanceEnabled) {
      const groupsToday = await prisma.group.findMany({
        where: { trainerId: tr.id, lessonDays: { has: weekday } },
        select: { id: true },
      });
      for (const g of groupsToday) {
        const taken = await prisma.attendance.count({
          where: { date: new Date(`${dateStr(today)}T00:00:00.000Z`), student: { groupId: g.id } },
        });
        if (taken === 0) attendanceNotTaken += 1;
      }
    }

    if (pending === 0 && dueUnpaid === 0 && attendanceNotTaken === 0) continue;

    const pref = await prisma.botUser.findUnique({ where: { chatId: tr.telegramId }, select: { lang: true } });
    const m = botMsg[botLang(pref?.lang)];
    const lines: string[] = [m.digestTitle];
    if (pending > 0) lines.push(m.digestPending.replace("{n}", String(pending)));
    if (dueUnpaid > 0) lines.push(m.digestDue.replace("{n}", String(dueUnpaid)));
    if (attendanceNotTaken > 0) lines.push(m.digestAttendance.replace("{n}", String(attendanceNotTaken)));

    const ok = await bot.sendMessage(tr.telegramId, lines.join("\n")).then(() => true).catch(() => false);
    if (ok) digestSent += 1;
  }

  return NextResponse.json({
    ok: true,
    expired: expired.count,
    checked: students.length,
    sentToday,
    sentTomorrow,
    digestSent,
  });
}

function dateStr(p: { y: number; m: number; day: number }) {
  return `${p.y}-${String(p.m).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}
