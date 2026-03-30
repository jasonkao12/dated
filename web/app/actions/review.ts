'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { generateSlug } from '@/lib/utils'

export type ReviewState = { error?: string; fieldErrors?: Record<string, string> }

export async function createReview(_prev: ReviewState, formData: FormData): Promise<ReviewState> {
  const supabase = await createClient()

  // 1. Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'You must be logged in to write a review.' }
  }

  // 2. Extract fields
  const venue_name = (formData.get('venue_name') as string | null)?.trim() ?? ''
  const venue_city = (formData.get('venue_city') as string | null)?.trim() ?? ''
  const venue_type = (formData.get('venue_type') as string | null)?.trim() ?? ''
  const title = (formData.get('title') as string | null)?.trim() ?? ''
  const body = (formData.get('body') as string | null)?.trim() ?? ''
  const visited_on = (formData.get('visited_on') as string | null)?.trim() || null

  const parseRating = (key: string): number | null => {
    const raw = formData.get(key)
    if (!raw || raw === '') return null
    const n = parseFloat(raw as string)
    return isNaN(n) ? null : n
  }

  const rating_overall  = parseRating('rating_overall')
  const rating_ambiance = parseRating('rating_ambiance')
  const rating_food     = parseRating('rating_food')
  const rating_service  = parseRating('rating_service')
  const rating_value    = parseRating('rating_value')
  const rating_vibe     = parseRating('rating_vibe')

  const tags = formData.getAll('tags') as string[]

  // 3. Validate
  const fieldErrors: Record<string, string> = {}
  if (!title)      fieldErrors.title      = 'Review title is required.'
  if (!venue_name) fieldErrors.venue_name = 'Venue name is required.'
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors }

  // 4. Upsert place
  let placeId: string | null = null
  if (venue_name) {
    const { data: existingPlace } = await supabase
      .from('places')
      .select('id')
      .eq('name', venue_name)
      .eq('city', venue_city)
      .maybeSingle()

    if (existingPlace) {
      placeId = existingPlace.id
    } else {
      const { data: newPlace, error: placeError } = await supabase
        .from('places')
        .insert({ name: venue_name, city: venue_city || null, place_type: venue_type || null })
        .select('id')
        .single()
      if (placeError) return { error: 'Failed to save venue: ' + placeError.message }
      placeId = newPlace.id
    }
  }

  // 5. Insert review
  const slug = generateSlug(title)
  const { data: review, error: reviewError } = await supabase
    .from('reviews')
    .insert({
      slug,
      title,
      body: body || null,
      visited_on,
      rating_overall,
      rating_ambiance,
      rating_food,
      rating_service,
      rating_value,
      rating_vibe,
      place_id: placeId,
      profile_id: user.id,
      is_public: true,
    })
    .select('id')
    .single()

  if (reviewError) return { error: 'Failed to save review: ' + reviewError.message }

  // 6. Insert review_tags
  if (tags.length > 0) {
    const { data: tagRows } = await supabase
      .from('date_tags')
      .select('id, label')
      .in('label', tags)

    if (tagRows && tagRows.length > 0) {
      await supabase.from('review_tags').insert(
        tagRows.map((t) => ({ review_id: review.id, tag_id: t.id }))
      )
    }
  }

  // 7. Redirect
  redirect(`/r/${slug}`)
}
