import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/site-header'
import { DatePlanBuilder, type InitialPlanData } from '@/components/date-plan-builder'

type Props = { params: Promise<{ slug: string }> }

export default async function EditDatePlanPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: plan } = await supabase
    .from('date_plans')
    .select(`
      id, title, slug, description, status, visited_on, is_public, is_draft,
      date_stops (
        id, stop_order, duration_minutes, notes,
        places ( id, name, google_place_id, address, lat, lng )
      )
    `)
    .eq('slug', slug)
    .eq('user_id', user.id)
    .single()

  if (!plan) notFound()

  const stops = [...((plan.date_stops as any[]) ?? [])]
    .sort((a, b) => a.stop_order - b.stop_order)
    .map((s, i) => {
      const place = s.places as any
      return {
        id: String(i + 1),
        place_name: place?.name ?? '',
        notes: s.notes ?? '',
        duration_minutes: s.duration_minutes ? String(s.duration_minutes) : '',
        google_place_id: place?.google_place_id ?? '',
        address: place?.address ?? '',
        lat: place?.lat ?? null,
        lng: place?.lng ?? null,
      }
    })

  const initialData: InitialPlanData = {
    planId: plan.id,
    planSlug: plan.slug,
    title: plan.title,
    description: plan.description ?? '',
    status: (plan.status as any) ?? 'planned',
    visitedOn: plan.visited_on ?? '',
    isPublic: plan.is_public,
    isDraft: plan.is_draft,
    stops,
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-xl px-4 py-8">
        <h1 className="text-2xl font-extrabold text-foreground mb-6">Edit date plan</h1>
        <DatePlanBuilder userId={user.id} initialData={initialData} />
      </main>
    </div>
  )
}
