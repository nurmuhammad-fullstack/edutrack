import { createClient } from "@supabase/supabase-js";

// Server-only admin client (service role). Used to create confirmed trainer
// accounts without sending emails/SMS. NEVER import this into client code.
export function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
