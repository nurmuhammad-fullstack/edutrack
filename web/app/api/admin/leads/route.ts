import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/phone";

const SOURCES = ["WEB", "BOT", "INSTAGRAM", "TELEGRAM", "REFERRAL", "MANUAL"] as const;

// Admin manually logs a lead (e.g. an Instagram / Telegram DM that came in
// directly), so every acquisition channel lives in one tracked inbox.
export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Noto'g'ri so'rov" }, { status: 400 });

  const name = typeof body.name === "string" ? body.name.trim().slice(0, 120) : "";
  const normalized = normalizePhone(typeof body.phone === "string" ? body.phone : "");
  const sport = typeof body.sport === "string" && body.sport.trim() ? body.sport.trim().slice(0, 80) : null;
  const message = typeof body.message === "string" && body.message.trim() ? body.message.trim().slice(0, 1000) : null;
  const referral = typeof body.referral === "string" && body.referral.trim() ? body.referral.trim().slice(0, 60) : null;
  const source = SOURCES.includes(body.source) ? body.source : "MANUAL";

  if (!name || name.length < 2) {
    return NextResponse.json({ error: "Ism kiriting" }, { status: 400 });
  }
  if (!normalized) {
    return NextResponse.json({ error: "Telefon raqamini to'g'ri kiriting" }, { status: 400 });
  }

  const lead = await prisma.lead.create({
    data: { name, phone: normalized, sport, message, referral, source },
  });
  return NextResponse.json(lead, { status: 201 });
}
