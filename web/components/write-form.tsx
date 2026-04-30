'use client'

import { useActionState, useState, useRef } from 'react'
import { RatingInput } from '@/components/rating-input'
import { PlacesAutocomplete } from '@/components/places-autocomplete'
import { createReview, type ReviewState } from '@/app/actions/review'

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

const CATEGORIES = [
  { name: 'Restaurants',           emoji: '🍽️' },
  { name: 'Cafes',                 emoji: '☕' },
  { name: 'Nature & Outdoors',     emoji: '🌿' },
  { name: 'Indoor Activities',     emoji: '🏛️' },
  { name: 'Arts & Culture',        emoji: '🎨' },
  { name: 'Games & Entertainment', emoji: '🎮' },
  { name: 'Nightlife',             emoji: '🌙' },
  { name: 'Wellness',              emoji: '🧘' },
  { name: 'Day Trip',              emoji: '🌅' },
  { name: 'Road Trip',             emoji: '🚗' },
  { name: 'Vacation',              emoji: '✈️' },
  { name: 'First Date',            emoji: '✨' },
  { name: 'Anniversary',           emoji: '💍' },
  { name: 'Romantic',              emoji: '🕯️' },
  { name: 'Budget-friendly',       emoji: '💸' },
  { name: 'Experiences',           emoji: '🌟' },
]

const inputClass = 'w-full rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'

export function WriteForm() {
  const [state, formAction, isPending] = useActionState(createReview, {} as ReviewState)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [suggesting, setSuggesting] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const isDraftRef = useRef<HTMLInputElement>(null)

  function handleSaveAsDraft() {
    if (isDraftRef.current) isDraftRef.current.value = 'true'
    formRef.current?.requestSubmit()
  }

  function toggleCategory(name: string) {
    setSelectedCategories(prev =>
      prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]
    )
  }

  async function suggestCategories(e: React.MouseEvent) {
    e.preventDefault()
    const form = (e.currentTarget as HTMLElement).closest('form') as HTMLFormElement
    const data = new FormData(form)
    const title = data.get('title') as string
    const body = data.get('body') as string
    const venue_name = data.get('venue_name') as string
    const venue_type = data.get('venue_type') as string

    setSuggesting(true)
    try {
      const res = await fetch('/api/ai/suggest-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, venue_name, venue_type }),
      })
      const json = await res.json()
      if (json.categories?.length) {
        setSelectedCategories(json.categories)
      }
    } finally {
      setSuggesting(false)
    }
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      <input ref={isDraftRef} type="hidden" name="is_draft" value="false" />
      {/* Section 1 — Where */}
      <section className="rounded-2xl bg-card border border-border p-6 space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Where did you go?
        </h2>
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-foreground">
            Venue <span className="text-destructive">*</span>
          </label>
          <PlacesAutocomplete error={state.fieldErrors?.venue_name} />
        </div>
        <div className="space-y-1">
          <label htmlFor="venue_type" className="block text-sm font-semibold text-foreground">Venue type</label>
          <select id="venue_type" name="venue_type" className={inputClass}>
            <option value="">Select a type…</option>
            {VENUE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </section>

      {/* Section 2 — Details */}
      <section className="rounded-2xl bg-card border border-border p-6 space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Tell us about it
        </h2>
        <div className="space-y-1">
          <label htmlFor="title" className="block text-sm font-semibold text-foreground">
            Review title <span className="text-destructive">*</span>
          </label>
          <input id="title" name="title" type="text" required placeholder="The most magical evening in Gastown..." className={inputClass} />
          {state.fieldErrors?.title && <p className="text-xs text-destructive">{state.fieldErrors.title}</p>}
        </div>
        <div className="space-y-1">
          <label htmlFor="visited_on" className="block text-sm font-semibold text-foreground">Visited on</label>
          <input id="visited_on" name="visited_on" type="date" className={inputClass} />
        </div>
        <div className="space-y-1">
          <label htmlFor="body" className="block text-sm font-semibold text-foreground">Your review</label>
          <textarea id="body" name="body" rows={5} placeholder="Share the details — what made it special, what to order, tips for the next couple..." className={`${inputClass} resize-y`} />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">Tags</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {DATE_TAGS.map(({ label, emoji }) => (
              <label key={label} className="flex cursor-pointer items-center gap-2 rounded-xl border border-input bg-background px-3 py-2 text-sm font-medium hover:border-primary/50 has-[:checked]:border-primary has-[:checked]:bg-secondary/30 transition-colors">
                <input type="checkbox" name="tags" value={label} className="accent-primary" />
                <span>{emoji} {label}</span>
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3 — Categories */}
      <section className="rounded-2xl bg-card border border-border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Categories
          </h2>
          <button
            onClick={suggestCategories}
            disabled={suggesting}
            className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors disabled:opacity-60"
          >
            {suggesting ? '...' : '✨ AI Suggest'}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">Pick categories that describe this date. Or use AI Suggest after filling in the details above.</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(({ name, emoji }) => {
            const selected = selectedCategories.includes(name)
            return (
              <button
                key={name}
                type="button"
                onClick={() => toggleCategory(name)}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors ${
                  selected
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-input bg-background text-foreground hover:border-primary/50'
                }`}
              >
                <span>{emoji}</span>
                <span>{name}</span>
              </button>
            )
          })}
        </div>
        {/* Pass selected categories as hidden inputs */}
        {selectedCategories.map(name => (
          <input key={name} type="hidden" name="categories" value={name} />
        ))}
      </section>

      {/* Section 4 — Ratings */}
      <section className="rounded-2xl bg-card border border-border p-6 space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Rate the experience
        </h2>
        <RatingInput name="rating_overall"  label="Overall"    required />
        <RatingInput name="rating_ambiance" label="Ambiance" />
        <RatingInput name="rating_food"     label="Food" />
        <RatingInput name="rating_service"  label="Service" />
        <RatingInput name="rating_value"    label="Value" />
        <RatingInput name="rating_vibe"     label="Date Vibe" />
      </section>

      {state.error && (
        <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{state.error}</p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleSaveAsDraft}
          disabled={isPending}
          className="flex-1 rounded-2xl border border-border py-3 text-base font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-60"
        >
          {isPending ? 'Saving…' : 'Save as draft'}
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex-[2] rounded-2xl bg-primary py-3 text-base font-bold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
        >
          {isPending ? 'Posting…' : 'Post Review'}
        </button>
      </div>
    </form>
  )
}
