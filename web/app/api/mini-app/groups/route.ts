import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public endpoint — no auth needed (student side)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const trainerId = searchParams.get("trainer");

  if (!trainerId) {
    return NextResponse.json({ error: "trainer kerak" }, { status: 400 });
  }

  const groups = await prisma.group.findMany({
    where: { trainerId },
    orderBy: { id: "asc" },
  });

  return NextResponse.json(groups);
}
