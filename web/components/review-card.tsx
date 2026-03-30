import Link from 'next/link'
import { StarRating } from '@/components/star-rating'

export type ReviewCardData = {
  id: string
  slug: string
  title: string
  body: string | null
  rating_overall: number | null
  visited_on: string | null
  places: {
    name: string
    city: string | null
  } | null
  review_tags: { date_tags: { label: string; emoji: string | null } }[]
  profiles: {
    display_name: string | null
    username: string
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function avatarInitial(displayName: string | null, username: string): string {
  const name = displayName || username
  return name.charAt(0).toUpperCase()
}

export function ReviewCard({ review }: { review: ReviewCardData }) {
  return (
    <Link
      href={`/r/${review.slug}`}
      className="group block rounded-2xl bg-card border border-border p-5 hover:shadow-md transition-shadow"
    >
      {/* Venue */}
      {review.places && (
        <p className="text-xs text-muted-foreground font-medium mb-1">
          {review.places.name}
          {review.places.city ? ` · ${review.places.city}` : ''}
        </p>
      )}

      {/* Title */}
      <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors leading-snug mb-2">
        {review.title}
      </h3>

      {/* Stars */}
      {review.rating_overall !== null && (
        <div className="mb-3">
          <StarRating value={review.rating_overall} size="sm" showNumber />
        </div>
      )}

      {/* Tags */}
      {review.review_tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {review.review_tags.map(({ date_tags }) => (
            <span
              key={date_tags.label}
              className="inline-flex items-center gap-0.5 rounded-full bg-secondary/40 px-2 py-0.5 text-xs font-medium text-secondary-foreground"
            >
              {date_tags.emoji && <span>{date_tags.emoji}</span>}
              {date_tags.label}
            </span>
          ))}
        </div>
      )}

      {/* Body excerpt */}
      {review.body && (
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{review.body}</p>
      )}

      {/* Reviewer + date */}
      <div className="flex items-center gap-2 pt-3 border-t border-border">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
          {avatarInitial(review.profiles.display_name, review.profiles.username)}
        </div>
        <span className="text-xs font-medium text-foreground">
          {review.profiles.display_name || review.profiles.username}
        </span>
        {review.visited_on && (
          <>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">{formatDate(review.visited_on)}</span>
          </>
        )}
      </div>
    </Link>
  )
}
