'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

type Idea = {
  id: string
  title: string
  description: string
  category: string
  budget: 1 | 2 | 3 | 4
  duration: string
  tags: string[]
  emoji: string
  tip: string
  idealFor: string
}

// ─── Static data ──────────────────────────────────────────────────────────────

const IDEAS: Idea[] = [
  {
    id: '1',
    title: 'Sunset Rooftop Dinner',
    description: 'Find a rooftop restaurant or bar and watch the city glow as the sun dips below the skyline. Order cocktails, share small plates, and let the ambiance do the rest.',
    category: 'Food & Dining',
    budget: 3,
    duration: '2-3 hrs',
    tags: ['Anniversary', 'Special Occasion', 'Romantic Getaway'],
    emoji: '🌇',
    tip: 'Book a corner table at least a week in advance — window seats sell out first.',
    idealFor: 'Anniversaries, special occasions',
  },
  {
    id: '2',
    title: 'Pottery Class for Two',
    description: 'Get your hands dirty in a couples pottery class. There\'s something wonderfully silly and intimate about shaping clay together — and you\'ll go home with a keepsake.',
    category: 'Activities',
    budget: 2,
    duration: '2-3 hrs',
    tags: ['First Date', 'Casual', 'Special Occasion'],
    emoji: '🏺',
    tip: 'Wear clothes you don\'t mind getting muddy. Most studios provide aprons but clay will find a way.',
    idealFor: 'First dates, creative couples',
  },
  {
    id: '3',
    title: 'Farmers Market & Picnic',
    description: 'Wander a local farmers market together, pick the best seasonal produce, artisan cheese, fresh bread, and flowers — then find a park bench and lay it all out.',
    category: 'Outdoors',
    budget: 1,
    duration: '2-3 hrs',
    tags: ['First Date', 'Casual', 'Spontaneous'],
    emoji: '🧺',
    tip: 'Go early (before 10am) for the best selection. Bring a reusable tote bag.',
    idealFor: 'First dates, casual outings',
  },
  {
    id: '4',
    title: 'Private Wine Tasting',
    description: 'Book a private or semi-private wine tasting at a local winery or wine bar. Learn to swirl, sniff, and sip while getting a little tipsy together.',
    category: 'Experiences',
    budget: 3,
    duration: '1-2 hrs',
    tags: ['Anniversary', 'Special Occasion', 'Romantic Getaway'],
    emoji: '🍷',
    tip: 'Ask for a food pairing — cheese and charcuterie make the tasting last longer and taste better.',
    idealFor: 'Wine lovers, anniversaries',
  },
  {
    id: '5',
    title: 'Cooking Class',
    description: 'Take a hands-on cooking class together — learn to make pasta, sushi, or a regional cuisine you\'ve always loved. Then sit down and eat what you made.',
    category: 'Experiences',
    budget: 2,
    duration: 'Half day',
    tags: ['First Date', 'Anniversary', 'Special Occasion'],
    emoji: '👨‍🍳',
    tip: 'Choose a cuisine neither of you knows well — the shared learning curve makes it more fun.',
    idealFor: 'Foodies, couples who love to cook',
  },
  {
    id: '6',
    title: 'Stargazing Road Trip',
    description: 'Drive out of the city to a dark-sky area, lay down a blanket, and marvel at the Milky Way. Bring hot drinks, snacks, and a star map app.',
    category: 'Outdoors',
    budget: 1,
    duration: 'Full day',
    tags: ['Spontaneous', 'Romantic Getaway', 'Anniversary'],
    emoji: '🌌',
    tip: 'Check weather 48 hrs ahead and bring more blankets than you think you need. It gets cold fast.',
    idealFor: 'Adventurous couples, romantics',
  },
  {
    id: '7',
    title: 'Art Gallery Hop',
    description: 'Spend an afternoon wandering 2-3 galleries or museums. Pick one piece each that resonates with you and explain why over coffee afterwards.',
    category: 'Arts & Culture',
    budget: 1,
    duration: '2-3 hrs',
    tags: ['First Date', 'Casual', 'Anniversary'],
    emoji: '🎨',
    tip: 'Many galleries are free on the first Friday of the month. Check local listings.',
    idealFor: 'Culture lovers, first dates',
  },
  {
    id: '8',
    title: 'Couples Spa Day',
    description: 'Book a couples massage or spa package and spend the afternoon being pampered side by side in robes. Pure decompression.',
    category: 'Wellness',
    budget: 4,
    duration: 'Half day',
    tags: ['Anniversary', 'Special Occasion', 'Celebration'],
    emoji: '🧖',
    tip: 'Arrive 30 mins early to use the pools, sauna, or steam room before your treatment.',
    idealFor: 'Anniversaries, stress relief',
  },
  {
    id: '9',
    title: 'Night Market Adventure',
    description: 'Explore a local night market, street food festival, or hawker stalls. Order five different things between you and share everything.',
    category: 'Food & Dining',
    budget: 1,
    duration: '2-3 hrs',
    tags: ['First Date', 'Casual', 'Spontaneous'],
    emoji: '🍢',
    tip: 'Come hungry. Split everything so you can try twice as many dishes.',
    idealFor: 'Food lovers, casual dates',
  },
  {
    id: '10',
    title: 'Kayaking or Paddleboarding',
    description: 'Rent kayaks or paddleboards and explore a lake, bay, or calm river together. Even falling in becomes a good story.',
    category: 'Outdoors',
    budget: 2,
    duration: '2-3 hrs',
    tags: ['First Date', 'Casual', 'Adventurous'],
    emoji: '🛶',
    tip: 'Tandem kayaks are romantic in theory but single kayaks are easier for beginners to control.',
    idealFor: 'Active couples, outdoor lovers',
  },
  {
    id: '11',
    title: 'Live Jazz or Blues Night',
    description: 'Find a cozy jazz club with a late-night set, order whiskey sours, and let the music wash over you. Spontaneous dancing encouraged.',
    category: 'Nightlife',
    budget: 2,
    duration: '2-3 hrs',
    tags: ['Anniversary', 'Special Occasion', 'Celebration'],
    emoji: '🎷',
    tip: 'Smaller venues have the best atmosphere. Arrive early to snag a table near the stage.',
    idealFor: 'Music lovers, night owls',
  },
  {
    id: '12',
    title: 'Coastal Weekend Getaway',
    description: 'Book a charming inn or rental cottage by the ocean. Walk the beach at dawn, eat fresh seafood, read side by side, and unplug.',
    category: 'Day Trips',
    budget: 4,
    duration: 'Weekend',
    tags: ['Anniversary', 'Romantic Getaway', 'Special Occasion'],
    emoji: '🏖️',
    tip: 'Shoulder season (May or September) means fewer crowds and better deals without sacrificing weather.',
    idealFor: 'Milestone anniversaries, romantic escapes',
  },
  {
    id: '13',
    title: 'Escape Room Challenge',
    description: 'Book a 60-minute escape room and solve puzzles together under pressure. Incredibly revealing of how you communicate as a team — in the best way.',
    category: 'Activities',
    budget: 2,
    duration: '1-2 hrs',
    tags: ['First Date', 'Casual', 'Spontaneous'],
    emoji: '🔐',
    tip: 'Choose a horror-themed room only if you both genuinely like jump scares. Otherwise go mystery or heist.',
    idealFor: 'Competitive couples, first dates',
  },
  {
    id: '14',
    title: 'Botanical Garden Wander',
    description: 'Spend a slow morning in a botanical garden. Bring coffee, find the hidden corners, and take photos of each other among the blooms.',
    category: 'Outdoors',
    budget: 1,
    duration: '1-2 hrs',
    tags: ['First Date', 'Casual', 'Anniversary'],
    emoji: '🌸',
    tip: 'Visit during peak bloom season — check the garden\'s website for what\'s flowering this month.',
    idealFor: 'Nature lovers, spring dates',
  },
  {
    id: '15',
    title: 'Whisky or Craft Beer Tasting',
    description: 'Visit a local distillery or craft brewery for a guided tasting. Learn the production process, sample the range, and find your shared favourite.',
    category: 'Experiences',
    budget: 2,
    duration: '1-2 hrs',
    tags: ['Casual', 'First Date', 'Spontaneous'],
    emoji: '🥃',
    tip: 'Eat before you go. Tasting on an empty stomach sneaks up on you.',
    idealFor: 'Drink enthusiasts, casual dates',
  },
  {
    id: '16',
    title: 'Outdoor Movie Night',
    description: 'Set up a projector in the backyard, or find a local outdoor cinema. Bring pillows, blankets, and way too much popcorn.',
    category: 'Activities',
    budget: 1,
    duration: '2-3 hrs',
    tags: ['Casual', 'Spontaneous', 'Anniversary'],
    emoji: '🎬',
    tip: 'Pick a film you\'ve both seen and love — you\'ll spend half the night quoting it and laughing.',
    idealFor: 'Movie lovers, cozy dates',
  },
  {
    id: '17',
    title: 'Dance Class',
    description: 'Take a beginner salsa, swing, or tango class together. Expect to laugh at yourselves, touch a lot, and leave energized.',
    category: 'Activities',
    budget: 1,
    duration: '1-2 hrs',
    tags: ['First Date', 'Casual', 'Special Occasion'],
    emoji: '💃',
    tip: 'No experience needed — beginner classes are designed for exactly zero skill.',
    idealFor: 'Fun seekers, social butterflies',
  },
  {
    id: '18',
    title: 'Surprise Picnic Setup',
    description: 'Secretly arrange a picnic in a beautiful park — blanket, candles, flowers, a charcuterie spread, and champagne already waiting when you arrive "for a walk."',
    category: 'Surprises',
    budget: 2,
    duration: '2-3 hrs',
    tags: ['Anniversary', 'Proposal', 'Special Occasion'],
    emoji: '🎁',
    tip: 'Recruit a friend to lay everything out and leave before you arrive. Timing is everything.',
    idealFor: 'Proposals, anniversaries, grand gestures',
  },
  {
    id: '19',
    title: 'Brunch & Bookshop',
    description: 'Start with an unhurried brunch, then browse a used or independent bookshop together. Pick out a book you think the other person would love.',
    category: 'Arts & Culture',
    budget: 1,
    duration: '2-3 hrs',
    tags: ['First Date', 'Casual', 'Spontaneous'],
    emoji: '📚',
    tip: 'The book you choose for each other becomes a little personality test. Take it seriously.',
    idealFor: 'Bookworms, slow morning people',
  },
  {
    id: '20',
    title: 'Hiking to a View',
    description: 'Find a trail with a payoff view — a lookout, waterfall, or alpine lake. Pack lunch and eat at the top. Worth every step.',
    category: 'Outdoors',
    budget: 1,
    duration: 'Half day',
    tags: ['First Date', 'Casual', 'Adventurous'],
    emoji: '⛰️',
    tip: 'Research the trail length and elevation gain first. A "short hike" that takes 4 hours will wreck the vibe.',
    idealFor: 'Outdoor lovers, active couples',
  },
  {
    id: '21',
    title: 'Karaoke Night',
    description: 'Book a private karaoke room and spend two hours belting out bangers. Judgment-free zone — unless someone picks a 10-minute prog rock epic.',
    category: 'Nightlife',
    budget: 2,
    duration: '2-3 hrs',
    tags: ['First Date', 'Casual', 'Celebration'],
    emoji: '🎤',
    tip: 'Private room karaoke is far better than stage karaoke for dates. More intimate, less performative.',
    idealFor: 'Music lovers, energetic dates',
  },
  {
    id: '22',
    title: 'Sunrise Coffee & Walk',
    description: 'Wake up early, grab coffee from a 24hr café or brew at home, and walk to a viewpoint to watch the sunrise together. Simple. Beautiful.',
    category: 'Outdoors',
    budget: 1,
    duration: '1-2 hrs',
    tags: ['Casual', 'Anniversary', 'Spontaneous'],
    emoji: '🌅',
    tip: 'Use a sunrise time app to know exactly when to arrive so you don\'t miss it.',
    idealFor: 'Early risers, romantics',
  },
]

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = ['All', 'Food & Dining', 'Activities', 'Experiences', 'Day Trips', 'Nightlife', 'Outdoors', 'Arts & Culture', 'Wellness', 'Surprises']
const BUDGETS = ['Any', '$', '$$', '$$$', '$$$$']
const DURATIONS = ['Any', '1-2 hrs', 'Half day', 'Full day', 'Weekend']
const OCCASIONS = ['All', 'First Date', 'Anniversary', 'Casual', 'Special Occasion', 'Adventurous', 'Romantic Getaway']

const BUDGET_LABELS = ['', '$', '$$', '$$$', '$$$$']

const CATEGORY_COLORS: Record<string, string> = {
  'Food & Dining':   'bg-[oklch(0.95_0.04_30)]  text-[oklch(0.45_0.12_30)]',
  'Activities':      'bg-[oklch(0.95_0.04_150)] text-[oklch(0.40_0.12_150)]',
  'Experiences':     'bg-[oklch(0.93_0.06_295)] text-[oklch(0.44_0.14_295)]',
  'Day Trips':       'bg-[oklch(0.93_0.05_200)] text-[oklch(0.45_0.12_200)]',
  'Nightlife':       'bg-[oklch(0.93_0.05_270)] text-[oklch(0.40_0.14_270)]',
  'Outdoors':        'bg-[oklch(0.93_0.06_140)] text-[oklch(0.38_0.13_140)]',
  'Arts & Culture':  'bg-[oklch(0.95_0.04_60)]  text-[oklch(0.42_0.12_60)]',
  'Wellness':        'bg-[oklch(0.93_0.05_180)] text-[oklch(0.42_0.12_180)]',
  'Surprises':       'bg-[oklch(0.94_0.05_10)]  text-[oklch(0.45_0.14_10)]',
}

// ─── Idea card ────────────────────────────────────────────────────────────────

function IdeaCard({ idea }: { idea: Idea }) {
  const [tipOpen, setTipOpen] = useState(false)
  const headerColor = CATEGORY_COLORS[idea.category] ?? 'bg-secondary/30 text-secondary-foreground'

  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      {/* Header */}
      <div className={cn('px-5 py-4 flex items-start justify-between gap-3', headerColor)}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest opacity-70">{idea.category}</p>
          <h3 className="mt-0.5 text-lg font-extrabold leading-snug">{idea.title}</h3>
        </div>
        <span className="text-3xl leading-none shrink-0">{idea.emoji}</span>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5 gap-4">
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{idea.description}</p>

        {/* Meta pills */}
        <div className="flex flex-wrap gap-1.5">
          {idea.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-secondary/40 px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
              {tag}
            </span>
          ))}
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            {idea.duration}
          </span>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-primary tracking-wider">
            {BUDGET_LABELS[idea.budget]}
          </span>
        </div>

        {/* Ideal for */}
        <p className="text-xs text-muted-foreground italic">Best for: {idea.idealFor}</p>

        {/* Pro tip */}
        <div>
          <button
            type="button"
            onClick={() => setTipOpen((o) => !o)}
            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            <span>{tipOpen ? '▾' : '▸'}</span>
            Pro tip
          </button>
          {tipOpen && (
            <p className="mt-1.5 rounded-xl bg-secondary/20 px-3 py-2 text-xs text-foreground/80 leading-relaxed">
              {idea.tip}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="mt-auto flex items-center gap-2 pt-2">
          <Link
            href={`/explore?category=${encodeURIComponent(idea.category)}`}
            className="flex-1 rounded-xl bg-primary py-2 text-center text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Find places
          </Link>
          <button
            type="button"
            onClick={() => {/* requires auth */}}
            className="rounded-xl border border-border p-2 text-muted-foreground hover:text-primary hover:border-primary transition-colors"
            aria-label="Save idea"
          >
            ♡
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function IdeasPage() {
  const [selectedOccasion, setSelectedOccasion] = useState('All')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedBudget, setSelectedBudget] = useState('Any')
  const [selectedDuration, setSelectedDuration] = useState('Any')

  const filtered = IDEAS.filter((idea) => {
    if (selectedOccasion !== 'All' && !idea.tags.includes(selectedOccasion)) return false
    if (selectedCategory !== 'All' && idea.category !== selectedCategory) return false
    if (selectedBudget !== 'Any' && BUDGET_LABELS[idea.budget] !== selectedBudget) return false
    if (selectedDuration !== 'Any' && idea.duration !== selectedDuration) return false
    return true
  })

  const chipClass = useCallback(
    (active: boolean) =>
      cn(
        'whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition-colors cursor-pointer select-none',
        active
          ? 'bg-primary text-primary-foreground'
          : 'bg-card border border-border text-foreground hover:border-primary/50 hover:text-primary'
      ),
    []
  )

  return (
    <>
      <SiteHeader />

      {/* Hero */}
      <section
        className="relative py-20 px-4 text-center"
        style={{ background: 'linear-gradient(160deg, oklch(0.84 0.10 295) 0%, oklch(0.96 0.01 100) 100%)' }}
      >
        <h1 className="text-4xl font-extrabold text-foreground tracking-tight">
          Find your perfect date
        </h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-md mx-auto">
          Discover ideas for every occasion, budget, and vibe
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {OCCASIONS.map((occ) => (
            <button
              key={occ}
              type="button"
              className={chipClass(selectedOccasion === occ)}
              onClick={() => setSelectedOccasion(occ)}
            >
              {occ}
            </button>
          ))}
        </div>
      </section>

      {/* Sticky filter bar */}
      <div className="sticky top-14 z-40 bg-background/90 backdrop-blur border-b border-border py-3 px-4">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row gap-3 overflow-x-auto">
          {/* Category */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 flex-shrink-0">
            <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Category:</span>
            <div className="flex gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={cn(
                    'whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold transition-colors cursor-pointer',
                    selectedCategory === cat
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  )}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-6xl flex gap-3 mt-2 overflow-x-auto">
          {/* Budget */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Budget:</span>
            <div className="flex gap-1.5">
              {BUDGETS.map((b) => (
                <button
                  key={b}
                  type="button"
                  className={cn(
                    'whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold transition-colors cursor-pointer',
                    selectedBudget === b
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  )}
                  onClick={() => setSelectedBudget(b)}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
          {/* Duration */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Duration:</span>
            <div className="flex gap-1.5">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  className={cn(
                    'whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold transition-colors cursor-pointer',
                    selectedDuration === d
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  )}
                  onClick={() => setSelectedDuration(d)}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Ideas grid */}
      <main className="mx-auto max-w-6xl px-4 py-10 w-full">
        {filtered.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <p className="text-xl font-bold text-foreground">No ideas match your filters</p>
            <p className="text-muted-foreground text-sm">Try adjusting the category, budget, or occasion.</p>
            <button
              type="button"
              onClick={() => {
                setSelectedOccasion('All')
                setSelectedCategory('All')
                setSelectedBudget('Any')
                setSelectedDuration('Any')
              }}
              className="inline-block rounded-2xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <p className="mb-6 text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filtered.length}</span> idea{filtered.length !== 1 ? 's' : ''}
            </p>
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
              {filtered.map((idea) => (
                <div key={idea.id} className="break-inside-avoid">
                  <IdeaCard idea={idea} />
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Bottom CTA */}
      <div className="border-t border-border bg-card py-10 px-4 text-center">
        <p className="text-base text-muted-foreground">
          Can&apos;t find what you&apos;re looking for?{' '}
          <Link href="/write" className="font-semibold text-primary hover:underline">
            Tell the community →
          </Link>
        </p>
      </div>
    </>
  )
}
