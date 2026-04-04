import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/site-header'
import { StarRating } from '@/components/star-rating'
import { ReactionBar } from '@/components/reaction-bar'
import { ShareButton } from '@/components/share-button'
import { ReviewOwnerActions } from '@/components/review-owner-actions'
import { CommentsSection } from '@/components/comments-section'
import { AddToCollection } from '@/components/add-to-collection'
import type { Review, ReactionCounts } from '@/lib/types'

type Props = { params: Promise<{ slug: string }> }

async function getReview(slug: string): Promise<Review | null> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('reviews')
    .select(`
      id, slug, title, body, visited_on,
      rating_overall, rating_ambiance, rating_food, rating_service, rating_value, rating_vibe,
      is_public, view_count, created_at,
      profiles ( id, username, display_name, avatar_url, bio ),
      places ( id, name, address, city, country, place_type, price_level, website ),
      review_photos ( id, storage_path, alt_text, sort_order ),
      review_tags ( date_tags ( id, label, emoji ) )
    `)
    .eq('slug', slug)
    .eq('is_public', true)
    .single()

  if (!data) return null

  // Fetch reaction counts
  const { data: reactions } = await supabase
    .from('reactions')
    .select('reaction_type')
    .eq('review_id', data.id)

  const reaction_counts: ReactionCounts = {
    heart: 0, fire: 0, want_to_go: 0, been_here: 0,
  }
  reactions?.forEach(r => {
    const t = r.reaction_type as keyof ReactionCounts
    if (t in reaction_counts) reaction_counts[t]++
  })

  return { ...data, reaction_counts } as unknown as Review
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const review = await getReview(slug)
  if (!review) return { title: 'Review not found | Dated' }

  const venueName = review.places?.name ?? 'a great spot'
  const description = review.body
    ? review.body.slice(0, 150) + (review.body.length > 150 ? '…' : '')
    : `${review.profiles.display_name ?? review.profiles.username} reviewed ${venueName}`

  return {
    title: `${review.title} — ${venueName} | Dated`,
    description,
    openGraph: {
      title: `${review.title} | Dated`,
      description,
      url: `https://getdated.app/r/${slug}`,
      siteName: 'Dated',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${review.title} | Dated`,
      description,
    },
  }
}

const RATING_LABELS: { key: keyof Review; label: string }[] = [
  { key: 'rating_ambiance', label: 'Ambiance'  },
  { key: 'rating_food',     label: 'Food'      },
  { key: 'rating_service',  label: 'Service'   },
  { key: 'rating_value',    label: 'Value'     },
  { key: 'rating_vibe',     label: 'Date Vibe' },
]

const PRICE = ['', '$', '$$', '$$$', '$$$$']

export default async function ReviewPage({ params }: Props) {
  const { slug } = await params
  const review = await getReview(slug)
  if (!review) notFound()

  const { profiles: reviewer, places: venue } = review
  const tags = review.review_tags?.map(rt => rt.date_tags).filter(Boolean) ?? []
  const photos = [...(review.review_photos ?? [])].sort((a, b) => a.sort_order - b.sort_order)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const reviewUrl = `https://getdated.app/r/${slug}`
  const visitedDate = review.visited_on
    ? new Date(review.visited_on).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-3xl px-4 py-8 space-y-6">

        {/* Venue + title */}
        <div className="space-y-2">
          {venue && (
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{venue.name}</span>
              {venue.city && <span>· {venue.city}</span>}
              {venue.price_level && <span>· {PRICE[venue.price_level]}</span>}
              {venue.place_type && (
                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground capitalize">
                  {venue.place_type}
                </span>
              )}
            </div>
          )}
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            {review.title}
          </h1>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tags.map(tag => (
                <span
                  key={tag.id}
                  className="rounded-full bg-secondary px-3 py-0.5 text-xs font-semibold text-secondary-foreground"
                >
                  {tag.emoji} {tag.label}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Reviewer + date */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {reviewer.avatar_url ? (
              <Image
                src={reviewer.avatar_url}
                alt={reviewer.display_name ?? reviewer.username}
                width={36}
                height={36}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {(reviewer.display_name ?? reviewer.username).charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-foreground">
                {reviewer.display_name ?? reviewer.username}
              </p>
              {visitedDate && (
                <p className="text-xs text-muted-foreground">Visited {visitedDate}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AddToCollection reviewId={review.id} isAuthenticated={!!user} />
            <ShareButton url={reviewUrl} title={review.title} />
            {user?.id === review.profiles.id && (
              <ReviewOwnerActions reviewId={review.id} slug={review.slug} />
            )}
          </div>
        </div>

        {/* Overall rating */}
        {review.rating_overall !== null && (
          <div className="rounded-2xl bg-card border border-border p-5 flex items-center gap-4">
            <div className="text-5xl font-black text-primary tabular-nums leading-none">
              {review.rating_overall.toFixed(1)}
            </div>
            <div className="space-y-1.5">
              <StarRating value={review.rating_overall} size="lg" />
              <p className="text-xs text-muted-foreground">Overall rating</p>
            </div>
          </div>
        )}

        {/* Photos */}
        {photos.length > 0 && (
          <div className={`grid gap-2 ${photos.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {photos.map((photo, i) => (
              <div
                key={photo.id}
                className={`relative overflow-hidden rounded-2xl bg-muted ${
                  photos.length === 1 ? 'aspect-video' : i === 0 && photos.length >= 3 ? 'col-span-2 aspect-video' : 'aspect-square'
                }`}
              >
                <Image
                  src={photo.storage_path}
                  alt={photo.alt_text ?? `Photo ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 768px"
                />
              </div>
            ))}
          </div>
        )}

        {/* Review body */}
        {review.body && (
          <div className="rounded-2xl bg-card border border-border p-5">
            <p className="whitespace-pre-wrap leading-relaxed text-foreground">{review.body}</p>
          </div>
        )}

        {/* Sub-ratings */}
        {RATING_LABELS.some(({ key }) => review[key] !== null) && (
          <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              Breakdown
            </h2>
            <div className="space-y-2.5">
              {RATING_LABELS.map(({ key, label }) => {
                const val = review[key] as number | null
                if (val === null) return null
                return (
                  <div key={key} className="flex items-center justify-between gap-4">
                    <span className="w-24 shrink-0 text-sm text-muted-foreground">{label}</span>
                    <div className="flex flex-1 items-center gap-3">
                      <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="absolute inset-y-0 left-0 rounded-full bg-primary"
                          style={{ width: `${(val / 5) * 100}%` }}
                        />
                      </div>
                      <span className="w-6 text-right text-sm font-semibold tabular-nums text-foreground">
                        {val.toFixed(0)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Reactions */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            React
          </p>
          <ReactionBar
            reviewId={review.id}
            counts={review.reaction_counts}
            isAuthenticated={!!user}
          />
        </div>

        {/* Comments */}
        <div className="rounded-2xl bg-card border border-border p-5">
          <CommentsSection reviewId={review.id} isAuthenticated={!!user} />
        </div>

        {/* Sign-up CTA for unauthenticated users */}
        {!user && (
          <div className="rounded-2xl border border-secondary bg-secondary/40 p-6 text-center space-y-3">
            <p className="font-bold text-lg text-foreground">Share your own date stories</p>
            <p className="text-sm text-muted-foreground">
              Create an account to post reviews, rate venues, and save your favourites.
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
