// Supabase client — feature-flagged. If the public env vars aren't present at
// build time, `supabase` is null and the app runs exactly as before (local-only
// demo). Only the publishable/anon key is used here — it is safe in the browser
// and protected by Row-Level Security. The service_role secret is NEVER used here.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseEnabled = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = supabaseEnabled
  ? createClient(url as string, anonKey as string, {
      auth: {
        persistSession: true, // keeps users logged in across sessions/tabs
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
