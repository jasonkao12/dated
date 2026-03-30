import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/site-header'

export default async function MyLocationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch distinct places from the user's reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select(`
      id, slug, rating_overall,
      places ( id, name, city, country, place_type, price_level )
    `)
    .eq('user_id', user.id)
    .not('place_id', 'is', null)
    .order('created_at', { ascending: false })

  // Deduplicate by place ID, keep highest rating
  const placeMap = new Map<string, {
    id: string; name: string; city: string | null; country: string | null
    place_type: string | null; price_level: number | null
    reviewSlug: string; rating: number | null; reviewCount: number
  }>()

  for (const r of reviews ?? []) {
    const p = r.places as unknown as { id: string; name: string; city: string | null; country: string | null; place_type: string | null; price_level: number | null } | null
    if (!p) continue
    if (placeMap.has(p.id)) {
      const existing = placeMap.get(p.id)!
      existing.reviewCount++
      if ((r.rating_overall ?? 0) > (existing.rating ?? 0)) {
        existing.rating = r.rating_overall
        existing.reviewSlug = r.slug
      }
    } else {
      placeMap.set(p.id, { ...p, reviewSlug: r.slug, rating: r.rating_overall, reviewCount: 1 })
    }
  }

  const places = Array.from(placeMap.values())
  const PRICE = ['', '$', '$$', '$$$', '$$$$']

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground">My Locations</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {places.length} {places.length === 1 ? 'place' : 'places'} you&apos;ve been
            </p>
          </div>
          <Link
            href="/write"
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            + Add a place
          </Link>
        </div>

        {places.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {places.map(place => (
              <Link
                key={place.id}
                href={`/r/${place.reviewSlug}`}
                className="rounded-2xl border border-border bg-card p-5 hover:shadow-md hover:border-primary/20 transition-all space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-foreground leading-snug">{place.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {[place.city, place.country].filter(Boolean).join(', ')}
                    </p>
                  </div>
                  {place.rating !== null && (
                    <span className="shrink-0 rounded-lg bg-primary/10 px-2 py-1 text-sm font-black text-primary">
                      {place.rating.toFixed(1)}★
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {place.place_type && (
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground capitalize">
                      {place.place_type}
                    </span>
                  )}
                  {place.price_level && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      {PRICE[place.price_level]}
                    </span>
                  )}
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    {place.reviewCount} {place.reviewCount === 1 ? 'visit' : 'visits'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card p-16 text-center space-y-4">
            <p className="text-4xl">📍</p>
            <p className="text-xl font-extrabold text-foreground">No locations yet</p>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Every venue you review gets saved here. Build your personal map of favourite date spots.
            </p>
            <Link
              href="/write"
              className="inline-flex rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Review a place
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
