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
  const categories = formData.getAll('categories') as string[]

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

  // 7. Insert review_categories
  if (categories.length > 0) {
    const { data: catRows } = await supabase
      .from('categories')
      .select('id, name')
      .in('name', categories)

    if (catRows && catRows.length > 0) {
      await supabase.from('review_categories').insert(
        catRows.map((c) => ({ review_id: review.id, category_id: c.id }))
      )
    }
  }

  // 8. Redirect
  redirect(`/r/${slug}`)
}

export async function updateReview(_prev: ReviewState, formData: FormData): Promise<ReviewState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be logged in.' }

  const reviewId   = formData.get('review_id') as string
  const venue_name = (formData.get('venue_name') as string | null)?.trim() ?? ''
  const venue_city = (formData.get('venue_city') as string | null)?.trim() ?? ''
  const venue_type = (formData.get('venue_type') as string | null)?.trim() ?? ''
  const title      = (formData.get('title') as string | null)?.trim() ?? ''
  const body       = (formData.get('body') as string | null)?.trim() ?? ''
  const visited_on = (formData.get('visited_on') as string | null)?.trim() || null
  const isPublic   = formData.get('is_public') !== 'false'

  const parseRating = (key: string): number | null => {
    const raw = formData.get(key)
    if (!raw || raw === '') return null
    const n = parseFloat(raw as string)
    return isNaN(n) ? null : n
  }

  const fieldErrors: Record<string, string> = {}
  if (!title)      fieldErrors.title      = 'Review title is required.'
  if (!venue_name) fieldErrors.venue_name = 'Venue name is required.'
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors }

  // Verify ownership
  const { data: existing } = await supabase
    .from('reviews')
    .select('id, slug, user_id')
    .eq('id', reviewId)
    .single()

  if (!existing || existing.user_id !== user.id) return { error: 'Review not found or permission denied.' }

  // Upsert place
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
      const { data: newPlace } = await supabase
        .from('places')
        .insert({ name: venue_name, city: venue_city || null, place_type: venue_type || null })
        .select('id')
        .single()
      placeId = newPlace?.id ?? null
    }
  }

  const { error } = await supabase
    .from('reviews')
    .update({
      title,
      body: body || null,
      visited_on,
      rating_overall:  parseRating('rating_overall'),
      rating_ambiance: parseRating('rating_ambiance'),
      rating_food:     parseRating('rating_food'),
      rating_service:  parseRating('rating_service'),
      rating_value:    parseRating('rating_value'),
      rating_vibe:     parseRating('rating_vibe'),
      place_id: placeId,
      is_public: isPublic,
    })
    .eq('id', reviewId)

  if (error) return { error: 'Failed to update review: ' + error.message }

  // Sync tags: delete old, insert new
  const tags = formData.getAll('tags') as string[]
  await supabase.from('review_tags').delete().eq('review_id', reviewId)
  if (tags.length > 0) {
    const { data: tagRows } = await supabase.from('date_tags').select('id, label').in('label', tags)
    if (tagRows?.length) {
      await supabase.from('review_tags').insert(tagRows.map(t => ({ review_id: reviewId, tag_id: t.id })))
    }
  }

  // Sync categories: delete old, insert new
  const categories = formData.getAll('categories') as string[]
  await supabase.from('review_categories').delete().eq('review_id', reviewId)
  if (categories.length > 0) {
    const { data: catRows } = await supabase.from('categories').select('id, name').in('name', categories)
    if (catRows?.length) {
      await supabase.from('review_categories').insert(catRows.map(c => ({ review_id: reviewId, category_id: c.id })))
    }
  }

  redirect(`/r/${existing.slug}`)
}

export async function deleteReview(reviewId: string): Promise<{ error?: string }> {
  'use server'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be logged in.' }

  const { data: existing } = await supabase
    .from('reviews')
    .select('id, user_id')
    .eq('id', reviewId)
    .single()

  if (!existing || existing.user_id !== user.id) return { error: 'Review not found or permission denied.' }

  const { error } = await supabase.from('reviews').delete().eq('id', reviewId)
  if (error) return { error: error.message }

  redirect('/my-dates')
}
