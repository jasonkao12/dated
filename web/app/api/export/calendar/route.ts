import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { data: reviews } = await supabase
    .from('reviews')
    .select('id, title, body, visited_on, rating_overall, places(name, city)')
    .eq('user_id', user.id)
    .not('visited_on', 'is', null)
    .order('visited_on', { ascending: false })

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Dated//Date Diary//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:My Dates',
    'X-WR-CALDESC:Date diary from Dated',
    'X-WR-TIMEZONE:UTC',
  ]

  for (const review of reviews ?? []) {
    if (!review.visited_on) continue
    const place = review.places as { name?: string; city?: string | null } | null
    const location = [place?.name, place?.city].filter(Boolean).join(', ')
    const dateStr = review.visited_on.replace(/-/g, '')   // "20250315"
    const uid = `${review.id}@getdated.app`
    const summary = escapeIcs(review.title)
    const description = review.body
      ? escapeIcs(review.body.slice(0, 500))
      : review.rating_overall !== null
      ? `Overall: ${review.rating_overall}/5`
      : ''

    lines.push('BEGIN:VEVENT')
    lines.push(`UID:${uid}`)
    lines.push(`DTSTART;VALUE=DATE:${dateStr}`)
    lines.push(`DTEND;VALUE=DATE:${dateStr}`)
    lines.push(`SUMMARY:${summary}`)
    if (location) lines.push(`LOCATION:${escapeIcs(location)}`)
    if (description) lines.push(`DESCRIPTION:${description}`)
    lines.push(`URL:https://getdated.app/r/`)   // slug not fetched to keep query minimal
    lines.push('END:VEVENT')
  }

  lines.push('END:VCALENDAR')

  const ics = lines.join('\r\n') + '\r\n'

  return new Response(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="my-dates.ics"',
      'Cache-Control': 'private, no-cache',
    },
  })
}

function escapeIcs(str: string) {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}
