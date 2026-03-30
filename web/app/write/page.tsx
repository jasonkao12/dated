import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/site-header'
import { WriteForm } from '@/components/write-form'

export default async function WritePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="py-10 px-4">
        <div className="mx-auto max-w-2xl space-y-6">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground">Write a Review</h1>
            <p className="mt-1 text-muted-foreground">Share your date experience with the community.</p>
          </div>
          <WriteForm />
        </div>
      </main>
    </div>
  )
}
