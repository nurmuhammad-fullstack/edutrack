import { NextResponse } from "next/server";
import { getTrainerId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Update a student's editable fields (currently: monthly payment day).
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const trainerId = await getTrainerId();
  if (!trainerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const data: { paymentDay?: number | null } = {};

  if ("paymentDay" in body) {
    const raw = body.paymentDay;
    if (raw === null || raw === "") {
      data.paymentDay = null;
    } else {
      const n = Number(raw);
      if (!Number.isInteger(n) || n < 1 || n > 31) {
        return NextResponse.json({ error: "paymentDay 1-31 oralig'ida bo'lishi kerak" }, { status: 400 });
      }
      data.paymentDay = n;
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Hech narsa yangilanmadi" }, { status: 400 });
  }

  // Scope to this trainer so one trainer can't edit another's students.
  const result = await prisma.student.updateMany({
    where: { id: Number(id), trainerId },
    data,
  });
  if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const student = await prisma.student.findUnique({ where: { id: Number(id) } });
  return NextResponse.json(student);
}

// Delete a student (and their payments, via cascade). Scoped to this trainer.
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const trainerId = await getTrainerId();
  if (!trainerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const result = await prisma.student.deleteMany({
    where: { id: Number(id), trainerId },
  });
  if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
