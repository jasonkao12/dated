import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/site-header'
import { OnboardingWizard } from '@/components/onboarding-wizard'

export const metadata = { title: 'Set up your preferences | Dated' }

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Already onboarded — skip back to date builder
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', user.id)
    .single()

  if (profile?.onboarding_completed) redirect('/date-builder')

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-lg px-4 py-8 space-y-2">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <OnboardingWizard />
        </div>
      </main>
    </div>
  )
}
