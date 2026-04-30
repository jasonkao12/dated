import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/site-header'
import { WriteTabs } from '@/components/write-tabs'
import type { PlanOption } from '@/components/write-tabs'

export const metadata = { title: 'Write a Review | Dated' }

export default async function WritePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rawPlans } = await supabase
    .from('date_plans')
    .select(`
      id, title, slug, status, visited_on,
      date_stops (
        id, stop_order,
        places ( id, name )
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const plans = (rawPlans ?? []) as unknown as PlanOption[]

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="py-10 px-4">
        <div className="mx-auto max-w-2xl space-y-6">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground">Write a Review</h1>
            <p className="mt-1 text-muted-foreground">Share your date experience with the community.</p>
          </div>
          <WriteTabs plans={plans} />
        </div>
      </main>
    </div>
  )
}
