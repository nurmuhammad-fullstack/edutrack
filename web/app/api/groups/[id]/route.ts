import { NextResponse } from "next/server";
import { getTrainerId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const trainerId = await getTrainerId();
  if (!trainerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const group = await prisma.group.findFirst({
    where: { id: Number(id), trainerId },
  });
  if (!group) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.group.delete({ where: { id: Number(id) } });

  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const trainerId = await getTrainerId();
  if (!trainerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { name, monthlyFee, lessonDays } = await req.json();

  const group = await prisma.group.findFirst({
    where: { id: Number(id), trainerId },
  });
  if (!group) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const days = Array.isArray(lessonDays)
    ? [...new Set(lessonDays.map(Number).filter((d) => Number.isInteger(d) && d >= 0 && d <= 6))]
    : undefined;

  const updated = await prisma.group.update({
    where: { id: Number(id) },
    data: {
      ...(name ? { name } : {}),
      ...(monthlyFee !== undefined && monthlyFee !== "" ? { monthlyFee: Number(monthlyFee) } : {}),
      ...(days !== undefined ? { lessonDays: days } : {}),
    },
  });

  return NextResponse.json(updated);
}
