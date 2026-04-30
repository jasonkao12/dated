import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/site-header'
import { ChooseDateForm } from '@/components/choose-date-form'

export const metadata = { title: 'Choose a date for me | Dated' }

export default async function ChooseDatePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-lg px-4 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground">Choose a date for me</h1>
          <p className="mt-1 text-sm text-muted-foreground">Tell us what you're in the mood for and we'll plan the whole thing.</p>
        </div>
        <ChooseDateForm />
      </main>
    </div>
  )
}
