import { NextResponse } from "next/server";

export async function POST() {
  // If Supabase is configured, sign out
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const { createSupabaseServerClient } = await import("@/lib/supabase-server");
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }

  return NextResponse.json({ ok: true });
}
