import { NextResponse } from "next/server";
import TelegramBot from "node-telegram-bot-api";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/phone";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const SOURCES = ["WEB", "INSTAGRAM", "TELEGRAM", "REFERRAL"] as const;
type PublicSource = (typeof SOURCES)[number];

// Public endpoint — anyone can submit a trainer application. This only creates
// a NEW lead; it NEVER creates an account (admins verify + convert manually).
export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = rateLimit(`lead:${ip}`, 5, 60 * 60 * 1000); // 5 / hour / IP
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Juda ko'p urinish. Birozdan so'ng qayta urining." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Noto'g'ri so'rov" }, { status: 400 });

  // Honeypot: bots fill hidden fields; humans leave them empty.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true }); // silently drop
  }

  const name = typeof body.name === "string" ? body.name.trim().slice(0, 120) : "";
  const normalized = normalizePhone(typeof body.phone === "string" ? body.phone : "");
  const sport = typeof body.sport === "string" && body.sport.trim() ? body.sport.trim().slice(0, 80) : null;
  const message = typeof body.message === "string" && body.message.trim() ? body.message.trim().slice(0, 1000) : null;
  const referral = typeof body.referral === "string" && body.referral.trim() ? body.referral.trim().slice(0, 60) : null;
  const source: PublicSource = SOURCES.includes(body.source) ? body.source : "WEB";

  if (!name || name.length < 2) {
    return NextResponse.json({ error: "Ism familiyangizni kiriting" }, { status: 400 });
  }
  if (!normalized) {
    return NextResponse.json({ error: "Telefon raqamini to'g'ri kiriting" }, { status: 400 });
  }

  const lead = await prisma.lead.create({
    data: { name, phone: normalized, sport, message, referral, source },
  });

  // Notify the founder's Telegram so applications surface immediately.
  const adminChatId = process.env.ADMIN_CHAT_ID;
  if (adminChatId && process.env.BOT_TOKEN) {
    const lines = [
      "🆕 Yangi ariza (EduTrack)",
      `👤 ${name}`,
      `📞 ${normalized}`,
      sport ? `🏷 ${sport}` : null,
      `📍 Manba: ${source}`,
      referral ? `🎟 Promo: ${referral}` : null,
      message ? `\n💬 ${message}` : null,
    ].filter(Boolean);
    const bot = new TelegramBot(process.env.BOT_TOKEN);
    await bot.sendMessage(adminChatId, lines.join("\n")).catch(() => {});
  }

  return NextResponse.json({ ok: true, id: lead.id }, { status: 201 });
}
