import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/site-header'
import { ReviewCard, type ReviewCardData } from '@/components/review-card'
import { StarRating } from '@/components/star-rating'
import { DateHeatmap } from '@/components/date-heatmap'
import { AchievementBadges } from '@/components/achievement-badges'
import { FollowButton } from '@/components/follow-button'
import { DraftsSection, type DraftReview, type DraftPlan } from '@/components/drafts-section'
import { Settings } from 'lucide-react'

type Props = { params: Promise<{ username: string }> }

export default async function UserProfilePage({ params }: Props) {
  const { username } = await params
  const supabase = await createClient()

  // 1. Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, bio')
    .eq('username', username)
    .maybeSingle()

  if (!profile) notFound()

  const { data: { user } } = await supabase.auth.getUser()
  const isOwnProfile = user?.id === profile.id

  // 2. Fetch reviews with related data
  const { data: rawReviews } = await supabase
    .from('reviews')
    .select(`
      id,
      slug,
      title,
      body,
      visited_on,
      rating_overall,
      rating_ambiance,
      rating_food,
      rating_service,
      rating_value,
      rating_vibe,
      is_public,
      created_at,
      places ( id, name, city, place_type ),
      review_photos ( id, storage_path, alt_text, sort_order ),
      review_tags ( date_tags ( id, label, emoji ) ),
      profiles!inner ( id, username, display_name, avatar_url )
    `)
    .eq('user_id', profile.id)
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  const reviews = (rawReviews ?? []) as unknown as ReviewCardData[]

  // 3. Fetch date plans + drafts (only for own profile)
  let datePlans: { id: string; title: string; slug: string; status: string; visited_on: string | null; date_stops: { count: number }[] }[] = []
  let draftReviews: DraftReview[] = []
  let draftPlans: DraftPlan[] = []

  if (isOwnProfile) {
    const [plansRes, draftReviewsRes, draftPlansRes] = await Promise.all([
      supabase
        .from('date_plans')
        .select('id, title, slug, status, visited_on, date_stops(count)')
        .eq('user_id', profile.id)
        .eq('is_draft', false)
        .order('created_at', { ascending: false })
        .limit(20),
      supabase
        .from('reviews')
        .select('id, slug, title, rating_overall, created_at')
        .eq('user_id', profile.id)
        .eq('is_draft', true)
        .order('created_at', { ascending: false }),
      supabase
        .from('date_plans')
        .select('id, slug, title, status, created_at, date_stops(count)')
        .eq('user_id', profile.id)
        .eq('is_draft', true)
        .order('created_at', { ascending: false }),
    ])

    datePlans    = (plansRes.data ?? []) as typeof datePlans
    draftReviews = (draftReviewsRes.data ?? []) as DraftReview[]
    draftPlans   = (draftPlansRes.data ?? []) as DraftPlan[]
  }

  // 3. Aggregate stats
  const reviewCount = reviews.length
  const ratingsWithValue = reviews.filter((r) => r.rating_overall !== null)
  const avgRating =
    ratingsWithValue.length > 0
      ? ratingsWithValue.reduce((sum, r) => sum + (r.rating_overall ?? 0), 0) / ratingsWithValue.length
      : null

  // Most reviewed venue type
  const typeCounts: Record<string, number> = {}
  for (const r of reviews) {
    const pt = (r.places as { place_type?: string | null } | null)?.place_type
    if (pt) typeCounts[pt] = (typeCounts[pt] ?? 0) + 1
  }
  const mostReviewedType =
    Object.keys(typeCounts).length > 0
      ? Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0][0]
      : null

  // Top 5 places by rating_overall
  type PlaceEntry = { id: string; name: string; city: string | null; rating: number; slug: string }
  const placeMap = new Map<string, PlaceEntry>()
  for (const r of reviews) {
    const place = r.places as { id?: string; name?: string; city?: string | null } | null
    if (place?.id && r.rating_overall !== null) {
      if (!placeMap.has(place.id) || (placeMap.get(place.id)!.rating < r.rating_overall)) {
        placeMap.set(place.id, {
          id: place.id,
          name: place.name ?? '',
          city: place.city ?? null,
          rating: r.rating_overall,
          slug: r.slug,
        })
      }
    }
  }
  const topPlaces = Array.from(placeMap.values())
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5)

  // Top 3 reviews by reaction count (using available data — sum all numeric reaction fields)
  // Reviews from supabase won't have reaction_counts here; use a simplified approach
  const top3Reviews = reviews.slice(0, 3)

  // Heatmap data — all visited_on dates (including ones without values for calendar display)
  const visitedDates = reviews
    .map(r => r.visited_on)
    .filter((d): d is string => d !== null)

  const avatarInitial = (profile.display_name || profile.username).charAt(0).toUpperCase()

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-background py-10 px-4">
        <div className="mx-auto max-w-4xl space-y-8">

          {/* Profile header */}
          <div className="rounded-2xl bg-card border border-border p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                {avatarInitial}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-foreground">
                    {profile.display_name || profile.username}
                  </h1>
                  {isOwnProfile ? (
                    <Link
                      href="/settings"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      aria-label="Settings"
                    >
                      <Settings size={16} />
                    </Link>
                  ) : (
                    <FollowButton profileId={profile.id} />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">@{profile.username}</p>
                {profile.bio && (
                  <p className="mt-2 text-sm text-foreground/80">{profile.bio}</p>
                )}
                <p className="mt-2 text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{reviewCount}</span> reviews
                  {avgRating !== null && (
                    <>
                      {' · '}
                      <span className="font-semibold text-foreground">{avgRating.toFixed(1)}</span> avg rating ★
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Badges</h2>
              <Link href="/settings/couple" className="text-xs text-primary hover:underline">Couple settings →</Link>
            </div>
            <AchievementBadges reviews={reviews as any} />
          </div>

          {/* Stats highlight cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-2xl bg-card border border-border p-5 text-center">
              <p className="text-3xl font-extrabold text-primary">{reviewCount}</p>
              <p className="mt-1 text-xs text-muted-foreground font-medium uppercase tracking-widest">Reviews</p>
            </div>
            <div className="rounded-2xl bg-card border border-border p-5 text-center">
              <p className="text-3xl font-extrabold text-primary">
                {avgRating !== null ? avgRating.toFixed(1) : '—'}
              </p>
              <p className="mt-1 text-xs text-muted-foreground font-medium uppercase tracking-widest">Avg Rating</p>
            </div>
            <div className="rounded-2xl bg-card border border-border p-5 text-center">
              <p className="text-xl font-extrabold text-primary truncate">{mostReviewedType ?? '—'}</p>
              <p className="mt-1 text-xs text-muted-foreground font-medium uppercase tracking-widest">Top Venue Type</p>
            </div>
          </div>

          {/* Date Heatmap */}
          {visitedDates.length > 0 && (
            <div className="rounded-2xl bg-card border border-border p-5">
              <DateHeatmap visitedDates={visitedDates} />
            </div>
          )}

          {/* Drafts — owner only */}
          {isOwnProfile && (
            <DraftsSection reviews={draftReviews} plans={draftPlans} />
          )}

          {/* My Date Plans — owner only */}
          {isOwnProfile && datePlans.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">My Date Plans</h2>
                <Link href="/date-builder" className="text-xs text-primary hover:underline">See all →</Link>
              </div>
              <div className="space-y-2">
                {datePlans.map(plan => {
                  const stopCount = plan.date_stops?.[0]?.count ?? 0
                  const isCompleted = plan.status === 'completed'
                  const statusEmoji = plan.status === 'planned' ? '📅' : plan.status === 'completed' ? '✅' : '💡'
                  const visitedDate = plan.visited_on
                    ? new Date(plan.visited_on).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : null
                  return (
                    <div key={plan.id} className={`flex items-center justify-between gap-3 rounded-2xl border bg-card px-4 py-3 ${isCompleted ? 'border-primary/30' : 'border-border'}`}>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm shrink-0">{statusEmoji}</span>
                        <div className="min-w-0">
                          <Link href={`/plan/${plan.slug}`} className="text-sm font-semibold text-foreground hover:text-primary transition-colors truncate block">
                            {plan.title}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {stopCount} {stopCount === 1 ? 'stop' : 'stops'}{visitedDate ? ` · ${visitedDate}` : ''}
                          </p>
                        </div>
                      </div>
                      {isCompleted && (
                        <Link
                          href="/write"
                          className="shrink-0 flex items-center gap-1 rounded-lg bg-primary/10 border border-primary/30 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors whitespace-nowrap"
                        >
                          ✍️ Write review
                        </Link>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {isOwnProfile && datePlans.length === 0 && (
            <section className="rounded-2xl border border-dashed border-border bg-card p-6 text-center space-y-3">
              <p className="text-2xl">🗺️</p>
              <p className="text-sm font-semibold text-foreground">No date plans yet</p>
              <Link href="/date-builder/new" className="inline-block rounded-xl bg-primary px-5 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors">
                Plan a date
              </Link>
            </section>
          )}

          {reviews.length === 0 ? (
            <div className="rounded-2xl bg-card border border-border p-10 text-center space-y-3">
              <p className="text-lg font-semibold text-foreground">No reviews yet</p>
              <p className="text-sm text-muted-foreground">
                Be the first to share a date story.
              </p>
              <Link
                href="/write"
                className="inline-block rounded-2xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Write a Review
              </Link>
            </div>
          ) : (
            <>
              {/* Reviews gallery */}
              <section className="space-y-4">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  All Reviews
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {reviews.map((review) => (
                    <ReviewCard key={review.slug} review={review} />
                  ))}
                </div>
              </section>

              {/* Highest Rated Places */}
              {topPlaces.length > 0 && (
                <section className="rounded-2xl bg-card border border-border p-6 space-y-4">
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Highest Rated Places
                  </h2>
                  <ul className="space-y-3">
                    {topPlaces.map((place) => (
                      <li key={place.id} className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            href={`/r/${place.slug}`}
                            className="font-semibold text-foreground hover:text-primary transition-colors"
                          >
                            {place.name}
                          </Link>
                          {place.city && (
                            <span className="ml-2 text-xs text-muted-foreground">{place.city}</span>
                          )}
                        </div>
                        <StarRating value={place.rating} size="sm" showNumber />
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Most Popular Dates */}
              {top3Reviews.length > 0 && (
                <section className="space-y-4">
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Most Popular Dates
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {top3Reviews.map((review) => {
                      const place = review.places as { name?: string; city?: string | null } | null
                      return (
                        <Link
                          key={review.slug}
                          href={`/r/${review.slug}`}
                          className="rounded-2xl bg-card border border-border p-4 hover:shadow-md transition-shadow block"
                        >
                          <p className="font-semibold text-foreground text-sm leading-snug line-clamp-2">
                            {review.title}
                          </p>
                          {place?.name && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {place.name}{place.city ? ` · ${place.city}` : ''}
                            </p>
                          )}
                          {review.rating_overall !== null && (
                            <div className="mt-2">
                              <StarRating value={review.rating_overall} size="sm" />
                            </div>
                          )}
                        </Link>
                      )
                    })}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>
    </>
  )
}
