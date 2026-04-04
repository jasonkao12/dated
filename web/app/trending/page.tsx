import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/site-header'
import { ReviewCard, type ReviewCardData } from '@/components/review-card'

export const revalidate = 3600  // revalidate hourly

export default async function TrendingPage() {
  const supabase = await createClient()

  // Get reaction counts per review
  const { data: reactionCounts } = await supabase
    .from('reactions')
    .select('review_id')

  const countMap: Record<string, number> = {}
  for (const r of reactionCounts ?? []) {
    countMap[r.review_id] = (countMap[r.review_id] ?? 0) + 1
  }

  // Fetch recent public reviews (last 90 days as the pool)
  const since = new Date()
  since.setDate(since.getDate() - 90)

  const { data: rawReviews } = await supabase
    .from('reviews')
    .select(`
      id, slug, title, body, visited_on, rating_overall, is_public, created_at, view_count,
      profiles ( id, username, display_name, avatar_url ),
      places ( id, name, city ),
      review_photos ( id, storage_path, sort_order ),
      review_tags ( date_tags ( id, label, emoji ) )
    `)
    .eq('is_public', true)
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false })
    .limit(100)

  // Score = reactions * 3 + view_count
  const scored = (rawReviews ?? []).map((r: any) => ({
    ...r,
    _score: (countMap[r.id] ?? 0) * 3 + (r.view_count ?? 0),
  }))
  scored.sort((a: any, b: any) => b._score - a._score)

  const trending = scored.slice(0, 24) as unknown as ReviewCardData[]

  // Also build top places from this pool
  const placeCounts: Record<string, { name: string; city: string | null; count: number }> = {}
  for (const r of scored) {
    const place = r.places as { id?: string; name?: string; city?: string | null } | null
    if (place?.id) {
      if (!placeCounts[place.id]) {
        placeCounts[place.id] = { name: place.name ?? '', city: place.city ?? null, count: 0 }
      }
      placeCounts[place.id].count++
    }
  }
  const topPlaces = Object.entries(placeCounts)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 8)

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-8 space-y-8">

        <div>
          <h1 className="text-3xl font-extrabold text-foreground">Trending</h1>
          <p className="text-sm text-muted-foreground mt-1">Most popular dates in the last 90 days</p>
        </div>

        {/* Hot places */}
        {topPlaces.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Hot right now</h2>
            <div className="flex flex-wrap gap-2">
              {topPlaces.map(([id, place]) => (
                <div
                  key={id}
                  className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2"
                >
                  <span className="text-sm font-semibold text-foreground">{place.name}</span>
                  {place.city && <span className="text-xs text-muted-foreground">{place.city}</span>}
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                    {place.count} {place.count === 1 ? 'review' : 'reviews'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trending reviews */}
        {trending.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Top dates</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {trending.map(review => (
                <ReviewCard key={review.slug} review={review} />
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-14 text-center space-y-3">
            <p className="text-lg font-semibold text-foreground">Not enough data yet</p>
            <p className="text-sm text-muted-foreground">Trending will populate as the community grows.</p>
            <Link
              href="/dates"
              className="inline-block rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Browse all dates
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
