import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { logApiUsage } from '@/lib/usage'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.FROM_EMAIL ?? 'Dated <support@getdated.app>'

// POST /api/push/digest — send unread notification digests to all users
// Call this on a schedule (e.g., daily via cron or Vercel cron)
export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()

  // Get users with unread, un-emailed notifications
  const { data: pending } = await supabase
    .from('notifications')
    .select('id, user_id, type, body, actor:profiles!actor_id(username, display_name)')
    .eq('read', false)
    .eq('emailed', false)
    .order('created_at', { ascending: false })

  if (!pending || pending.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  // Group by user
  const byUser = new Map<string, typeof pending>()
  for (const n of pending) {
    const list = byUser.get(n.user_id) ?? []
    list.push(n)
    byUser.set(n.user_id, list)
  }

  let sent = 0

  for (const [userId, notifications] of byUser) {
    // Get user email
    const { data: userData } = await supabase.auth.admin.getUserById(userId)
    const email = userData?.user?.email
    if (!email) continue

    const count = notifications.length
    const lines = notifications.slice(0, 5).map(n => {
      const actor = n.actor as unknown as { username: string; display_name: string | null } | null
      const name = actor?.display_name ?? actor?.username ?? 'Someone'
      const action = n.type === 'comment' ? 'commented on your review'
        : n.type === 'reaction' ? 'reacted to your review'
        : n.type === 'couple_accepted' ? 'linked with you'
        : n.type === 'new_follower' ? 'started following you'
        : 'interacted with you'
      return `<li><strong>${name}</strong> ${action}</li>`
    })

    const html = `
      <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">You have ${count} new notification${count > 1 ? 's' : ''}</h2>
        <ul style="padding-left: 20px; line-height: 1.8;">${lines.join('')}</ul>
        ${count > 5 ? `<p style="color: #888;">...and ${count - 5} more</p>` : ''}
        <p><a href="https://getdated.app" style="color: #7c3aed; font-weight: 600;">Open Dated</a></p>
        <p style="color: #aaa; font-size: 12px; margin-top: 24px;">
          You're receiving this because you have unread notifications.
          <a href="https://getdated.app/settings/notifications" style="color: #888;">Manage preferences</a>
        </p>
      </div>
    `

    await resend.emails.send({
      from: FROM,
      to: email,
      subject: `You have ${count} new notification${count > 1 ? 's' : ''} on Dated`,
      html,
    })
    await logApiUsage({ service: 'resend', endpoint: 'digest' })

    // Mark as emailed
    const ids = notifications.map(n => n.id)
    await supabase.from('notifications').update({ emailed: true }).in('id', ids)

    sent++
  }

  return NextResponse.json({ sent })
}
