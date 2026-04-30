'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { PlanOption } from '@/components/write-tabs'

const STATUS_EMOJI: Record<string, string> = {
  completed: '✅',
  planned:   '📅',
  saved:     '💡',
}

function formatDate(d: string | null) {
  if (!d) return null
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function PlanRow({ plan, onSelect }: { plan: PlanOption; onSelect: (p: PlanOption) => void }) {
  const stopCount = plan.date_stops?.length ?? 0
  const date = formatDate(plan.visited_on)
  return (
    <button
      type="button"
      onClick={() => onSelect(plan)}
      className="w-full flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3 text-left hover:border-primary/50 hover:bg-primary/5 transition-colors group"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="text-base shrink-0">{STATUS_EMOJI[plan.status] ?? '📅'}</span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
            {plan.title}
          </p>
          <p className="text-xs text-muted-foreground">
            {stopCount} {stopCount === 1 ? 'stop' : 'stops'}
            {date ? ` · ${date}` : ''}
          </p>
        </div>
      </div>
      <span className="text-xs text-muted-foreground shrink-0">Select →</span>
    </button>
  )
}

export function DatePlanSelector({
  plans,
  onSelect,
}: {
  plans: PlanOption[]
  onSelect: (plan: PlanOption) => void
}) {
  const [query, setQuery] = useState('')

  const q = query.toLowerCase().trim()
  const filtered = q ? plans.filter(p => p.title.toLowerCase().includes(q)) : plans

  const completed = filtered.filter(p => p.status === 'completed')
  const saved     = filtered.filter(p => p.status === 'saved' || p.status === 'planned')

  if (plans.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center space-y-4">
        <p className="text-3xl">🗺️</p>
        <p className="text-base font-bold text-foreground">No date plans yet</p>
        <p className="text-sm text-muted-foreground">Create a plan first, then come back to review it.</p>
        <Link
          href="/date-builder/new"
          className="inline-block rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Plan a date
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search your dates…"
        className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />

      {filtered.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No dates match &ldquo;{query}&rdquo;
        </p>
      )}

      {/* My Dates — completed */}
      {completed.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-1">
            My Dates
          </p>
          {completed.map(p => <PlanRow key={p.id} plan={p} onSelect={onSelect} />)}
        </div>
      )}

      {/* Saved — ideas + planned */}
      {saved.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-1">
            Saved
          </p>
          {saved.map(p => <PlanRow key={p.id} plan={p} onSelect={onSelect} />)}
        </div>
      )}
    </div>
  )
}
