import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/site-header'
import { ShareButton } from '@/components/share-button'

type Props = { params: Promise<{ slug: string }> }

const STATUS_LABEL: Record<string, { emoji: string; label: string }> = {
  saved:     { emoji: '💡', label: 'Date idea' },
  planned:   { emoji: '📅', label: 'Planned' },
  completed: { emoji: '✅', label: 'Completed' },
}

export default async function PlanPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: plan } = await supabase
    .from('date_plans')
    .select(`
      id, title, slug, description, status, visited_on, is_public, rating_overall, body,
      user_id,
      profiles ( username, display_name ),
      date_stops (
        id, stop_order, duration_minutes, notes,
        places ( name, city, place_type )
      )
    `)
    .eq('slug', slug)
    .single()

  if (!plan) notFound()
  if (!plan.is_public && plan.user_id !== user?.id) notFound()

  const stops = [...((plan.date_stops as any[]) ?? [])].sort((a, b) => a.stop_order - b.stop_order)
  const owner = plan.profiles as { username: string; display_name: string | null } | null
  const isOwner = user?.id === plan.user_id
  const statusInfo = STATUS_LABEL[plan.status] ?? { emoji: '', label: plan.status }
  const planUrl = `https://getdated.app/plan/${slug}`

  const visitedDate = plan.visited_on
    ? new Date(plan.visited_on).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-8 space-y-6">

        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm">{statusInfo.emoji}</span>
                <span className="text-xs font-semibold text-muted-foreground">{statusInfo.label}</span>
                {visitedDate && (
                  <span className="text-xs text-muted-foreground">· {visitedDate}</span>
                )}
              </div>
              <h1 className="text-3xl font-extrabold text-foreground">{plan.title}</h1>
              {owner && (
                <p className="text-sm text-muted-foreground">
                  by{' '}
                  <Link href={`/u/${owner.username}`} className="hover:text-primary transition-colors font-medium">
                    {owner.display_name ?? owner.username}
                  </Link>
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <ShareButton url={planUrl} title={plan.title} />
              {isOwner && (
                <Link
                  href="/date-builder"
                  className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  My plans
                </Link>
              )}
            </div>
          </div>

          {plan.description && (
            <p className="text-foreground/80 leading-relaxed">{plan.description}</p>
          )}

          {plan.rating_overall !== null && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1">
              <span className="text-primary font-black">★ {Number(plan.rating_overall).toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">overall</span>
            </div>
          )}
        </div>

        {/* Stops */}
        {stops.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Itinerary · {stops.length} {stops.length === 1 ? 'stop' : 'stops'}
            </h2>
            <div className="relative">
              {/* Connector line */}
              <div className="absolute left-[18px] top-6 bottom-6 w-0.5 bg-border" />
              <div className="space-y-3">
                {stops.map((stop, i) => {
                  const place = stop.places as { name?: string; city?: string | null; place_type?: string | null } | null
                  return (
                    <div key={stop.id} className="flex gap-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground z-10">
                        {i + 1}
                      </div>
                      <div className="flex-1 rounded-2xl bg-card border border-border p-4 space-y-1">
                        {place?.name ? (
                          <p className="font-bold text-foreground">{place.name}</p>
                        ) : (
                          <p className="text-muted-foreground italic">Stop {i + 1}</p>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {place?.city && (
                            <span className="text-xs text-muted-foreground">{place.city}</span>
                          )}
                          {place?.place_type && (
                            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground capitalize">
                              {place.place_type}
                            </span>
                          )}
                          {stop.duration_minutes && (
                            <span className="text-xs text-muted-foreground">~{stop.duration_minutes} min</span>
                          )}
                        </div>
                        {stop.notes && (
                          <p className="text-sm text-foreground/70 mt-1">{stop.notes}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Body notes */}
        {plan.body && (
          <div className="rounded-2xl bg-card border border-border p-5">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{plan.body}</p>
          </div>
        )}

        {/* Sign-up CTA for non-users */}
        {!user && (
          <div className="rounded-2xl border border-secondary bg-secondary/40 p-6 text-center space-y-3">
            <p className="font-bold text-lg text-foreground">Plan your own dates</p>
            <p className="text-sm text-muted-foreground">
              Create an account to build date itineraries, log reviews, and share with your partner.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Get started — it&apos;s free
            </Link>
          </div>
        )}

      </main>
    </div>
  )
}
