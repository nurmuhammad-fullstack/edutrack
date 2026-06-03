import { NextResponse } from "next/server";
import { getTrainerId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canUseAttendance } from "@/lib/plan";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const STATUSES = ["PRESENT", "ABSENT", "LATE"] as const;

async function requireProTrainer() {
  const trainerId = await getTrainerId();
  if (!trainerId) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const trainer = await prisma.trainer.findUnique({ where: { id: trainerId }, select: { plan: true } });
  if (!canUseAttendance(trainer?.plan)) {
    return { error: NextResponse.json({ error: "PRO funksiyasi" }, { status: 403 }) };
  }
  return { trainerId };
}

// GET /api/attendance?date=YYYY-MM-DD → this trainer's records for that day.
export async function GET(req: Request) {
  const { trainerId, error } = await requireProTrainer();
  if (error) return error;

  const date = new URL(req.url).searchParams.get("date") ?? "";
  if (!DATE_RE.test(date)) return NextResponse.json({ error: "date noto'g'ri" }, { status: 400 });

  const records = await prisma.attendance.findMany({
    where: { date: new Date(`${date}T00:00:00.000Z`), student: { trainerId } },
    select: { studentId: true, status: true },
  });
  return NextResponse.json(records);
}

// POST /api/attendance → mark a student present/absent/late for a date.
export async function POST(req: Request) {
  const { trainerId, error } = await requireProTrainer();
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  const sid = Number(body.studentId);
  const date = String(body.date ?? "");
  const status = body.status;

  if (!Number.isInteger(sid)) return NextResponse.json({ error: "studentId noto'g'ri" }, { status: 400 });
  if (!DATE_RE.test(date)) return NextResponse.json({ error: "date noto'g'ri" }, { status: 400 });
  if (!STATUSES.includes(status)) return NextResponse.json({ error: "status noto'g'ri" }, { status: 400 });

  const student = await prisma.student.findFirst({ where: { id: sid, trainerId }, select: { id: true } });
  if (!student) return NextResponse.json({ error: "O'quvchi topilmadi" }, { status: 404 });

  const d = new Date(`${date}T00:00:00.000Z`);
  const rec = await prisma.attendance.upsert({
    where: { studentId_date: { studentId: sid, date: d } },
    update: { status },
    create: { studentId: sid, date: d, status },
  });
  return NextResponse.json(rec);
}
