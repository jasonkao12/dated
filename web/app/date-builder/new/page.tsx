import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/site-header'
import { DatePlanBuilder } from '@/components/date-plan-builder'

export default async function NewDatePlanPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-xl px-4 py-8">
        <h1 className="text-2xl font-extrabold text-foreground mb-6">Plan a new date</h1>
        <DatePlanBuilder userId={user.id} />
      </main>
    </div>
  )
}
