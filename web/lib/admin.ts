import { cookies } from "next/headers";
import crypto from "crypto";

export const ADMIN_COOKIE = "et_admin";

/**
 * Deterministic session token derived from the admin password + a server
 * secret. Stored as an httpOnly cookie; recomputed and compared on each
 * request so there's no session store to maintain.
 */
function expectedToken(): string | null {
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!password || !secret) return null;
  return crypto.createHmac("sha256", secret).update(password).digest("hex");
}

export function adminToken(): string | null {
  return expectedToken();
}

export function verifyPassword(password: string): boolean {
  const real = process.env.ADMIN_PASSWORD;
  if (!real) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(real);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function isAdmin(): Promise<boolean> {
  const token = expectedToken();
  if (!token) return false;
  const cookieStore = await cookies();
  const value = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!value) return false;
  const a = Buffer.from(value);
  const b = Buffer.from(token);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
