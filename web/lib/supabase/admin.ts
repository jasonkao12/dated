import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Admin client bypasses RLS — use only in server-side API routes
let _admin: SupabaseClient | null = null

export function getSupabaseAdmin() {
  if (!_admin) {
    _admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
  }
  return _admin
}
