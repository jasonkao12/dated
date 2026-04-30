import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan } = await req.json()
  if (!plan?.title || !plan?.stops) {
    return NextResponse.json({ error: 'Invalid plan data' }, { status: 400 })
  }

  // Generate slug
  const slug = plan.title.trim().toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 50) + '-' + Math.random().toString(36).slice(2, 5)

  // Insert date plan
  const { data: savedPlan, error: planErr } = await supabase
    .from('date_plans')
    .insert({
      user_id: user.id,
      title: plan.title,
      description: plan.description ?? null,
      body: plan.weather_note ?? null,
      slug,
      status: 'planned',
      is_public: true,
    })
    .select('id, slug')
    .single()

  if (planErr || !savedPlan) {
    return NextResponse.json({ error: planErr?.message ?? 'Failed to save plan' }, { status: 500 })
  }

  // Upsert places and insert stops
  for (let i = 0; i < plan.stops.length; i++) {
    const stop = plan.stops[i]
    let placeId: string | null = null

    const venueName = stop.verified_name ?? stop.venue_name
    if (venueName) {
      let query = supabase.from('places').select('id')

      if (stop.google_place_id) {
        const { data: existing } = await query.eq('google_place_id', stop.google_place_id).maybeSingle()
        if (existing) {
          placeId = existing.id
          // Refresh coordinates
          await supabase.from('places').update({
            name: venueName, address: stop.address, lat: stop.lat, lng: stop.lng,
            last_refreshed_at: new Date().toISOString(),
          }).eq('id', existing.id)
        } else {
          const { data: newPlace } = await supabase.from('places').insert({
            name: venueName,
            google_place_id: stop.google_place_id,
            address: stop.address ?? null,
            city: stop.neighbourhood ? `${stop.neighbourhood}, Vancouver` : 'Vancouver, BC',
            place_type: stop.venue_type ?? null,
            lat: stop.lat ?? null,
            lng: stop.lng ?? null,
            last_refreshed_at: new Date().toISOString(),
          }).select('id').single()
          placeId = newPlace?.id ?? null
        }
      } else {
        // No google_place_id — plain name upsert
        const { data: existing } = await supabase.from('places').select('id')
          .eq('name', venueName).maybeSingle()
        if (existing) {
          placeId = existing.id
        } else {
          const { data: newPlace } = await supabase.from('places').insert({
            name: venueName,
            city: stop.neighbourhood ? `${stop.neighbourhood}, Vancouver` : 'Vancouver, BC',
            place_type: stop.venue_type ?? null,
          }).select('id').single()
          placeId = newPlace?.id ?? null
        }
      }
    }

    await supabase.from('date_stops').insert({
      date_plan_id: savedPlan.id,
      place_id: placeId,
      stop_order: i,
      duration_minutes: stop.duration_minutes ?? null,
      travel_time_to_next_minutes: stop.travel_to_next_minutes ?? null,
      notes: stop.notes ?? null,
    })
  }

  return NextResponse.json({ slug: savedPlan.slug })
}
