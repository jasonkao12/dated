'use client'

import { useActionState } from 'react'
import { updateReview, type ReviewState } from '@/app/actions/review'
import { RatingInput } from '@/components/rating-input'

const DATE_TAGS = [
  { label: 'First Date',       emoji: '✨' },
  { label: 'Anniversary',      emoji: '💍' },
  { label: 'Casual',           emoji: '☕' },
  { label: 'Special Occasion', emoji: '🎉' },
  { label: 'Group',            emoji: '👥' },
  { label: 'Proposal',         emoji: '💎' },
  { label: 'Spontaneous',      emoji: '⚡' },
  { label: 'Celebration',      emoji: '🥂' },
]

const VENUE_TYPES = ['Restaurant', 'Bar', 'Café', 'Activity', 'Experience', 'Day Trip', 'Other']

type DefaultValues = {
  title: string; body: string; visited_on: string; is_public: boolean
  venue_name: string; venue_city: string; venue_type: string
  rating_overall: number | null; rating_ambiance: number | null
  rating_food: number | null; rating_service: number | null
  rating_value: number | null; rating_vibe: number | null
  tags: string[]
}

const inputClass = 'w-full rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'

export function EditReviewForm({ reviewId, defaultValues: d }: { reviewId: string; defaultValues: DefaultValues }) {
  const [state, formAction, isPending] = useActionState(updateReview, {} as ReviewState)

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="review_id" value={reviewId} />
      <input type="hidden" name="is_public" value={String(d.is_public)} />

      {/* Venue */}
      <section className="rounded-2xl bg-card border border-border p-6 space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Where did you go?</h2>
        <div className="space-y-1">
          <label htmlFor="venue_name" className="block text-sm font-semibold text-foreground">Venue name <span className="text-destructive">*</span></label>
          <input id="venue_name" name="venue_name" type="text" required defaultValue={d.venue_name} className={inputClass} />
          {state.fieldErrors?.venue_name && <p className="text-xs text-destructive">{state.fieldErrors.venue_name}</p>}
        </div>
        <div className="space-y-1">
          <label htmlFor="venue_city" className="block text-sm font-semibold text-foreground">City</label>
          <input id="venue_city" name="venue_city" type="text" defaultValue={d.venue_city} className={inputClass} />
        </div>
        <div className="space-y-1">
          <label htmlFor="venue_type" className="block text-sm font-semibold text-foreground">Venue type</label>
          <select id="venue_type" name="venue_type" defaultValue={d.venue_type} className={inputClass}>
            <option value="">Select a type…</option>
            {VENUE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </section>

      {/* Details */}
      <section className="rounded-2xl bg-card border border-border p-6 space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Tell us about it</h2>
        <div className="space-y-1">
          <label htmlFor="title" className="block text-sm font-semibold text-foreground">Review title <span className="text-destructive">*</span></label>
          <input id="title" name="title" type="text" required defaultValue={d.title} className={inputClass} />
          {state.fieldErrors?.title && <p className="text-xs text-destructive">{state.fieldErrors.title}</p>}
        </div>
        <div className="space-y-1">
          <label htmlFor="visited_on" className="block text-sm font-semibold text-foreground">Visited on</label>
          <input id="visited_on" name="visited_on" type="date" defaultValue={d.visited_on} className={inputClass} />
        </div>
        <div className="space-y-1">
          <label htmlFor="body" className="block text-sm font-semibold text-foreground">Your review</label>
          <textarea id="body" name="body" rows={5} defaultValue={d.body} className={`${inputClass} resize-y`} />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">Tags</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {DATE_TAGS.map(({ label, emoji }) => (
              <label key={label} className="flex cursor-pointer items-center gap-2 rounded-xl border border-input bg-background px-3 py-2 text-sm font-medium hover:border-primary/50 has-[:checked]:border-primary has-[:checked]:bg-secondary/30 transition-colors">
                <input type="checkbox" name="tags" value={label} defaultChecked={d.tags.includes(label)} className="accent-primary" />
                <span>{emoji} {label}</span>
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* Ratings */}
      <section className="rounded-2xl bg-card border border-border p-6 space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Rate the experience</h2>
        <RatingInput name="rating_overall"  label="Overall"    required defaultValue={d.rating_overall ?? undefined} />
        <RatingInput name="rating_ambiance" label="Ambiance"           defaultValue={d.rating_ambiance ?? undefined} />
        <RatingInput name="rating_food"     label="Food"               defaultValue={d.rating_food ?? undefined} />
        <RatingInput name="rating_service"  label="Service"            defaultValue={d.rating_service ?? undefined} />
        <RatingInput name="rating_value"    label="Value"              defaultValue={d.rating_value ?? undefined} />
        <RatingInput name="rating_vibe"     label="Date Vibe"          defaultValue={d.rating_vibe ?? undefined} />
      </section>

      {state.error && (
        <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{state.error}</p>
      )}

      <button type="submit" disabled={isPending}
        className="w-full rounded-2xl bg-primary py-3 text-base font-bold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60">
        {isPending ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  )
}
