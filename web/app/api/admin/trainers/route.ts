import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { normalizePhone, phoneToEmail } from "@/lib/phone";

const PLANS = ["FREE", "BASIC", "PRO"] as const;
type Plan = (typeof PLANS)[number];

const DEFAULT_GROUPS = [
  { name: "1-guruh · Boshlang'ich", monthlyFee: 450000 },
  { name: "2-guruh · O'rta", monthlyFee: 500000 },
  { name: "3-guruh · Yuqori", monthlyFee: 600000 },
];

// Admin creates a trainer account (manual onboarding).
export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Noto'g'ri so'rov" }, { status: 400 });

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const plan: Plan = PLANS.includes(body.plan) ? body.plan : "FREE";
  const normalized = normalizePhone(typeof body.phone === "string" ? body.phone : "");
  const referral = typeof body.referral === "string" && body.referral.trim() ? body.referral.trim().slice(0, 60) : null;

  if (!name || name.length < 2) {
    return NextResponse.json({ error: "Ism kiriting (kamida 2 belgi)" }, { status: 400 });
  }
  if (!normalized) {
    return NextResponse.json({ error: "Telefon raqamini to'g'ri kiriting" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Parol kamida 6 belgi bo'lishi kerak" }, { status: 400 });
  }

  // Phone must be unique.
  const existing = await prisma.trainer.findUnique({ where: { phone: normalized }, select: { id: true } });
  if (existing) {
    return NextResponse.json({ error: "Bu telefon raqami allaqachon mavjud" }, { status: 409 });
  }

  const email = phoneToEmail(normalized);
  const admin = createSupabaseAdminClient();

  // Create a confirmed auth user (no email/SMS sent).
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, phone: normalized },
  });

  if (error || !data.user) {
    return NextResponse.json(
      { error: error?.message ?? "Akkaunt yaratib bo'lmadi" },
      { status: 400 }
    );
  }

  try {
    const trainer = await prisma.trainer.create({
      data: {
        id: data.user.id,
        email,
        phone: normalized,
        name,
        plan,
        referral,
        groups: { create: DEFAULT_GROUPS },
      },
    });
    return NextResponse.json(trainer, { status: 201 });
  } catch (e) {
    // Roll back the auth user if the DB row failed, so phone isn't half-registered.
    await admin.auth.admin.deleteUser(data.user.id).catch(() => {});
    return NextResponse.json(
      { error: "Bazaga yozishda xatolik. Qayta urinib ko'ring." },
      { status: 500 }
    );
  }
}
