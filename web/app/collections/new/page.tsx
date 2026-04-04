import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/site-header'
import { NewCollectionForm } from '@/components/new-collection-form'

export default async function NewCollectionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-xl px-4 py-12">
        <h1 className="text-2xl font-extrabold text-foreground mb-8">New collection</h1>
        <NewCollectionForm userId={user.id} />
      </main>
    </div>
  )
}
