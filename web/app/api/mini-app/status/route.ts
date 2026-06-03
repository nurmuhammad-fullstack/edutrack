import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const trainerId = searchParams.get("trainer");
  const telegramId = searchParams.get("telegram_id");

  if (!trainerId || !telegramId) {
    return NextResponse.json(null);
  }

  const student = await prisma.student.findFirst({
    where: { trainerId, telegramId },
  });

  return NextResponse.json(student ?? null);
}
