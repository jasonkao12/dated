import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()

  // Find users who haven't received a welcome email yet
  // Look back 25 hours to ensure we don't miss anyone between daily cron runs
  const cutoff = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString()

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, username, full_name, created_at')
    .eq('welcome_emailed', false)
    .gte('created_at', cutoff)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!profiles || profiles.length === 0) return NextResponse.json({ sent: 0 })

  let sent = 0

  for (const profile of profiles) {
    // Get email from auth
    const { data: { user } } = await supabase.auth.admin.getUserById(profile.id)
    if (!user?.email) continue

    const firstName = profile.full_name?.split(' ')[0] || profile.username || 'there'

    const { error: emailError } = await resend.emails.send({
      from: 'Jason at Dated <support@getdated.app>',
      to: user.email,
      subject: 'Welcome to Dated 👋',
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #2D1F3D;">
          <p>Hey ${firstName},</p>
          <p>You just joined Dated — and we're glad you're here.</p>
          <p>Here's what to do first:</p>
          <p><strong>Write your first review.</strong><br>
          Think of the last date you went on. Where did you go? How was the food? The vibe? Give it a rating. It takes 2 minutes and it'll be the start of your date history.</p>
          <p><a href="https://getdated.app/write" style="color: #734e97;">→ Write a review</a></p>
          <p><strong>Browse Vancouver dates.</strong><br>
          There are already reviews from couples in your city. Check out what's trending, find a new spot, or just see how other couples rate their nights out.</p>
          <p><a href="https://getdated.app" style="color: #734e97;">→ Explore the feed</a></p>
          <p>That's it for now. More soon.</p>
          <p>— Jason<br>Founder, Dated</p>
          <p style="font-size: 12px; color: #999;">P.S. If you have a favourite date spot in Vancouver, we want to know about it. Write the review.</p>
        </div>
      `,
    })

    if (!emailError) {
      await supabase.from('profiles').update({ welcome_emailed: true }).eq('id', profile.id)
      sent++
    }
  }

  return NextResponse.json({ sent })
}
