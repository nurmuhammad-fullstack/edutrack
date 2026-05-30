import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { normalizePhone, phoneToEmail } from "@/lib/phone";

const PLANS = ["FREE", "BASIC", "PRO"] as const;

// Admin edits a trainer: name, phone, plan and/or password.
// Changing the phone also moves the underlying Supabase auth identity so the
// trainer can log in with the new number. A new password resets auth too.
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const existing = await prisma.trainer.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

  const data: {
    name?: string;
    plan?: (typeof PLANS)[number];
    phone?: string;
    email?: string;
    referral?: string | null;
  } = {};
  let newEmail: string | null = null;

  if (body.name !== undefined) {
    const name = String(body.name).trim();
    if (name.length < 2 || name.length > 100) {
      return NextResponse.json({ error: "Ism 2-100 belgi bo'lishi kerak" }, { status: 400 });
    }
    data.name = name;
  }

  if (body.referral !== undefined) {
    const r = String(body.referral).trim();
    data.referral = r ? r.slice(0, 60) : null;
  }

  if (body.plan !== undefined) {
    if (!PLANS.includes(body.plan)) {
      return NextResponse.json({ error: "Noto'g'ri tarif" }, { status: 400 });
    }
    data.plan = body.plan;
  }

  if (body.phone !== undefined) {
    const normalized = normalizePhone(String(body.phone));
    if (!normalized) {
      return NextResponse.json({ error: "Telefon raqamini to'g'ri kiriting" }, { status: 400 });
    }
    if (normalized !== existing.phone) {
      const other = await prisma.trainer.findFirst({
        where: { phone: normalized, id: { not: id } },
        select: { id: true },
      });
      if (other) {
        return NextResponse.json({ error: "Bu telefon raqami band" }, { status: 409 });
      }
      data.phone = normalized;
      newEmail = phoneToEmail(normalized);
      data.email = newEmail;
    }
  }

  const password =
    typeof body.password === "string" && body.password.length > 0 ? body.password : null;
  if (password && password.length < 6) {
    return NextResponse.json({ error: "Parol kamida 6 belgi" }, { status: 400 });
  }

  if (Object.keys(data).length === 0 && !password) {
    return NextResponse.json({ error: "Hech narsa o'zgartirilmadi" }, { status: 400 });
  }

  // Update the Supabase auth account first (email and/or password).
  if (newEmail || password) {
    const admin = createSupabaseAdminClient();
    const update: { email?: string; password?: string; email_confirm?: boolean } = {};
    if (newEmail) {
      update.email = newEmail;
      update.email_confirm = true;
    }
    if (password) update.password = password;

    const { error } = await admin.auth.admin.updateUserById(id, update);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  if (Object.keys(data).length > 0) {
    try {
      await prisma.trainer.update({ where: { id }, data });
    } catch {
      // Revert the auth email if the DB write fails, to keep login consistent.
      if (newEmail && existing.email) {
        const admin = createSupabaseAdminClient();
        await admin.auth.admin
          .updateUserById(id, { email: existing.email, email_confirm: true })
          .catch(() => {});
      }
      return NextResponse.json({ error: "Saqlashda xatolik" }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}

// Admin deletes a trainer: removes the DB record (cascades groups, students,
// payments) and the Supabase auth account.
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const trainer = await prisma.trainer.findUnique({ where: { id }, select: { id: true } });
  if (!trainer) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

  // Cascade removes the trainer's groups, students and their payments.
  await prisma.trainer.delete({ where: { id } });

  // Remove the auth account so the phone/email can be reused.
  const admin = createSupabaseAdminClient();
  await admin.auth.admin.deleteUser(id).catch(() => {});

  return NextResponse.json({ ok: true });
}
