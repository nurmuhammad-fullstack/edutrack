import { NextResponse } from "next/server";
import { getTrainerId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { planLimits, studentLimitMessage } from "@/lib/plan";

// Trainer adds a student by hand (no Mini App). Created ACTIVE — no approval
// needed since the trainer entered them directly.
export async function POST(req: Request) {
  const trainerId = await getTrainerId();
  if (!trainerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Enforce the active-student limit for the trainer's plan.
  const trainer = await prisma.trainer.findUnique({ where: { id: trainerId }, select: { plan: true } });
  const activeCount = await prisma.student.count({ where: { trainerId, status: "ACTIVE" } });
  if (activeCount >= planLimits(trainer?.plan).maxStudents) {
    return NextResponse.json(
      { error: studentLimitMessage(trainer?.plan ?? "FREE"), code: "LIMIT" },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Noto'g'ri so'rov" }, { status: 400 });

  const fullName = typeof body.full_name === "string" ? body.full_name.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const groupId = body.group_id != null && body.group_id !== "" ? Number(body.group_id) : null;
  const paymentDay =
    body.payment_day != null && body.payment_day !== "" ? Number(body.payment_day) : null;

  if (!fullName || fullName.length < 2 || fullName.length > 100) {
    return NextResponse.json({ error: "Ism 2-100 belgi bo'lishi kerak" }, { status: 400 });
  }
  if (paymentDay !== null && (!Number.isInteger(paymentDay) || paymentDay < 1 || paymentDay > 31)) {
    return NextResponse.json({ error: "To'lov kuni 1-31 oralig'ida" }, { status: 400 });
  }

  // If a group is given it must belong to this trainer.
  if (groupId !== null) {
    const group = await prisma.group.findFirst({
      where: { id: groupId, trainerId },
      select: { id: true },
    });
    if (!group) return NextResponse.json({ error: "Guruh topilmadi" }, { status: 400 });
  }

  const student = await prisma.student.create({
    data: {
      trainerId,
      fullName,
      phone: phone || "—",
      groupId,
      paymentDay,
      status: "ACTIVE",
    },
  });

  return NextResponse.json(student, { status: 201 });
}
