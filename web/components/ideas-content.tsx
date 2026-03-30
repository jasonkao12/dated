'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { IDEAS, CATEGORIES, OCCASIONS } from '@/lib/date-ideas'
import type { Idea } from '@/lib/date-ideas'

const BUDGETS   = ['Any', '$', '$$', '$$$', '$$$$']
const DURATIONS = ['Any', '1-2 hrs', 'Half day', 'Full day', 'Weekend']
const BUDGET_LABELS = ['', '$', '$$', '$$$', '$$$$']

const CATEGORY_COLORS: Record<string, string> = {
  'Food & Dining':  'bg-[oklch(0.95_0.04_30)]  text-[oklch(0.45_0.12_30)]',
  'Activities':     'bg-[oklch(0.95_0.04_150)] text-[oklch(0.40_0.12_150)]',
  'Experiences':    'bg-[oklch(0.93_0.06_295)] text-[oklch(0.44_0.14_295)]',
  'Day Trips':      'bg-[oklch(0.93_0.05_200)] text-[oklch(0.45_0.12_200)]',
  'Nightlife':      'bg-[oklch(0.93_0.05_270)] text-[oklch(0.40_0.14_270)]',
  'Outdoors':       'bg-[oklch(0.93_0.06_140)] text-[oklch(0.38_0.13_140)]',
  'Arts & Culture': 'bg-[oklch(0.95_0.04_60)]  text-[oklch(0.42_0.12_60)]',
  'Wellness':       'bg-[oklch(0.93_0.05_180)] text-[oklch(0.42_0.12_180)]',
  'Surprises':      'bg-[oklch(0.94_0.05_10)]  text-[oklch(0.45_0.14_10)]',
}

function IdeaCard({ idea }: { idea: Idea }) {
  const [tipOpen, setTipOpen] = useState(false)
  const headerColor = CATEGORY_COLORS[idea.category] ?? 'bg-secondary/30 text-secondary-foreground'

  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      <div className={cn('px-5 py-4 flex items-start justify-between gap-3', headerColor)}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest opacity-70">{idea.category}</p>
          <h3 className="mt-0.5 text-lg font-extrabold leading-snug">{idea.title}</h3>
        </div>
        <span className="text-3xl leading-none shrink-0">{idea.emoji}</span>
      </div>
      <div className="flex flex-col flex-1 p-5 gap-4">
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{idea.description}</p>
        <div className="flex flex-wrap gap-1.5">
          {idea.tags.map(tag => (
            <span key={tag} className="rounded-full bg-secondary/40 px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">{tag}</span>
          ))}
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">{idea.duration}</span>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-primary tracking-wider">{BUDGET_LABELS[idea.budget]}</span>
        </div>
        <p className="text-xs text-muted-foreground italic">Best for: {idea.idealFor}</p>
        <div>
          <button type="button" onClick={() => setTipOpen(o => !o)}
            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
            <span>{tipOpen ? '▾' : '▸'}</span>Pro tip
          </button>
          {tipOpen && (
            <p className="mt-1.5 rounded-xl bg-secondary/20 px-3 py-2 text-xs text-foreground/80 leading-relaxed">{idea.tip}</p>
          )}
        </div>
        <div className="mt-auto flex items-center gap-2 pt-2">
          <Link href={`/explore?category=${encodeURIComponent(idea.category)}`}
            className="flex-1 rounded-xl bg-primary py-2 text-center text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors">
            Find places
          </Link>
          <button type="button"
            className="rounded-xl border border-border p-2 text-muted-foreground hover:text-primary hover:border-primary transition-colors"
            aria-label="Save idea">
            ♡
          </button>
        </div>
      </div>
    </div>
  )
}

export function IdeasContent() {
  const [selectedOccasion, setSelectedOccasion] = useState('All')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedBudget, setSelectedBudget] = useState('Any')
  const [selectedDuration, setSelectedDuration] = useState('Any')

  const filtered = IDEAS.filter(idea => {
    if (selectedOccasion !== 'All' && !idea.tags.includes(selectedOccasion)) return false
    if (selectedCategory !== 'All' && idea.category !== selectedCategory) return false
    if (selectedBudget !== 'Any' && BUDGET_LABELS[idea.budget] !== selectedBudget) return false
    if (selectedDuration !== 'Any' && idea.duration !== selectedDuration) return false
    return true
  })

  const chip = useCallback((active: boolean) =>
    cn('whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition-colors cursor-pointer select-none',
      active ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-foreground hover:border-primary/50 hover:text-primary'),
  [])

  const miniChip = (active: boolean) =>
    cn('whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold transition-colors cursor-pointer',
      active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground')

  return (
    <>
      {/* Hero */}
      <section className="relative py-20 px-4 text-center"
        style={{ background: 'linear-gradient(160deg, oklch(0.84 0.10 295) 0%, oklch(0.96 0.01 100) 100%)' }}>
        <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Find your perfect date</h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-md mx-auto">Discover ideas for every occasion, budget, and vibe</p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {OCCASIONS.map(occ => (
            <button key={occ} type="button" className={chip(selectedOccasion === occ)} onClick={() => setSelectedOccasion(occ)}>{occ}</button>
          ))}
        </div>
      </section>

      {/* Sticky filters */}
      <div className="sticky top-14 z-40 bg-background/90 backdrop-blur border-b border-border py-3 px-4">
        <div className="mx-auto max-w-6xl space-y-2">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Category:</span>
            <div className="flex gap-1.5">
              {CATEGORIES.map(cat => (
                <button key={cat} type="button" className={miniChip(selectedCategory === cat)} onClick={() => setSelectedCategory(cat)}>{cat}</button>
              ))}
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Budget:</span>
              <div className="flex gap-1.5">
                {BUDGETS.map(b => <button key={b} type="button" className={miniChip(selectedBudget === b)} onClick={() => setSelectedBudget(b)}>{b}</button>)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Duration:</span>
              <div className="flex gap-1.5">
                {DURATIONS.map(d => <button key={d} type="button" className={miniChip(selectedDuration === d)} onClick={() => setSelectedDuration(d)}>{d}</button>)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <main className="mx-auto max-w-6xl px-4 py-10">
        {filtered.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <p className="text-xl font-bold text-foreground">No ideas match your filters</p>
            <p className="text-sm text-muted-foreground">Try adjusting the category, budget, or occasion.</p>
            <button type="button"
              onClick={() => { setSelectedOccasion('All'); setSelectedCategory('All'); setSelectedBudget('Any'); setSelectedDuration('Any') }}
              className="inline-block rounded-2xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors">
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <p className="mb-6 text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filtered.length}</span> idea{filtered.length !== 1 ? 's' : ''}
            </p>
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
              {filtered.map(idea => (
                <div key={idea.id} className="break-inside-avoid">
                  <IdeaCard idea={idea} />
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      <div className="border-t border-border bg-card py-10 px-4 text-center">
        <p className="text-base text-muted-foreground">
          Can&apos;t find what you&apos;re looking for?{' '}
          <Link href="/write" className="font-semibold text-primary hover:underline">Tell the community →</Link>
        </p>
      </div>
    </>
  )
}
