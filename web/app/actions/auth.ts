'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const TOS_VERSION = 'v1.0'

export type AuthState = {
  error?: string
  fieldErrors?: Record<string, string>
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email    = formData.get('email') as string
  const password = formData.get('password') as string
  const username = (formData.get('username') as string).trim().toLowerCase()
  const tosAccepted       = formData.get('tos') === 'on'
  const privacyAccepted   = formData.get('privacy') === 'on'
  const marketingOptIn    = formData.get('marketing') === 'on'

  // Validate
  const fieldErrors: Record<string, string> = {}
  if (!email)               fieldErrors.email    = 'Email is required'
  if (!username)            fieldErrors.username = 'Username is required'
  if (username.length < 3)  fieldErrors.username = 'Username must be at least 3 characters'
  if (!/^[a-z0-9_]+$/.test(username))
    fieldErrors.username = 'Only letters, numbers, and underscores'
  if (!password)            fieldErrors.password = 'Password is required'
  if (password.length < 8)  fieldErrors.password = 'Password must be at least 8 characters'
  if (!tosAccepted)     fieldErrors.tos     = 'You must accept the Terms & Conditions'
  if (!privacyAccepted) fieldErrors.privacy = 'You must accept the Privacy Policy'

  if (Object.keys(fieldErrors).length > 0) return { fieldErrors }

  const supabase = await createClient()
  const now = new Date().toISOString()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        tos_accepted_at: now,
        tos_version: TOS_VERSION,
        privacy_policy_accepted_at: now,
        privacy_policy_version: TOS_VERSION,
        marketing_opt_in: marketingOptIn,
        marketing_opt_in_at: marketingOptIn ? now : null,
      },
    },
  })

  if (error) {
    if (error.message.toLowerCase().includes('already registered')) {
      return { fieldErrors: { email: 'An account with this email already exists' } }
    }
    return { error: error.message }
  }

  // Update profile with consent data (trigger creates the row, we update the fields)
  if (data.user) {
    await supabase
      .from('profiles')
      .update({
        username,
        tos_accepted_at: now,
        tos_version: TOS_VERSION,
        privacy_policy_accepted_at: now,
        privacy_policy_version: TOS_VERSION,
        marketing_opt_in: marketingOptIn,
        marketing_opt_in_at: marketingOptIn ? now : null,
      })
      .eq('id', data.user.id)
  }

  redirect('/verify-email')
}

export async function logIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email    = formData.get('email') as string
  const password = formData.get('password') as string

  const fieldErrors: Record<string, string> = {}
  if (!email)    fieldErrors.email    = 'Email is required'
  if (!password) fieldErrors.password = 'Password is required'
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { fieldErrors: { password: 'Invalid email or password' } }
  }

  redirect('/')
}

export async function signOut() {
  'use server'
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

export async function requestPasswordReset(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = formData.get('email') as string
  if (!email) return { fieldErrors: { email: 'Email is required' } }

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://getdated.app'}/auth/reset-password`,
  })

  if (error) return { error: error.message }
  redirect('/forgot-password?sent=1')
}

export async function updatePassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const password = formData.get('password') as string
  const confirm  = formData.get('confirm') as string

  if (!password || password.length < 8)
    return { fieldErrors: { password: 'Password must be at least 8 characters' } }
  if (password !== confirm)
    return { fieldErrors: { confirm: 'Passwords do not match' } }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: error.message }

  redirect('/?reset=1')
}
