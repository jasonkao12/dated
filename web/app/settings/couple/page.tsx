import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/site-header'
import { CoupleConnect } from '@/components/couple-connect'

export default async function CoupleSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-xl px-4 py-12 space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Couple Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Link your account with your partner to share date histories and plan together.
          </p>
        </div>
        <CoupleConnect userId={user.id} />
      </main>
    </div>
  )
}
