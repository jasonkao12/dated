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
  const now = Date.now()

  const day3ago = new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString()
  const day4ago = new Date(now - 4 * 24 * 60 * 60 * 1000).toISOString()
  const day7ago = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString()
  const day8ago = new Date(now - 8 * 24 * 60 * 60 * 1000).toISOString()

  let nudgeSent = 0
  let discoverySent = 0

  // --- Email 2: Day-3 nudge — users with no reviews ---
  const { data: nudgeCandidates } = await supabase
    .from('profiles')
    .select('id, username, full_name')
    .eq('nudge_emailed', false)
    .eq('welcome_emailed', true)
    .gte('created_at', day4ago)
    .lte('created_at', day3ago)

  for (const profile of nudgeCandidates ?? []) {
    // Check they have no reviews
    const { count } = await supabase
      .from('reviews')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', profile.id)

    if ((count ?? 0) > 0) {
      // They wrote a review — skip nudge but still mark so we don't keep checking
      await supabase.from('profiles').update({ nudge_emailed: true }).eq('id', profile.id)
      continue
    }

    const { data: { user } } = await supabase.auth.admin.getUserById(profile.id)
    if (!user?.email) continue

    const firstName = profile.full_name?.split(' ')[0] || profile.username || 'there'

    const { error } = await resend.emails.send({
      from: 'Jason at Dated <support@getdated.app>',
      to: user.email,
      subject: 'Your first review is waiting',
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #2D1F3D;">
          <p>Hey ${firstName},</p>
          <p>You signed up for Dated a few days ago but haven't written your first review yet.</p>
          <p>That's fine — life gets busy.</p>
          <p>But here's a thought: think about the last date you went on. Even if it was just grabbing coffee. Even if it was a few months ago.</p>
          <p>Write the review. Give it a rating. Add one sentence about why it was good (or not).</p>
          <p>That's it. Your date history starts with one review.</p>
          <p><a href="https://getdated.app/write" style="color: #734e97;">→ Write it now</a></p>
          <p>— Jason</p>
          <p style="font-size: 12px; color: #999;">P.S. The aburi salmon oshi at Miku has a 5/5 ambiance rating on Dated right now. Just saying.</p>
        </div>
      `,
    })

    if (!error) {
      await supabase.from('profiles').update({ nudge_emailed: true }).eq('id', profile.id)
      nudgeSent++
    }
  }

  // --- Email 3: Day-7 feature discovery ---
  const { data: discoveryCandidates } = await supabase
    .from('profiles')
    .select('id, username, full_name')
    .eq('discovery_emailed', false)
    .eq('welcome_emailed', true)
    .gte('created_at', day8ago)
    .lte('created_at', day7ago)

  for (const profile of discoveryCandidates ?? []) {
    const { data: { user } } = await supabase.auth.admin.getUserById(profile.id)
    if (!user?.email) continue

    const firstName = profile.full_name?.split(' ')[0] || profile.username || 'there'

    const { error } = await resend.emails.send({
      from: 'Jason at Dated <support@getdated.app>',
      to: user.email,
      subject: 'Did you know about Date Builder?',
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #2D1F3D;">
          <p>Hey ${firstName},</p>
          <p>Quick one — have you tried Date Builder yet?</p>
          <p>It's one of our favourite features on Dated. Here's how it works:</p>
          <ol>
            <li>Create a new date plan</li>
            <li>Add stops — dinner, drinks, an activity, whatever</li>
            <li>Give each stop a note and a time</li>
            <li>Share a single link with your partner</li>
          </ol>
          <p>No more back-and-forth texts. No more "where are we going again?"</p>
          <p><a href="https://getdated.app/plan/new" style="color: #734e97;">→ Try Date Builder</a></p>
          <p>A few other things worth exploring:</p>
          <p><strong>Collections</strong> — save reviews you want to try into lists. "Anniversary ideas." "Budget date nights." Whatever works.</p>
          <p><strong>Insights</strong> — once you've written a few reviews, your Insights page shows your date history as a heatmap, your average ratings, and achievement badges.</p>
          <p>More coming soon.</p>
          <p>— Jason, Dated</p>
        </div>
      `,
    })

    if (!error) {
      await supabase.from('profiles').update({ discovery_emailed: true }).eq('id', profile.id)
      discoverySent++
    }
  }

  return NextResponse.json({ nudge_sent: nudgeSent, discovery_sent: discoverySent })
}
