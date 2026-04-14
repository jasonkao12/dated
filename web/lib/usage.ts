import { getSupabaseAdmin } from '@/lib/supabase/admin'

type LogEntry = {
  service: 'gemini' | 'google_places' | 'resend'
  endpoint?: string
  status?: 'success' | 'error'
  tokens_in?: number
  tokens_out?: number
  cost_cents?: number
  metadata?: Record<string, unknown>
}

// Estimated costs per unit (update as pricing changes)
export const COST_ESTIMATES = {
  gemini_flash_lite_per_1k_input: 0.0075,   // cents per 1k input tokens
  gemini_flash_lite_per_1k_output: 0.03,     // cents per 1k output tokens
  resend_per_email: 0,                        // free tier
  google_places_per_request: 1.7,             // cents per request (basic)
}

export async function logApiUsage(entry: LogEntry) {
  try {
    const supabase = getSupabaseAdmin()
    await supabase.from('api_usage_logs').insert({
      service: entry.service,
      endpoint: entry.endpoint ?? null,
      status: entry.status ?? 'success',
      tokens_in: entry.tokens_in ?? null,
      tokens_out: entry.tokens_out ?? null,
      cost_cents: entry.cost_cents ?? null,
      metadata: entry.metadata ?? null,
    })
  } catch {
    // Don't let logging failures break the app
    console.error('Failed to log API usage')
  }
}
