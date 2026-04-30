'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

async function getAuthenticatedUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return { supabase, user }
}

// ── Reviews ───────────────────────────────────────────────────────────────────

export async function publishReviewDraft(reviewId: string): Promise<{ error?: string }> {
  const { supabase, user } = await getAuthenticatedUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('reviews')
    .update({ is_draft: false, is_public: true })
    .eq('id', reviewId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/profile')
  revalidatePath(`/u/${user.id}`)
  return {}
}

export async function deleteReviewDraft(reviewId: string): Promise<{ error?: string }> {
  const { supabase, user } = await getAuthenticatedUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId)
    .eq('user_id', user.id)
    .eq('is_draft', true)

  if (error) return { error: error.message }
  revalidatePath('/profile')
  return {}
}

// ── Date plans ────────────────────────────────────────────────────────────────

export async function publishPlanDraft(planId: string): Promise<{ error?: string }> {
  const { supabase, user } = await getAuthenticatedUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('date_plans')
    .update({ is_draft: false })
    .eq('id', planId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/profile')
  revalidatePath('/date-builder')
  return {}
}

export async function deletePlanDraft(planId: string): Promise<{ error?: string }> {
  const { supabase, user } = await getAuthenticatedUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('date_plans')
    .delete()
    .eq('id', planId)
    .eq('user_id', user.id)
    .eq('is_draft', true)

  if (error) return { error: error.message }
  revalidatePath('/profile')
  revalidatePath('/date-builder')
  return {}
}
