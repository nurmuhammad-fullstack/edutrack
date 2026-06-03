import { NextResponse } from "next/server";
import { verifyPassword, adminToken, ADMIN_COOKIE } from "@/lib/admin";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  // Throttle brute-force: 5 attempts per 10 minutes per IP.
  const limited = rateLimit(`admin-login:${clientIp(req)}`, 5, 10 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Juda ko'p urinish. Birozdan keyin qayta urinib ko'ring." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } }
    );
  }

  const { password } = await req.json().catch(() => ({ password: "" }));

  if (!verifyPassword(String(password ?? ""))) {
    return NextResponse.json({ error: "Noto'g'ri parol" }, { status: 401 });
  }

  const token = adminToken();
  if (!token) {
    return NextResponse.json({ error: "Admin sozlanmagan" }, { status: 500 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return res;
}
