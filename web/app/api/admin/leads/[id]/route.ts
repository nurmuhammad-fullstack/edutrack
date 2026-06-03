import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const STATUSES = ["NEW", "CONTACTED", "VERIFIED", "CONVERTED", "REJECTED"] as const;

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const leadId = Number(id);
  if (!Number.isInteger(leadId)) return NextResponse.json({ error: "Bad id" }, { status: 400 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Noto'g'ri so'rov" }, { status: 400 });

  const data: { status?: (typeof STATUSES)[number]; note?: string | null } = {};
  if (typeof body.status === "string" && STATUSES.includes(body.status)) data.status = body.status;
  if (typeof body.note === "string") data.note = body.note.trim().slice(0, 1000) || null;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Hech narsa o'zgartirilmadi" }, { status: 400 });
  }

  const lead = await prisma.lead.update({ where: { id: leadId }, data });
  return NextResponse.json(lead);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const leadId = Number(id);
  if (!Number.isInteger(leadId)) return NextResponse.json({ error: "Bad id" }, { status: 400 });

  await prisma.lead.delete({ where: { id: leadId } }).catch(() => {});
  return NextResponse.json({ ok: true });
}
