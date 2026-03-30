'use client'

import { useEffect, useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SiteHeader } from '@/components/site-header'
import { RatingInput } from '@/components/rating-input'
import { createReview, type ReviewState } from '@/app/actions/review'

const DATE_TAGS = [
  { label: 'First Date', emoji: '✨' },
  { label: 'Anniversary', emoji: '💍' },
  { label: 'Casual', emoji: '☕' },
  { label: 'Special Occasion', emoji: '🎉' },
  { label: 'Group', emoji: '👥' },
  { label: 'Proposal', emoji: '💎' },
  { label: 'Spontaneous', emoji: '⚡' },
  { label: 'Celebration', emoji: '🥂' },
]

const VENUE_TYPES = ['Restaurant', 'Bar', 'Café', 'Activity', 'Experience', 'Day Trip', 'Other']

const initialState: ReviewState = {}

export default function WritePage() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(createReview, initialState)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.replace('/login')
    })
  }, [router])

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-background py-10 px-4">
        <div className="mx-auto max-w-2xl space-y-6">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground">Write a Review</h1>
            <p className="mt-1 text-muted-foreground">Share your date experience with the community.</p>
          </div>

          <form action={formAction} className="space-y-6">
            {/* Section 1 */}
            <section className="rounded-2xl bg-card border border-border p-6 space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Where did you go?
              </h2>

              <div className="space-y-1">
                <label htmlFor="venue_name" className="block text-sm font-semibold text-foreground">
                  Venue name <span className="text-destructive">*</span>
                </label>
                <input
                  id="venue_name"
                  name="venue_name"
                  type="text"
                  required
                  placeholder="e.g. The Keefer Bar"
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {state.fieldErrors?.venue_name && (
                  <p className="text-xs text-destructive">{state.fieldErrors.venue_name}</p>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="venue_city" className="block text-sm font-semibold text-foreground">
                  City
                </label>
                <input
                  id="venue_city"
                  name="venue_city"
                  type="text"
                  placeholder="e.g. Vancouver, BC"
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="venue_type" className="block text-sm font-semibold text-foreground">
                  Venue type
                </label>
                <select
                  id="venue_type"
                  name="venue_type"
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select a type…</option>
                  {VENUE_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </section>

            {/* Section 2 */}
            <section className="rounded-2xl bg-card border border-border p-6 space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Tell us about it
              </h2>

              <div className="space-y-1">
                <label htmlFor="title" className="block text-sm font-semibold text-foreground">
                  Review title <span className="text-destructive">*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  placeholder="The most magical evening in Gastown..."
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {state.fieldErrors?.title && (
                  <p className="text-xs text-destructive">{state.fieldErrors.title}</p>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="visited_on" className="block text-sm font-semibold text-foreground">
                  Visited on
                </label>
                <input
                  id="visited_on"
                  name="visited_on"
                  type="date"
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="body" className="block text-sm font-semibold text-foreground">
                  Your review
                </label>
                <textarea
                  id="body"
                  name="body"
                  rows={5}
                  placeholder="Share the details — what made it special, what to order, tips for the next couple..."
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Tags</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {DATE_TAGS.map(({ label, emoji }) => (
                    <label
                      key={label}
                      className="flex cursor-pointer items-center gap-2 rounded-xl border border-input bg-background px-3 py-2 text-sm font-medium hover:border-primary/50 hover:bg-secondary/20 has-[:checked]:border-primary has-[:checked]:bg-secondary/30 transition-colors"
                    >
                      <input type="checkbox" name="tags" value={label} className="accent-primary" />
                      <span>{emoji} {label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section className="rounded-2xl bg-card border border-border p-6 space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Rate the experience
              </h2>

              <RatingInput name="rating_overall" label="Overall" required />
              <RatingInput name="rating_ambiance" label="Ambiance" />
              <RatingInput name="rating_food" label="Food" />
              <RatingInput name="rating_service" label="Service" />
              <RatingInput name="rating_value" label="Value" />
              <RatingInput name="rating_vibe" label="Date Vibe" />
            </section>

            {state.error && (
              <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-2xl bg-primary py-3 text-base font-bold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {isPending ? 'Posting…' : 'Post Review'}
            </button>
          </form>
        </div>
      </main>
    </>
  )
}
