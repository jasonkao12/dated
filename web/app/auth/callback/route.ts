import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Password recovery — send to reset page
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/auth/reset-password`)
      }

      // New signup — check if onboarding is needed
      if (next === '/' || next === '') {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('id', user.id)
            .single()
          if (!profile?.onboarding_completed) {
            return NextResponse.redirect(`${origin}/onboarding`)
          }
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=confirmation_failed`)
}
