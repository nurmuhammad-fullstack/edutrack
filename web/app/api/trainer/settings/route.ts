import { NextResponse } from "next/server";
import { getTrainerId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Trainer updates their own preferences (currently: hide/show attendance tab).
export async function PATCH(req: Request) {
  const trainerId = await getTrainerId();
  if (!trainerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const data: { attendanceEnabled?: boolean } = {};

  if (typeof body.attendanceEnabled === "boolean") {
    data.attendanceEnabled = body.attendanceEnabled;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  await prisma.trainer.update({ where: { id: trainerId }, data });
  return NextResponse.json({ ok: true });
}
