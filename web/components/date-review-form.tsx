'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { createDateReview } from '@/app/actions/review'
import type { PlanOption } from '@/components/write-tabs'

// ── Inline star picker (controlled, no hidden inputs) ─────────────────────────
function StarPicker({
  value,
  onChange,
  label,
  required,
}: {
  value: number | null
  onChange: (v: number | null) => void
  label: string
  required?: boolean
}) {
  const [hovered, setHovered] = useState<number | null>(null)
  const display = hovered ?? value
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-foreground">
        {label}
        {!required && <span className="ml-1 text-xs font-normal text-muted-foreground">(optional)</span>}
      </label>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onChange(star === value ? null : star)}
            className={`text-2xl leading-none transition-colors focus:outline-none ${
              display !== null && star <= display
                ? 'text-primary'
                : 'text-muted-foreground/30 hover:text-primary/60'
            }`}
          >
            ★
          </button>
        ))}
        {value !== null && (
          <span className="ml-2 text-sm text-muted-foreground tabular-nums">{value}/5</span>
        )}
      </div>
    </div>
  )
}

// ── Constants ─────────────────────────────────────────────────────────────────
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

const inputClass =
  'w-full rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'

// ── Venue review state per stop ───────────────────────────────────────────────
type VenueState = {
  place_id: string
  place_name: string
  rating: number | null
  body: string
}

// ── Main component ────────────────────────────────────────────────────────────
export function DateReviewForm({
  plan,
  onChangePlan,
}: {
  plan: PlanOption
  onChangePlan: () => void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Core fields
  const [title, setTitle]         = useState(plan.title)
  const [visitedOn, setVisitedOn] = useState(plan.visited_on ?? '')
  const [body, setBody]           = useState('')
  const [ratingOverall, setRatingOverall] = useState<number | null>(null)
  const [ratingVibe, setRatingVibe]       = useState<number | null>(null)
  const [tags, setTags]                   = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [isPublic, setIsPublic]           = useState(true)
  const [error, setError]                 = useState('')

  // Venue reviews
  const venueStops = [...(plan.date_stops ?? [])]
    .sort((a, b) => a.stop_order - b.stop_order)
    .filter(s => s.places?.id)

  const [venueOpen, setVenueOpen] = useState(false)
  const [venueStates, setVenueStates] = useState<VenueState[]>(
    venueStops.map(s => ({
      place_id: s.places!.id,
      place_name: s.places!.name,
      rating: null,
      body: '',
    }))
  )

  // AI suggest categories
  const [suggesting, setSuggesting] = useState(false)
  async function suggestCategories() {
    setSuggesting(true)
    try {
      const res = await fetch('/api/ai/suggest-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, venue_name: plan.title, venue_type: 'date' }),
      })
      const json = await res.json()
      if (json.categories?.length) setSelectedCategories(json.categories)
    } finally {
      setSuggesting(false)
    }
  }

  function toggleTag(label: string) {
    setTags(prev => prev.includes(label) ? prev.filter(t => t !== label) : [...prev, label])
  }
  function toggleCategory(name: string) {
    setSelectedCategories(prev => prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name])
  }
  function updateVenue(idx: number, field: 'rating' | 'body', value: number | null | string) {
    setVenueStates(prev => prev.map((v, i) => i === idx ? { ...v, [field]: value } : v))
  }

  function handleSubmit(isDraft = false) {
    if (!title.trim()) { setError('Title is required'); return }
    if (!isDraft && !ratingOverall) { setError('Please add an overall rating'); return }
    setError('')

    startTransition(async () => {
      const result = await createDateReview({
        plan_id: plan.id,
        title: title.trim(),
        body,
        visited_on: visitedOn,
        rating_overall: ratingOverall,
        rating_vibe: ratingVibe,
        tags,
        categories: selectedCategories,
        is_public: isPublic,
        is_draft: isDraft,
        venue_reviews: venueOpen
          ? venueStates.map(v => ({
              place_id: v.place_id,
              place_name: v.place_name,
              rating_overall: v.rating,
              body: v.body,
            }))
          : [],
      })

      if (result.error) {
        setError(result.error)
      } else if (isDraft) {
        router.push('/profile')
      } else {
        router.push(`/r/${result.slug}`)
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Selected plan context */}
      <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground font-medium">Reviewing</p>
          <p className="text-sm font-bold text-foreground truncate">{plan.title}</p>
        </div>
        <button
          type="button"
          onClick={onChangePlan}
          className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          Change
        </button>
      </div>

      {/* Section 1 — About the date */}
      <section className="rounded-2xl bg-card border border-border p-6 space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          About the date
        </h2>
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-foreground">
            Title <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="A magical night in Gastown…"
            className={inputClass}
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-foreground">Date</label>
          <input
            type="date"
            value={visitedOn}
            onChange={e => setVisitedOn(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-foreground">Your review</label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={5}
            placeholder="What made it special? What would you do differently? Tips for the next couple…"
            className={`${inputClass} resize-y`}
          />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">Tags</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {DATE_TAGS.map(({ label, emoji }) => (
              <label
                key={label}
                className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                  tags.includes(label)
                    ? 'border-primary bg-secondary/30'
                    : 'border-input bg-background hover:border-primary/50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={tags.includes(label)}
                  onChange={() => toggleTag(label)}
                  className="accent-primary"
                />
                <span>{emoji} {label}</span>
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2 — Ratings */}
      <section className="rounded-2xl bg-card border border-border p-6 space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Rate the experience
        </h2>
        <StarPicker value={ratingOverall} onChange={setRatingOverall} label="Overall" required />
        <StarPicker value={ratingVibe}    onChange={setRatingVibe}    label="Date Vibe" />
      </section>

      {/* Section 3 — Categories */}
      <section className="rounded-2xl bg-card border border-border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Categories</h2>
          <button
            type="button"
            onClick={suggestCategories}
            disabled={suggesting}
            className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors disabled:opacity-60"
          >
            {suggesting ? '…' : '✨ AI Suggest'}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(({ name, emoji }) => (
            <button
              key={name}
              type="button"
              onClick={() => toggleCategory(name)}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors ${
                selectedCategories.includes(name)
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-input bg-background text-foreground hover:border-primary/50'
              }`}
            >
              <span>{emoji}</span>
              <span>{name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Section 4 — Review each venue (toggle) */}
      {venueStops.length > 0 && (
        <section className="rounded-2xl bg-card border border-border overflow-hidden">
          <button
            type="button"
            onClick={() => setVenueOpen(o => !o)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors"
          >
            <div className="text-left">
              <p className="text-sm font-bold text-foreground">✍️ Review each venue</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Add individual ratings for {venueStops.length} {venueStops.length === 1 ? 'stop' : 'stops'}
              </p>
            </div>
            {venueOpen ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
          </button>

          {venueOpen && (
            <div className="border-t border-border divide-y divide-border">
              {venueStates.map((v, idx) => (
                <div key={v.place_id} className="p-5 space-y-3">
                  <p className="text-sm font-bold text-foreground">
                    <span className="text-muted-foreground font-normal mr-1.5">{idx + 1}.</span>
                    {v.place_name}
                  </p>
                  <StarPicker
                    value={v.rating}
                    onChange={val => updateVenue(idx, 'rating', val)}
                    label="Rating"
                  />
                  <textarea
                    value={v.body}
                    onChange={e => updateVenue(idx, 'body', e.target.value)}
                    rows={2}
                    placeholder={`Notes on ${v.place_name}…`}
                    className={`${inputClass} resize-none`}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Visibility */}
      <label className="flex items-center gap-3 cursor-pointer select-none">
        <div
          onClick={() => setIsPublic(p => !p)}
          className={`relative h-5 w-9 rounded-full transition-colors ${isPublic ? 'bg-primary' : 'bg-muted'}`}
        >
          <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${isPublic ? 'translate-x-4' : 'translate-x-0.5'}`} />
        </div>
        <span className="text-sm font-semibold text-foreground">Share publicly</span>
      </label>

      {error && (
        <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => handleSubmit(true)}
          disabled={isPending}
          className="flex-1 rounded-2xl border border-border py-3 text-base font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-60"
        >
          {isPending ? 'Saving…' : 'Save as draft'}
        </button>
        <button
          type="button"
          onClick={() => handleSubmit(false)}
          disabled={isPending}
          className="flex-[2] rounded-2xl bg-primary py-3 text-base font-bold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
        >
          {isPending ? 'Posting…' : 'Post Review'}
        </button>
      </div>
    </div>
  )
}
