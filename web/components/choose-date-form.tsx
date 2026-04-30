'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Share2, BookmarkPlus, Check, MapPin, Clock, Sparkles } from 'lucide-react'

const RouteMap = dynamic(() => import('./route-map').then(m => m.RouteMap), { ssr: false })

const BUDGETS = [
  { value: 'under $50', label: 'Under $50', emoji: '💸' },
  { value: '$50–$150', label: '$50–$150', emoji: '💳' },
  { value: '$150+',    label: '$150+',     emoji: '💎' },
]

const VIBES = [
  { value: 'Romantic',    emoji: '🕯️' },
  { value: 'Adventurous', emoji: '🧗' },
  { value: 'Casual',      emoji: '☕' },
  { value: 'Foodie',      emoji: '🍜' },
  { value: 'Artsy',       emoji: '🎨' },
  { value: 'Active',      emoji: '🏃' },
]

const NEIGHBOURHOODS = [
  'Anywhere',
  'Downtown',
  'Gastown',
  'Kitsilano',
  'Mount Pleasant',
  'East Vancouver',
  'North Vancouver',
  'West End',
  'Yaletown',
  'Commercial Drive',
]

const TYPES = [
  { value: 'Dinner + drinks',   emoji: '🍷' },
  { value: 'Dinner + activity', emoji: '🎯' },
  { value: 'Full day out',      emoji: '☀️' },
  { value: 'Outdoor adventure', emoji: '🌿' },
  { value: 'Spontaneous night', emoji: '⚡' },
]

const LOADING_STEPS = [
  '🌤️  Checking tonight\'s weather…',
  '✨  Crafting your perfect date…',
  '📍  Finding real venues…',
  '🗺️  Optimising your route…',
]

type Stop = {
  order: number
  venue_name: string
  verified_name?: string
  venue_type: string
  neighbourhood: string
  duration_minutes: number
  notes: string
  why_it_fits: string
  google_place_id?: string
  address?: string
  lat?: number | null
  lng?: number | null
  verified: boolean
  travel_to_next_minutes?: number | null
}

type Plan = {
  title: string
  description: string
  weather_note?: string
  weather: { temp: number; condition: string }
  stops: Stop[]
  total_duration_minutes: number
  estimated_cost_per_person: string
}

const inputClass = 'w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring'

export function ChooseDateForm() {
  const [budget, setBudget] = useState('')
  const [vibe, setVibe] = useState('')
  const [neighbourhood, setNeighbourhood] = useState('Anywhere')
  const [type, setType] = useState('')
  const [step, setStep] = useState<'form' | 'loading' | 'result'>('form')
  const [loadingStep, setLoadingStep] = useState(0)
  const [plan, setPlan] = useState<Plan | null>(null)
  const [error, setError] = useState('')
  const [savedSlug, setSavedSlug] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [shared, setShared] = useState(false)

  const canSubmit = budget && vibe && type

  async function handleGenerate() {
    if (!canSubmit) return
    setError('')
    setStep('loading')
    setLoadingStep(0)

    // Cycle through loading steps
    const interval = setInterval(() => {
      setLoadingStep(prev => (prev + 1) % LOADING_STEPS.length)
    }, 1800)

    try {
      const res = await fetch('/api/ai/choose-date', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ budget, vibe, neighbourhood, type }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error ?? 'Failed to generate')
      setPlan(data.plan)
      setStep('result')
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong. Try again.')
      setStep('form')
    } finally {
      clearInterval(interval)
    }
  }

  async function handleSave(): Promise<string | null> {
    if (!plan) return null
    if (savedSlug) return savedSlug
    setSaving(true)
    try {
      const res = await fetch('/api/plans/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.slug) {
        setSavedSlug(data.slug)
        return data.slug
      }
    } catch {}
    finally { setSaving(false) }
    return null
  }

  async function handleShare() {
    const slug = await handleSave()
    const url = slug ? `https://getdated.app/plan/${slug}` : window.location.href
    if (navigator.share) {
      await navigator.share({ title: plan?.title, url })
    } else {
      await navigator.clipboard.writeText(url)
      setShared(true)
      setTimeout(() => setShared(false), 2000)
    }
  }

  // --- Loading ---
  if (step === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-6">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <Sparkles className="absolute inset-0 m-auto text-primary" size={22} />
        </div>
        <p className="text-sm font-semibold text-muted-foreground animate-pulse">
          {LOADING_STEPS[loadingStep]}
        </p>
      </div>
    )
  }

  // --- Result ---
  if (step === 'result' && plan) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{plan.weather.temp}°C · {plan.weather.condition}</span>
            {plan.weather_note && <span>· {plan.weather_note}</span>}
          </div>
          <h2 className="text-2xl font-extrabold text-foreground">{plan.title}</h2>
          <p className="text-sm text-muted-foreground">{plan.description}</p>
          <div className="flex gap-3 pt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Clock size={11} /> ~{Math.round(plan.total_duration_minutes / 60 * 10) / 10}h total</span>
            <span>{plan.estimated_cost_per_person} per person</span>
          </div>
        </div>

        {/* Map */}
        <RouteMap stops={plan.stops} />

        {/* Stops */}
        <div className="space-y-3">
          {plan.stops.map((stop, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-5 space-y-2">
              <div className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-black text-primary-foreground">
                  {stop.order}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-foreground">{stop.verified_name ?? stop.venue_name}</p>
                    {stop.verified && (
                      <span className="rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-[10px] font-semibold text-green-700 dark:text-green-400">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                    {stop.address && <span className="flex items-center gap-0.5"><MapPin size={10} />{stop.address}</span>}
                    {!stop.address && stop.neighbourhood && <span>{stop.neighbourhood}</span>}
                    <span>· {stop.duration_minutes} min</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-foreground leading-relaxed pl-10">{stop.notes}</p>
              <p className="text-xs text-muted-foreground pl-10 italic">{stop.why_it_fits}</p>
              {stop.travel_to_next_minutes && i < plan.stops.length - 1 && (
                <p className="text-xs text-muted-foreground pl-10">
                  🚶 {stop.travel_to_next_minutes} min walk to next stop
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
          >
            {shared ? <Check size={15} className="text-green-500" /> : <Share2 size={15} />}
            {shared ? 'Copied!' : 'Share'}
          </button>
          <button
            onClick={async () => {
              const slug = await handleSave()
              if (slug) window.location.href = `/plan/${slug}`
            }}
            disabled={saving || !!savedSlug}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
          >
            <BookmarkPlus size={15} />
            {saving ? 'Saving…' : savedSlug ? 'Saved ✓' : 'Save to My Dates'}
          </button>
        </div>

        <button
          onClick={() => { setPlan(null); setSavedSlug(null); setStep('form') }}
          className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
        >
          ← Generate a different date
        </button>
      </div>
    )
  }

  // --- Form ---
  return (
    <div className="space-y-6">
      {/* Budget */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Budget per person</label>
        <div className="grid grid-cols-3 gap-2">
          {BUDGETS.map(b => (
            <button
              key={b.value}
              type="button"
              onClick={() => setBudget(b.value)}
              className={`rounded-xl border py-3 text-sm font-semibold transition-colors ${
                budget === b.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-input bg-background text-foreground hover:border-primary/50'
              }`}
            >
              <div className="text-lg">{b.emoji}</div>
              <div className="text-xs mt-0.5">{b.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Vibe */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Vibe</label>
        <div className="grid grid-cols-3 gap-2">
          {VIBES.map(v => (
            <button
              key={v.value}
              type="button"
              onClick={() => setVibe(v.value)}
              className={`rounded-xl border py-3 text-sm font-semibold transition-colors ${
                vibe === v.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-input bg-background text-foreground hover:border-primary/50'
              }`}
            >
              <div className="text-lg">{v.emoji}</div>
              <div className="text-xs mt-0.5">{v.value}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Type */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Type of date</label>
        <div className="grid grid-cols-1 gap-2">
          {TYPES.map(t => (
            <button
              key={t.value}
              type="button"
              onClick={() => setType(t.value)}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                type === t.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-input bg-background text-foreground hover:border-primary/50'
              }`}
            >
              <span className="text-base">{t.emoji}</span>
              <span>{t.value}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Neighbourhood */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Neighbourhood</label>
        <select
          value={neighbourhood}
          onChange={e => setNeighbourhood(e.target.value)}
          className={inputClass}
        >
          {NEIGHBOURHOODS.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <button
        onClick={handleGenerate}
        disabled={!canSubmit}
        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors"
      >
        <Sparkles size={18} />
        Choose a date for me
      </button>
    </div>
  )
}
