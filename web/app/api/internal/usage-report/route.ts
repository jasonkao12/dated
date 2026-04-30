import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { COST_ESTIMATES } from '@/lib/usage'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.FROM_EMAIL ?? 'Dated <support@getdated.app>'
const ADMIN_EMAIL = 'jason@getdated.app'

// POST /api/internal/usage-report — daily usage digest
// Schedule: daily at 6am PST (14:00 UTC)
export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()
  const now = new Date()
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // --- Last 24h usage ---
  const { data: dailyLogs } = await supabase
    .from('api_usage_logs')
    .select('service, status, cost_cents, tokens_in, tokens_out')
    .gte('created_at', yesterday.toISOString())

  // --- Last 30d usage ---
  const { data: monthlyLogs } = await supabase
    .from('api_usage_logs')
    .select('service, status, cost_cents')
    .gte('created_at', thirtyDaysAgo.toISOString())

  // --- User stats ---
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  const { count: newUsersToday } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', yesterday.toISOString())

  const { count: totalReviews } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true })

  const { count: reviewsToday } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', yesterday.toISOString())

  // Aggregate daily by service
  type ServiceStats = { calls: number; errors: number; cost: number; tokensIn: number; tokensOut: number }
  const daily = new Map<string, ServiceStats>()
  for (const log of dailyLogs ?? []) {
    const s = daily.get(log.service) ?? { calls: 0, errors: 0, cost: 0, tokensIn: 0, tokensOut: 0 }
    s.calls++
    if (log.status === 'error') s.errors++
    s.cost += Number(log.cost_cents ?? 0)
    s.tokensIn += log.tokens_in ?? 0
    s.tokensOut += log.tokens_out ?? 0
    daily.set(log.service, s)
  }

  // Aggregate monthly by service
  const monthly = new Map<string, { calls: number; errors: number; cost: number }>()
  for (const log of monthlyLogs ?? []) {
    const s = monthly.get(log.service) ?? { calls: 0, errors: 0, cost: 0 }
    s.calls++
    if (log.status === 'error') s.errors++
    s.cost += Number(log.cost_cents ?? 0)
    monthly.set(log.service, s)
  }

  const dailyTotalCost = Array.from(daily.values()).reduce((sum, s) => sum + s.cost, 0)
  const monthlyTotalCost = Array.from(monthly.values()).reduce((sum, s) => sum + s.cost, 0)

  // Build email
  function serviceRow(name: string, stats: ServiceStats | undefined) {
    if (!stats) return `<tr><td>${name}</td><td>0</td><td>0</td><td>$0.00</td></tr>`
    return `<tr><td>${name}</td><td>${stats.calls}</td><td style="color:${stats.errors > 0 ? '#ef4444' : '#888'}">${stats.errors}</td><td>$${(stats.cost / 100).toFixed(4)}</td></tr>`
  }

  function monthlyRow(name: string) {
    const s = monthly.get(name)
    if (!s) return `<tr><td>${name}</td><td>0</td><td>$0.00</td></tr>`
    return `<tr><td>${name}</td><td>${s.calls}</td><td>$${(s.cost / 100).toFixed(4)}</td></tr>`
  }

  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #7c3aed;">Dated — Daily Usage Report</h2>
      <p style="color: #888; font-size: 14px;">${dateStr}</p>

      <h3 style="margin-top: 24px;">App Stats</h3>
      <table style="border-collapse: collapse; width: 100%; font-size: 14px;">
        <tr><td style="padding: 4px 12px 4px 0;">Total users</td><td><strong>${totalUsers ?? 0}</strong></td></tr>
        <tr><td style="padding: 4px 12px 4px 0;">New users (24h)</td><td><strong>${newUsersToday ?? 0}</strong></td></tr>
        <tr><td style="padding: 4px 12px 4px 0;">Total reviews</td><td><strong>${totalReviews ?? 0}</strong></td></tr>
        <tr><td style="padding: 4px 12px 4px 0;">Reviews (24h)</td><td><strong>${reviewsToday ?? 0}</strong></td></tr>
      </table>

      <h3 style="margin-top: 24px;">API Usage — Last 24 Hours</h3>
      <table style="border-collapse: collapse; width: 100%; font-size: 14px;">
        <tr style="border-bottom: 1px solid #ddd;">
          <th style="text-align: left; padding: 6px 12px 6px 0;">Service</th>
          <th style="text-align: left; padding: 6px 12px 6px 0;">Calls</th>
          <th style="text-align: left; padding: 6px 12px 6px 0;">Errors</th>
          <th style="text-align: left; padding: 6px 12px 6px 0;">Cost</th>
        </tr>
        ${serviceRow('Gemini', daily.get('gemini'))}
        ${serviceRow('Google Places', daily.get('google_places'))}
        ${serviceRow('Resend', daily.get('resend'))}
        <tr style="border-top: 1px solid #ddd; font-weight: bold;">
          <td style="padding: 6px 12px 6px 0;">Total</td>
          <td>${Array.from(daily.values()).reduce((s, v) => s + v.calls, 0)}</td>
          <td>${Array.from(daily.values()).reduce((s, v) => s + v.errors, 0)}</td>
          <td>$${(dailyTotalCost / 100).toFixed(4)}</td>
        </tr>
      </table>

      <h3 style="margin-top: 24px;">API Usage — Last 30 Days</h3>
      <table style="border-collapse: collapse; width: 100%; font-size: 14px;">
        <tr style="border-bottom: 1px solid #ddd;">
          <th style="text-align: left; padding: 6px 12px 6px 0;">Service</th>
          <th style="text-align: left; padding: 6px 12px 6px 0;">Calls</th>
          <th style="text-align: left; padding: 6px 12px 6px 0;">Cost</th>
        </tr>
        ${monthlyRow('gemini')}
        ${monthlyRow('google_places')}
        ${monthlyRow('resend')}
        <tr style="border-top: 1px solid #ddd; font-weight: bold;">
          <td style="padding: 6px 12px 6px 0;">Total</td>
          <td>${Array.from(monthly.values()).reduce((s, v) => s + v.calls, 0)}</td>
          <td>$${(monthlyTotalCost / 100).toFixed(4)}</td>
        </tr>
      </table>

      <h3 style="margin-top: 24px;">Cost Reference</h3>
      <table style="border-collapse: collapse; width: 100%; font-size: 13px; color: #888;">
        <tr><td style="padding: 2px 12px 2px 0;">Gemini Flash Lite (input)</td><td>${COST_ESTIMATES.gemini_flash_lite_per_1k_input}c / 1k tokens</td></tr>
        <tr><td style="padding: 2px 12px 2px 0;">Gemini Flash Lite (output)</td><td>${COST_ESTIMATES.gemini_flash_lite_per_1k_output}c / 1k tokens</td></tr>
        <tr><td style="padding: 2px 12px 2px 0;">Google Places</td><td>${COST_ESTIMATES.google_places_per_request}c / request</td></tr>
        <tr><td style="padding: 2px 12px 2px 0;">Resend</td><td>Free tier (3k/mo)</td></tr>
      </table>

      <p style="color: #aaa; font-size: 12px; margin-top: 32px;">
        Automated report from Dated internal monitoring.
      </p>
    </div>
  `

  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `Dated Usage Report — ${dailyTotalCost > 0 ? `$${(dailyTotalCost / 100).toFixed(2)} today` : 'No API costs today'}`,
    html,
  })

  return NextResponse.json({
    sent: true,
    daily: Object.fromEntries(daily),
    monthly_cost: `$${(monthlyTotalCost / 100).toFixed(4)}`,
  })
}
