import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/site-header'
import { PlacesMap } from '@/components/places-map'

type PlaceWithStats = {
  id: string
  name: string
  city: string | null
  country: string | null
  place_type: string | null
  price_level: number | null
  latitude: number | null
  longitude: number | null
  reviewCount: number
  avgRating: number | null
  topSlug: string | null
}

const PRICE = ['', '$', '$$', '$$$', '$$$$']

export default async function PlacesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch places that have at least one public review
  const { data: raw } = await supabase
    .from('places')
    .select(`
      id, name, city, country, place_type, price_level, latitude, longitude,
      reviews!inner ( slug, rating_overall, is_public )
    `)
    .eq('reviews.is_public', true)
    .order('name')

  const places: PlaceWithStats[] = (raw ?? []).map((p: any) => {
    const reviews = (p.reviews ?? []) as { slug: string; rating_overall: number | null }[]
    const ratings = reviews.map(r => r.rating_overall).filter((v): v is number => v !== null)
    const topReview = reviews.find(r => r.rating_overall === Math.max(...ratings.length > 0 ? ratings : [0]))
    return {
      id: p.id,
      name: p.name,
      city: p.city,
      country: p.country,
      place_type: p.place_type,
      price_level: p.price_level,
      latitude: p.latitude ?? null,
      longitude: p.longitude ?? null,
      reviewCount: reviews.length,
      avgRating: ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null,
      topSlug: topReview?.slug ?? reviews[0]?.slug ?? null,
    }
  })

  // Sort by review count then rating
  places.sort((a, b) => b.reviewCount - a.reviewCount || (b.avgRating ?? 0) - (a.avgRating ?? 0))

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-8 space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground">Places</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {places.length} {places.length === 1 ? 'place' : 'places'} reviewed by the community
            </p>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <Link
                href="/my-locations"
                className="rounded-xl border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors"
              >
                My Places
              </Link>
            )}
            <Link
              href={user ? '/write' : '/signup'}
              className="rounded-xl bg-primary px-5 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              + Review a place
            </Link>
          </div>
        </div>

        {/* Map view — only rendered when places have coordinates */}
        {(() => {
          const mapped = places.filter(p => p.latitude !== null && p.longitude !== null).map(p => ({
            id: p.id,
            name: p.name,
            city: p.city,
            latitude: p.latitude!,
            longitude: p.longitude!,
            avgRating: p.avgRating,
            topSlug: p.topSlug,
          }))
          return mapped.length > 0 ? <PlacesMap places={mapped} /> : null
        })()}

        {places.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {places.map(place => (
              <Link
                key={place.id}
                href={place.topSlug ? `/r/${place.topSlug}` : '#'}
                className="rounded-2xl border border-border bg-card p-5 hover:shadow-md hover:border-primary/20 transition-all space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-foreground leading-snug truncate">{place.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {[place.city, place.country].filter(Boolean).join(', ')}
                    </p>
                  </div>
                  {place.avgRating !== null && (
                    <span className="shrink-0 rounded-lg bg-primary/10 px-2 py-1 text-sm font-black text-primary">
                      {place.avgRating.toFixed(1)}★
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
                    {place.reviewCount} {place.reviewCount === 1 ? 'date' : 'dates'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card p-16 text-center space-y-4">
            <p className="text-4xl">📍</p>
            <p className="text-xl font-extrabold text-foreground">No places yet</p>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Review a date spot to add it to the community map.
            </p>
            <Link
              href={user ? '/write' : '/signup'}
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
