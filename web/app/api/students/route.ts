import { NextResponse } from "next/server";
import { getTrainerId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function GET(req: Request) {
  const trainerId = await getTrainerId();
  if (!trainerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const telegramId = searchParams.get("telegram_id");

  if (telegramId) {
    const student = await prisma.student.findFirst({
      where: { trainerId, telegramId },
    });
    return NextResponse.json(student ?? null);
  }

  const students = await prisma.student.findMany({
    where: {
      trainerId,
      ...(status ? { status: status.toUpperCase() as "PENDING" | "ACTIVE" | "REJECTED" } : {}),
    },
    include: { group: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(students);
}

export async function POST(req: Request) {
  // This endpoint is public (student Mini App). Throttle to prevent spam
  // registrations: 5 submissions per minute per IP.
  const limited = rateLimit(`student-register:${clientIp(req)}`, 5, 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Juda ko'p urinish. Birozdan keyin qayta urinib ko'ring." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Noto'g'ri so'rov" }, { status: 400 });

  const trainerId = typeof body.trainer_id === "string" ? body.trainer_id.trim() : "";
  const fullName = typeof body.full_name === "string" ? body.full_name.trim() : "";
  const phoneRaw = typeof body.phone === "string" ? body.phone.trim() : "";
  const telegramId = body.telegram_id != null ? String(body.telegram_id).trim() : null;
  const groupId = body.group_id != null && body.group_id !== "" ? Number(body.group_id) : null;

  // Field validation
  if (!trainerId || !fullName || !phoneRaw) {
    return NextResponse.json(
      { error: "trainer_id, full_name, phone majburiy" },
      { status: 400 }
    );
  }
  if (fullName.length < 2 || fullName.length > 100) {
    return NextResponse.json({ error: "Ism 2-100 belgi bo'lishi kerak" }, { status: 400 });
  }
  // Phone: digits, spaces and +; 7-20 chars.
  const phone = phoneRaw;
  if (!/^[+\d][\d\s-]{6,19}$/.test(phone)) {
    return NextResponse.json({ error: "Telefon raqami noto'g'ri" }, { status: 400 });
  }
  if (groupId !== null && !Number.isInteger(groupId)) {
    return NextResponse.json({ error: "group_id noto'g'ri" }, { status: 400 });
  }
  if (telegramId && telegramId.length > 32) {
    return NextResponse.json({ error: "telegram_id noto'g'ri" }, { status: 400 });
  }

  // Trainer must actually exist (don't trust the client-supplied id).
  const trainer = await prisma.trainer.findUnique({ where: { id: trainerId }, select: { id: true } });
  if (!trainer) {
    return NextResponse.json({ error: "O'qituvchi topilmadi" }, { status: 404 });
  }

  // If a group is given, it must belong to this trainer.
  if (groupId !== null) {
    const group = await prisma.group.findFirst({
      where: { id: groupId, trainerId },
      select: { id: true },
    });
    if (!group) {
      return NextResponse.json({ error: "Guruh topilmadi" }, { status: 400 });
    }
  }

  // Idempotent per telegram user.
  if (telegramId) {
    const existing = await prisma.student.findFirst({
      where: { trainerId, telegramId },
    });
    if (existing) return NextResponse.json(existing);
  }

  const student = await prisma.student.create({
    data: {
      trainerId,
      fullName,
      phone,
      groupId,
      telegramId,
      status: "PENDING",
    },
  });

  return NextResponse.json(student, { status: 201 });
}
