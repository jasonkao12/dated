import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendNotification } from '@/lib/notifications'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { type, recipientId, reviewId, body } = await req.json()

  if (!type || !recipientId) {
    return NextResponse.json({ error: 'Missing type or recipientId' }, { status: 400 })
  }

  await sendNotification({
    type,
    actorId: user.id,
    recipientId,
    reviewId,
    body,
  })

  return NextResponse.json({ ok: true })
}
