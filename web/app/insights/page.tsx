import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/site-header'
import { DateHeatmap } from '@/components/date-heatmap'
import { AchievementBadges } from '@/components/achievement-badges'
import { StarRating } from '@/components/star-rating'

export default async function InsightsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: reviews } = await supabase
    .from('reviews')
    .select(`
      id, slug, title, body, visited_on, rating_overall,
      places ( name, city )
    `)
    .eq('user_id', user.id)
    .order('visited_on', { ascending: false })

  const allReviews = (reviews ?? []) as unknown as {
    id: string; slug: string; title: string; body: string | null
    visited_on: string | null; rating_overall: number | null
    places: { name: string; city: string | null } | null
  }[]

  const currentYear = new Date().getFullYear()

  // Year-specific stats
  const thisYear = allReviews.filter(r => r.visited_on?.startsWith(String(currentYear)))
  const lastYear = allReviews.filter(r => r.visited_on?.startsWith(String(currentYear - 1)))

  const visitedDates = allReviews.map(r => r.visited_on).filter((d): d is string => d !== null)

  const citiesThisYear = new Set(thisYear.map(r => r.places?.city).filter(Boolean))
  const allCities = new Set(allReviews.map(r => r.places?.city).filter(Boolean))

  const ratingsThisYear = thisYear.filter(r => r.rating_overall !== null)
  const avgRating = ratingsThisYear.length > 0
    ? ratingsThisYear.reduce((s, r) => s + r.rating_overall!, 0) / ratingsThisYear.length
    : null

  const bestReview = ratingsThisYear.sort((a, b) => (b.rating_overall ?? 0) - (a.rating_overall ?? 0))[0] ?? null

  // Month breakdown for this year
  const monthCounts: Record<number, number> = {}
  for (const r of thisYear) {
    if (r.visited_on) {
      const m = new Date(r.visited_on).getMonth()
      monthCounts[m] = (monthCounts[m] ?? 0) + 1
    }
  }
  const busyMonth = Object.keys(monthCounts).length > 0
    ? Object.entries(monthCounts).sort((a, b) => b[1] - a[1])[0]
    : null
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

  const totalAllTime = allReviews.length

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-8 space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground">{currentYear} in Review</h1>
            <p className="text-sm text-muted-foreground mt-1">Your date diary at a glance</p>
          </div>
          <Link
            href={`/api/export/calendar`}
            className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
          >
            Export .ics
          </Link>
        </div>

        {/* This year stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="Dates this year" value={String(thisYear.length)} />
          <Stat label="Cities explored" value={String(citiesThisYear.size)} />
          <Stat label="Avg rating" value={avgRating !== null ? avgRating.toFixed(1) + ' ★' : '—'} />
          <Stat label="All time" value={String(totalAllTime)} />
        </div>

        {/* Heatmap */}
        <div className="rounded-2xl bg-card border border-border p-5">
          <DateHeatmap visitedDates={visitedDates} year={currentYear} />
        </div>

        {/* Best date this year */}
        {bestReview && (
          <div className="rounded-2xl bg-card border border-border p-5 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Top rated date this year</p>
            <Link href={`/r/${bestReview.slug}`} className="group block">
              <p className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                {bestReview.title}
              </p>
              {bestReview.places && (
                <p className="text-sm text-muted-foreground">
                  {bestReview.places.name}{bestReview.places.city ? ` · ${bestReview.places.city}` : ''}
                </p>
              )}
              {bestReview.rating_overall !== null && (
                <div className="mt-2">
                  <StarRating value={bestReview.rating_overall} size="sm" showNumber />
                </div>
              )}
            </Link>
          </div>
        )}

        {/* Month breakdown */}
        {Object.keys(monthCounts).length > 0 && (
          <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Activity by month
              {busyMonth && (
                <span className="ml-2 normal-case font-normal text-muted-foreground">
                  — most active: {MONTHS[Number(busyMonth[0])]}
                </span>
              )}
            </p>
            <div className="space-y-2">
              {Object.entries(monthCounts)
                .sort((a, b) => Number(a[0]) - Number(b[0]))
                .map(([month, count]) => {
                  const max = Math.max(...Object.values(monthCounts))
                  return (
                    <div key={month} className="flex items-center gap-3">
                      <span className="w-8 text-xs text-muted-foreground">{MONTHS[Number(month)].slice(0,3)}</span>
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${(count / max) * 100}%` }}
                        />
                      </div>
                      <span className="w-4 text-xs font-semibold text-foreground text-right">{count}</span>
                    </div>
                  )
                })}
            </div>
          </div>
        )}

        {/* Vs last year */}
        {lastYear.length > 0 && (
          <div className="rounded-2xl bg-card border border-border p-5 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">vs. {currentYear - 1}</p>
            <div className="flex items-end gap-3">
              <div className="text-center">
                <p className="text-2xl font-black text-primary">{thisYear.length}</p>
                <p className="text-xs text-muted-foreground">{currentYear}</p>
              </div>
              <p className="text-muted-foreground mb-1">vs</p>
              <div className="text-center">
                <p className="text-2xl font-black text-muted-foreground">{lastYear.length}</p>
                <p className="text-xs text-muted-foreground">{currentYear - 1}</p>
              </div>
              {thisYear.length > lastYear.length && (
                <p className="text-sm text-primary font-semibold ml-2 mb-1">
                  +{thisYear.length - lastYear.length} more this year 🎉
                </p>
              )}
            </div>
          </div>
        )}

        {/* All-time cities */}
        {allCities.size > 0 && (
          <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Cities explored · {allCities.size} total
            </p>
            <div className="flex flex-wrap gap-2">
              {Array.from(allCities).map(city => (
                <span key={city} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                  {city}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Achievements */}
        <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Badges earned</p>
          <AchievementBadges reviews={allReviews as any} />
        </div>

        {allReviews.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-3">
            <p className="text-4xl">📓</p>
            <p className="text-lg font-bold text-foreground">No dates logged yet</p>
            <Link
              href="/write"
              className="inline-block rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Log your first date
            </Link>
          </div>
        )}

      </main>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-4 text-center">
      <p className="text-2xl font-extrabold text-primary tabular-nums">{value}</p>
      <p className="mt-1 text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">{label}</p>
    </div>
  )
}
