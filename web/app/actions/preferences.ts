'use server'

import { createClient } from '@/lib/supabase/server'

export type DatePreferences = {
  transport_mode: string
  max_travel_minutes: number
  home_neighbourhood: string
  travel_beyond_vancouver: boolean
  dietary: string[]
  drinks_alcohol: boolean
  activity_level: string
  date_length: string
  date_timing: string[]
  relationship_stage: string
  partner_name: string
  repetition_preference: number // -2 to 2
}

export async function savePreferences(prefs: DatePreferences): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('profiles')
    .update({ preferences: prefs, onboarding_completed: true })
    .eq('id', user.id)

  if (error) return { error: error.message }
  return {}
}
