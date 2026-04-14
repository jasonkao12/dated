import { Resend } from 'resend'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.FROM_EMAIL ?? 'Dated <hello@getdated.app>'

type NotifyPayload = {
  type: 'comment' | 'reaction' | 'couple_accepted' | 'new_follower'
  actorId: string
  recipientId: string
  reviewId?: string
  body?: string
}

const PREF_KEY: Record<string, string> = {
  comment: 'email_comments',
  reaction: 'email_reactions',
  couple_accepted: 'email_couple',
  new_follower: 'email_followers',
}

async function getProfile(userId: string) {
  const { data } = await getSupabaseAdmin()
    .from('profiles')
    .select('username, display_name')
    .eq('id', userId)
    .single()
  return data
}

async function getUserEmail(userId: string): Promise<string | null> {
  const { data } = await getSupabaseAdmin().auth.admin.getUserById(userId)
  return data?.user?.email ?? null
}

async function shouldEmail(userId: string, type: string): Promise<boolean> {
  const key = PREF_KEY[type]
  if (!key) return false
  const { data } = await getSupabaseAdmin()
    .from('notification_preferences')
    .select(key)
    .eq('user_id', userId)
    .maybeSingle()
  // Default to true if no preferences row exists
  if (!data) return true
  return (data as unknown as Record<string, boolean>)[key] === true
}

function buildEmail(type: string, actorName: string, body?: string) {
  switch (type) {
    case 'comment':
      return {
        subject: `${actorName} commented on your date`,
        html: `<p><strong>${actorName}</strong> left a comment on your review:</p><p>"${body}"</p><p><a href="https://getdated.app">View on Dated</a></p>`,
      }
    case 'reaction':
      return {
        subject: `${actorName} reacted to your date`,
        html: `<p><strong>${actorName}</strong> reacted to your review.</p><p><a href="https://getdated.app">View on Dated</a></p>`,
      }
    case 'couple_accepted':
      return {
        subject: `${actorName} linked with you on Dated`,
        html: `<p><strong>${actorName}</strong> is now your partner on Dated!</p><p><a href="https://getdated.app/settings/couple">View your couple profile</a></p>`,
      }
    case 'new_follower':
      return {
        subject: `${actorName} started following you`,
        html: `<p><strong>${actorName}</strong> is now following you on Dated.</p><p><a href="https://getdated.app">View on Dated</a></p>`,
      }
    default:
      return { subject: 'New notification from Dated', html: '<p>You have a new notification.</p>' }
  }
}

export async function sendNotification(payload: NotifyPayload) {
  const { type, actorId, recipientId, reviewId, body } = payload

  // Don't notify yourself
  if (actorId === recipientId) return

  const actor = await getProfile(actorId)
  const actorName = actor?.display_name ?? actor?.username ?? 'Someone'

  // Save in-app notification
  await getSupabaseAdmin().from('notifications').insert({
    user_id: recipientId,
    actor_id: actorId,
    type,
    review_id: reviewId ?? null,
    body: body ?? null,
  })

  // Check email preference
  if (!(await shouldEmail(recipientId, type))) return

  const email = await getUserEmail(recipientId)
  if (!email) return

  const { subject, html } = buildEmail(type, actorName, body)

  await resend.emails.send({ from: FROM, to: email, subject, html })

  // Mark as emailed
  // (the row was just inserted above — update the latest one)
  await getSupabaseAdmin()
    .from('notifications')
    .update({ emailed: true })
    .eq('user_id', recipientId)
    .eq('actor_id', actorId)
    .eq('type', type)
    .order('created_at', { ascending: false })
    .limit(1)
}
