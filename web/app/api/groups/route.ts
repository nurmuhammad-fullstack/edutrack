import { NextResponse } from "next/server";
import { getTrainerId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { planLimits, groupLimitMessage } from "@/lib/plan";

export async function GET() {
  const trainerId = await getTrainerId();
  if (!trainerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const groups = await prisma.group.findMany({
    where: { trainerId },
    orderBy: { id: "asc" },
  });

  return NextResponse.json(groups);
}

export async function POST(req: Request) {
  const trainerId = await getTrainerId();
  if (!trainerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, monthlyFee, lessonDays } = await req.json();
  if (!name || !monthlyFee) {
    return NextResponse.json({ error: "name va monthlyFee kerak" }, { status: 400 });
  }

  // Lesson days: array of weekday indices 0-6, deduped.
  const days = Array.isArray(lessonDays)
    ? [...new Set(lessonDays.map(Number).filter((d) => Number.isInteger(d) && d >= 0 && d <= 6))]
    : [];

  // Enforce the group limit for the trainer's plan.
  const trainer = await prisma.trainer.findUnique({ where: { id: trainerId }, select: { plan: true } });
  const groupCount = await prisma.group.count({ where: { trainerId } });
  if (groupCount >= planLimits(trainer?.plan).maxGroups) {
    return NextResponse.json(
      { error: groupLimitMessage(trainer?.plan ?? "FREE"), code: "LIMIT" },
      { status: 403 }
    );
  }

  const group = await prisma.group.create({
    data: { trainerId, name, monthlyFee: Number(monthlyFee), lessonDays: days },
  });

  return NextResponse.json(group, { status: 201 });
}
