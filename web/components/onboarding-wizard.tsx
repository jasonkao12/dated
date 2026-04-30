'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { savePreferences, type DatePreferences } from '@/app/actions/preferences'

// ── Step helpers ─────────────────────────────────────────────────────────────

function chipClass(selected: boolean) {
  return `rounded-xl border px-4 py-3 text-sm font-semibold transition-colors cursor-pointer select-none ${
    selected
      ? 'border-primary bg-primary/10 text-primary'
      : 'border-input bg-background text-foreground hover:border-primary/50'
  }`
}

function StepHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="space-y-1">
      <h2 className="text-2xl font-extrabold text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
  )
}

// ── Default prefs ─────────────────────────────────────────────────────────────

const DEFAULT_PREFS: DatePreferences = {
  transport_mode: 'walking',
  max_travel_minutes: 15,
  home_neighbourhood: 'Anywhere',
  travel_beyond_vancouver: false,
  dietary: [],
  drinks_alcohol: true,
  activity_level: 'moderate',
  date_length: '3-4h',
  date_timing: [],
  relationship_stage: 'established',
  partner_name: '',
  repetition_preference: 0,
}

const NEIGHBOURHOODS = [
  'Anywhere',
  'Commercial Drive', 'Downtown', 'East Vancouver', 'Gastown',
  'Kitsilano', 'Mount Pleasant', 'North Vancouver', 'West End', 'Yaletown',
]

// ── Steps ─────────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 6

export function OnboardingWizard() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [prefs, setPrefs] = useState<DatePreferences>(DEFAULT_PREFS)
  const [isPending, startTransition] = useTransition()

  function set<K extends keyof DatePreferences>(key: K, value: DatePreferences[K]) {
    setPrefs(p => ({ ...p, [key]: value }))
  }

  function toggleArray(key: 'dietary' | 'date_timing', value: string) {
    setPrefs(p => {
      const arr = p[key] as string[]
      return { ...p, [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] }
    })
  }

  function next() { setStep(s => Math.min(s + 1, TOTAL_STEPS - 1)) }
  function back() { setStep(s => Math.max(s - 1, 0)) }

  function handleFinish() {
    startTransition(async () => {
      await savePreferences(prefs)
      router.push('/date-builder')
    })
  }

  function handleSkip() {
    startTransition(async () => {
      await savePreferences(DEFAULT_PREFS)
      router.push('/date-builder')
    })
  }

  // ── Step 0: Getting around ──────────────────────────────────────────────────
  const step0 = (
    <div className="space-y-6">
      <StepHeader title="Getting around 🚦" subtitle="How do you and your partner usually travel on dates?" />

      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Transport mode</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'walking',  label: 'Walking',  emoji: '🚶' },
            { value: 'driving',  label: 'Driving',  emoji: '🚗' },
            { value: 'transit',  label: 'Transit',  emoji: '🚌' },
            { value: 'rideshare',label: 'Rideshare',emoji: '🚕' },
            { value: 'cycling',  label: 'Cycling',  emoji: '🚲' },
          ].map(opt => (
            <button key={opt.value} type="button" onClick={() => set('transport_mode', opt.value)}
              className={chipClass(prefs.transport_mode === opt.value)}>
              <div className="text-lg">{opt.emoji}</div>
              <div className="text-xs mt-0.5">{opt.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Max travel between stops</label>
        <div className="grid grid-cols-4 gap-2">
          {[
            { value: 10, label: '10 min' },
            { value: 15, label: '15 min' },
            { value: 20, label: '20 min' },
            { value: 30, label: '30+ min' },
          ].map(opt => (
            <button key={opt.value} type="button" onClick={() => set('max_travel_minutes', opt.value)}
              className={chipClass(prefs.max_travel_minutes === opt.value)}>
              <div className="text-xs font-bold">{opt.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  // ── Step 1: Your area ───────────────────────────────────────────────────────
  const step1 = (
    <div className="space-y-6">
      <StepHeader title="Your area 📍" subtitle="Where are you usually based when going on dates?" />

      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Home neighbourhood</label>
        <select
          value={prefs.home_neighbourhood}
          onChange={e => set('home_neighbourhood', e.target.value)}
          className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {NEIGHBOURHOODS.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Willing to travel further?</label>
        <p className="text-xs text-muted-foreground">Include suggestions across the bridge (North Van, Burnaby, Richmond)</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: true,  label: 'Yes, expand my range', emoji: '🗺️' },
            { value: false, label: 'Keep it in the city',  emoji: '🏙️' },
          ].map(opt => (
            <button key={String(opt.value)} type="button"
              onClick={() => set('travel_beyond_vancouver', opt.value)}
              className={chipClass(prefs.travel_beyond_vancouver === opt.value)}>
              <div className="text-lg">{opt.emoji}</div>
              <div className="text-xs mt-0.5 leading-tight">{opt.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  // ── Step 2: Food & drink ────────────────────────────────────────────────────
  const step2 = (
    <div className="space-y-6">
      <StepHeader title="Food & drink 🍽️" subtitle="Help us avoid suggesting places that don't work for you." />

      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Dietary needs <span className="normal-case font-normal">(select all that apply)</span></label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'vegetarian',   label: 'Vegetarian',   emoji: '🥗' },
            { value: 'vegan',        label: 'Vegan',        emoji: '🌱' },
            { value: 'gluten-free',  label: 'Gluten-free',  emoji: '🌾' },
            { value: 'halal',        label: 'Halal',        emoji: '☪️' },
          ].map(opt => (
            <button key={opt.value} type="button"
              onClick={() => toggleArray('dietary', opt.value)}
              className={chipClass((prefs.dietary as string[]).includes(opt.value))}>
              <div className="text-lg">{opt.emoji}</div>
              <div className="text-xs mt-0.5">{opt.label}</div>
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Leave blank if no restrictions</p>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Alcohol</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: true,  label: 'We drink',     emoji: '🍷' },
            { value: false, label: "We don't drink", emoji: '🧃' },
          ].map(opt => (
            <button key={String(opt.value)} type="button"
              onClick={() => set('drinks_alcohol', opt.value)}
              className={chipClass(prefs.drinks_alcohol === opt.value)}>
              <div className="text-lg">{opt.emoji}</div>
              <div className="text-xs mt-0.5">{opt.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  // ── Step 3: Your style ──────────────────────────────────────────────────────
  const step3 = (
    <div className="space-y-6">
      <StepHeader title="Your style 💫" subtitle="What kind of energy do your dates usually have?" />

      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Activity level</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'chill',    label: 'Chill',    emoji: '🛋️', sub: 'Mostly sitting' },
            { value: 'moderate', label: 'Moderate', emoji: '🚶', sub: 'Some walking' },
            { value: 'active',   label: 'Active',   emoji: '🏃', sub: 'Hiking, sports' },
          ].map(opt => (
            <button key={opt.value} type="button" onClick={() => set('activity_level', opt.value)}
              className={chipClass(prefs.activity_level === opt.value)}>
              <div className="text-xl">{opt.emoji}</div>
              <div className="text-xs font-bold mt-0.5">{opt.label}</div>
              <div className="text-[10px] text-muted-foreground">{opt.sub}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Typical date length</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: '2h',       label: '~2 hours',      emoji: '⚡' },
            { value: '3-4h',     label: '3–4 hours',     emoji: '🌅' },
            { value: 'half-day', label: 'Half day',       emoji: '☀️' },
            { value: 'full-day', label: 'Full day',       emoji: '🌟' },
          ].map(opt => (
            <button key={opt.value} type="button" onClick={() => set('date_length', opt.value)}
              className={chipClass(prefs.date_length === opt.value)}>
              <div className="text-lg">{opt.emoji}</div>
              <div className="text-xs mt-0.5">{opt.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  // ── Step 4: Timing & stage ──────────────────────────────────────────────────
  const step4 = (
    <div className="space-y-6">
      <StepHeader title="Timing & you two 💑" subtitle="A bit more context so we can tailor suggestions." />

      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">When do you usually date? <span className="normal-case font-normal">(select all that apply)</span></label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'weekday_evening',   label: 'Weekday evenings', emoji: '🌆' },
            { value: 'weekend_afternoon', label: 'Weekend afternoons', emoji: '☀️' },
            { value: 'weekend_evening',   label: 'Weekend evenings', emoji: '🌃' },
            { value: 'spontaneous',       label: 'Spontaneous',     emoji: '⚡' },
          ].map(opt => (
            <button key={opt.value} type="button"
              onClick={() => toggleArray('date_timing', opt.value)}
              className={chipClass((prefs.date_timing as string[]).includes(opt.value))}>
              <div className="text-lg">{opt.emoji}</div>
              <div className="text-xs mt-0.5 leading-tight">{opt.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Relationship stage</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'new',         label: 'Just started',  emoji: '🌸' },
            { value: 'dating',      label: 'Dating',        emoji: '💛' },
            { value: 'established', label: 'Established',   emoji: '💚' },
            { value: 'long-term',   label: 'Long-term',     emoji: '💍' },
          ].map(opt => (
            <button key={opt.value} type="button" onClick={() => set('relationship_stage', opt.value)}
              className={chipClass(prefs.relationship_stage === opt.value)}>
              <div className="text-lg">{opt.emoji}</div>
              <div className="text-xs mt-0.5">{opt.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  // ── Step 5: Final details ───────────────────────────────────────────────────
  const REPETITION_LABELS = [
    { value: -2, label: 'Only new', sub: 'Always somewhere new' },
    { value: -1, label: 'Prefer new', sub: 'Lean towards exploring' },
    { value:  0, label: 'No preference', sub: 'Either is fine' },
    { value:  1, label: 'Prefer familiar', sub: 'Lean towards favourites' },
    { value:  2, label: 'Only familiar', sub: 'Stick to what you love' },
  ]

  const step5 = (
    <div className="space-y-6">
      <StepHeader title="The finishing touches ✨" subtitle="Almost done — two quick ones." />

      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Partner's name <span className="normal-case font-normal text-muted-foreground">(optional)</span>
        </label>
        <input
          type="text"
          placeholder="e.g. Alex"
          value={prefs.partner_name}
          onChange={e => set('partner_name', e.target.value)}
          className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <p className="text-xs text-muted-foreground">We'll personalise date plans with their name</p>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Repetition preference</label>
        <div className="flex items-center justify-between gap-1 text-[10px] text-muted-foreground font-medium px-0.5">
          <span>New locations</span>
          <span>Familiar spots</span>
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {REPETITION_LABELS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => set('repetition_preference', opt.value)}
              className={`flex flex-col items-center gap-1 rounded-xl border py-3 px-1 text-center transition-colors cursor-pointer ${
                prefs.repetition_preference === opt.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-input bg-background text-foreground hover:border-primary/50'
              }`}
            >
              <div className={`h-3 w-3 rounded-full border-2 transition-colors ${
                prefs.repetition_preference === opt.value
                  ? 'border-primary bg-primary'
                  : 'border-muted-foreground'
              }`} />
              <span className="text-[9px] font-semibold leading-tight">{opt.label}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center">
          {REPETITION_LABELS.find(l => l.value === prefs.repetition_preference)?.sub}
        </p>
      </div>
    </div>
  )

  const STEPS = [step0, step1, step2, step3, step4, step5]
  const isLast = step === TOTAL_STEPS - 1

  return (
    <div className="space-y-8">
      {/* Progress */}
      <div className="flex items-center gap-1.5">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i <= step ? 'bg-primary' : 'bg-muted'
            }`}
          />
        ))}
      </div>

      {/* Step label */}
      <p className="text-xs text-muted-foreground font-medium">
        Step {step + 1} of {TOTAL_STEPS}
      </p>

      {/* Content */}
      <div key={step} className="animate-in fade-in slide-in-from-right-4 duration-200">
        {STEPS[step]}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-2">
        {step > 0 && (
          <button
            type="button"
            onClick={back}
            className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
          >
            ← Back
          </button>
        )}
        <button
          type="button"
          onClick={isLast ? handleFinish : next}
          disabled={isPending}
          className="flex-1 rounded-2xl bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
        >
          {isPending ? 'Saving…' : isLast ? "Let's go! 🎉" : 'Next →'}
        </button>
      </div>

      {/* Skip */}
      <button
        type="button"
        onClick={handleSkip}
        disabled={isPending}
        className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
      >
        Skip for now, use defaults
      </button>
    </div>
  )
}
