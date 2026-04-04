import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/site-header'

const STATUS_LABEL: Record<string, string> = {
  saved: 'Idea',
  planned: 'Planned',
  completed: 'Done',
}

const STATUS_COLOR: Record<string, string> = {
  saved: 'bg-muted text-muted-foreground',
  planned: 'bg-accent/30 text-accent-foreground',
  completed: 'bg-primary/15 text-primary',
}

export default async function DateBuilderPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: plans } = await supabase
    .from('date_plans')
    .select('id, title, slug, description, status, visited_on, is_public, rating_overall, date_stops(count)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground">Date Builder</h1>
            <p className="text-sm text-muted-foreground mt-1">Plan multi-stop date itineraries</p>
          </div>
          <Link
            href="/date-builder/new"
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            + New plan
          </Link>
        </div>

        {plans && plans.length > 0 ? (
          <div className="space-y-3">
            {plans.map(plan => {
              const stopCount = (plan.date_stops as any)?.[0]?.count ?? 0
              return (
                <Link
                  key={plan.id}
                  href={`/plan/${plan.slug}`}
                  className="group flex items-start justify-between gap-4 rounded-2xl bg-card border border-border p-5 hover:shadow-md transition-shadow"
                >
                  <div className="min-w-0 space-y-1">
                    <h2 className="font-bold text-foreground group-hover:text-primary transition-colors">
                      {plan.title}
                    </h2>
                    {plan.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1">{plan.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STATUS_COLOR[plan.status]}`}>
                        {STATUS_LABEL[plan.status]}
                      </span>
                      <span className="text-xs text-muted-foreground">{stopCount} {stopCount === 1 ? 'stop' : 'stops'}</span>
                      {plan.visited_on && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(plan.visited_on).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      )}
                      {!plan.is_public && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Private</span>
                      )}
                    </div>
                  </div>
                  {plan.rating_overall !== null && (
                    <div className="text-lg font-black text-primary shrink-0">
                      ★ {Number(plan.rating_overall).toFixed(1)}
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-14 text-center space-y-4">
            <p className="text-4xl">🗺️</p>
            <p className="text-xl font-bold text-foreground">No date plans yet</p>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Build multi-stop itineraries, share them with your partner, and revisit the highlights.
            </p>
            <Link
              href="/date-builder/new"
              className="inline-block rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Plan your first date
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
