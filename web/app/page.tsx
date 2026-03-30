import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/site-header'
import { ReviewCard } from '@/components/review-card'
import { IDEAS } from '@/lib/date-ideas'
import type { ReviewCardData } from '@/components/review-card'

const FEATURED_IDEAS = IDEAS.filter(i =>
  ['Sunset Rooftop Dinner', 'Pottery Class for Two', 'Stargazing Road Trip', 'Coastal Weekend Getaway'].includes(i.title)
)

const CATEGORY_COLORS: Record<string, string> = {
  'Food & Dining':  'bg-secondary text-secondary-foreground',
  'Activities':     'bg-accent/20 text-accent-foreground',
  'Outdoors':       'bg-green-100 text-green-800',
  'Experiences':    'bg-purple-100 text-purple-800',
  'Day Trips':      'bg-blue-100 text-blue-800',
  'Arts & Culture': 'bg-orange-100 text-orange-800',
  'Wellness':       'bg-pink-100 text-pink-800',
  'Nightlife':      'bg-slate-100 text-slate-800',
  'Surprises':      'bg-yellow-100 text-yellow-800',
}

const QUICK_CATEGORIES = [
  { emoji: '🍽️', label: 'Food & Dining',  href: '/ideas?category=Food+%26+Dining' },
  { emoji: '🎯', label: 'Activities',      href: '/ideas?category=Activities'      },
  { emoji: '🌿', label: 'Outdoors',        href: '/ideas?category=Outdoors'        },
  { emoji: '✨', label: 'Experiences',     href: '/ideas?category=Experiences'     },
  { emoji: '🚗', label: 'Day Trips',       href: '/ideas?category=Day+Trips'       },
  { emoji: '🎨', label: 'Arts & Culture',  href: '/ideas?category=Arts+%26+Culture'},
  { emoji: '🧘', label: 'Wellness',        href: '/ideas?category=Wellness'        },
  { emoji: '🌙', label: 'Nightlife',       href: '/ideas?category=Nightlife'       },
]

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: recentReviews } = await supabase
    .from('reviews')
    .select(`
      id, slug, title, body, visited_on, rating_overall, created_at,
      profiles ( id, username, display_name, avatar_url ),
      places ( id, name, city ),
      review_photos ( id, storage_path, sort_order ),
      review_tags ( date_tags ( id, label, emoji ) )
    `)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(6)

  const reviews = (recentReviews ?? []) as unknown as ReviewCardData[]

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-secondary via-background to-background px-4 py-16 text-center md:py-24">
        <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -top-10 -right-10 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />

        <div className="relative mx-auto max-w-2xl space-y-5">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-card px-3 py-1 text-xs font-semibold text-primary">
            ✨ Date ideas, reviews & planning — all in one place
          </div>
          <h1 className="text-5xl font-black leading-tight tracking-tight text-foreground md:text-6xl">
            Your next perfect<br />
            <span className="text-primary">date</span> starts here
          </h1>
          <p className="text-lg text-muted-foreground">
            Discover top-rated date spots, share your own experiences,<br className="hidden md:block" />
            and plan unforgettable dates for every occasion.
          </p>
          <div className="flex flex-col items-center gap-3 pt-2 sm:flex-row sm:justify-center">
            <Link
              href="/ideas"
              className="w-full sm:w-auto rounded-xl bg-primary px-8 py-3 text-base font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Plan a date ✨
            </Link>
            <Link
              href={user ? '/write' : '/signup'}
              className="w-full sm:w-auto rounded-xl border border-border bg-card px-8 py-3 text-base font-bold text-foreground hover:bg-muted transition-colors"
            >
              Share a date →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Category quick links ──────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
          {QUICK_CATEGORIES.map(({ emoji, label, href }) => (
            <Link
              key={label}
              href={href}
              className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-card p-3 text-center hover:border-primary/30 hover:shadow-sm transition-all"
            >
              <span className="text-2xl">{emoji}</span>
              <span className="text-[10px] font-semibold leading-tight text-muted-foreground">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured date ideas ───────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 py-8 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-foreground">Date ideas</h2>
            <p className="text-sm text-muted-foreground">Handpicked for every occasion</p>
          </div>
          <Link href="/ideas" className="text-sm font-semibold text-primary hover:underline">
            See all →
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURED_IDEAS.map(idea => (
            <Link
              key={idea.id}
              href="/ideas"
              className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-md transition-all"
            >
              <div className={`flex h-24 items-center justify-center text-4xl ${CATEGORY_COLORS[idea.category] ?? 'bg-muted'}`}>
                {idea.emoji}
              </div>
              <div className="p-4 space-y-1.5">
                <p className="font-bold text-sm text-foreground group-hover:text-primary transition-colors leading-snug">
                  {idea.title}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2">{idea.description}</p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-muted-foreground">{idea.duration}</span>
                  <span className="text-muted-foreground/40">·</span>
                  <span className="text-xs text-muted-foreground">{'$'.repeat(idea.budget)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Community reviews ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 py-8 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-foreground">From the community</h2>
            <p className="text-sm text-muted-foreground">Real dates, real reviews</p>
          </div>
        </div>

        {reviews.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map(review => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center space-y-3">
            <p className="text-3xl">💌</p>
            <p className="font-bold text-foreground">No reviews yet — be the first</p>
            <p className="text-sm text-muted-foreground">
              Share your favourite date spot and help others discover amazing places.
            </p>
            <Link
              href={user ? '/write' : '/signup'}
              className="inline-flex rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Write a review
            </Link>
          </div>
        )}
      </section>

      {/* ── How it works ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <div className="rounded-3xl bg-gradient-to-br from-secondary to-background border border-border p-8 md:p-12">
          <h2 className="text-2xl font-extrabold text-foreground text-center mb-8">How it works</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { step: '01', emoji: '🔍', title: 'Discover',   desc: 'Browse date ideas by occasion, category, and vibe. Filter by budget and duration.' },
              { step: '02', emoji: '💑', title: 'Experience', desc: 'Go on the date. Try something new, revisit an old favourite, or plan a surprise.' },
              { step: '03', emoji: '⭐', title: 'Share',      desc: 'Rate the spot, write a review, and help others find their next perfect date.' },
            ].map(({ step, emoji, title, desc }) => (
              <div key={step} className="text-center space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-card border border-border text-2xl shadow-sm">
                  {emoji}
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-primary">{step}</p>
                  <p className="text-lg font-extrabold text-foreground">{title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sign up CTA ───────────────────────────────────────────────── */}
      {!user && (
        <section className="mx-auto max-w-5xl px-4 py-8 pb-16">
          <div className="rounded-3xl bg-primary px-8 py-12 text-center space-y-4">
            <h2 className="text-3xl font-black text-primary-foreground">
              Ready to find your perfect date?
            </h2>
            <p className="text-primary-foreground/80 text-base">
              Join Dated — it&apos;s free, and your first review takes 2 minutes.
            </p>
            <Link
              href="/signup"
              className="inline-flex rounded-xl bg-white px-8 py-3 text-base font-bold text-primary hover:bg-white/90 transition-colors"
            >
              Get started for free
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}
