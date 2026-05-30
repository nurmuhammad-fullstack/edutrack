import { createSupabaseServerClient } from "./supabase-server";

export async function getTrainerId(): Promise<string | null> {
  // Dev bypass: if Supabase is not configured, use DEV_TRAINER_ID
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return process.env.DEV_TRAINER_ID ?? null;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.id ?? null;
}
