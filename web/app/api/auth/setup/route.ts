import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await req.json();

  // Idempotent: only create if not exists
  const existing = await prisma.trainer.findUnique({ where: { id: user.id } });
  if (existing) return NextResponse.json(existing);

  const trainer = await prisma.trainer.create({
    data: {
      id: user.id,
      email: user.email!,
      name: name || null,
      plan: "FREE",
      // Seed default groups for the trainer
      groups: {
        create: [
          { name: "1-guruh · Boshlang'ich", monthlyFee: 450000 },
          { name: "2-guruh · O'rta",        monthlyFee: 500000 },
          { name: "3-guruh · Yuqori",       monthlyFee: 600000 },
        ],
      },
    },
  });

  return NextResponse.json(trainer, { status: 201 });
}
