import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

export const metadata = {
  title: 'About — Dated',
  description: 'Dated is the date review app for couples. Discover, plan, and share date experiences at restaurants, parks, and venues across Vancouver and beyond.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-2xl px-4 py-12 space-y-10">

        {/* Headline */}
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">About Dated</p>
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight leading-tight">
            The date review app for couples
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Think of Dated as a Yelp and Letterboxd hybrid — but specifically built for couples
            who want to document, rate, and revisit their date experiences.
          </p>
        </div>

        {/* The story */}
        <div className="space-y-4 text-foreground/80 leading-relaxed">
          <h2 className="text-xl font-extrabold text-foreground">Why we built this</h2>
          <p>
            Planning a good date is harder than it should be. You scroll through Google Maps, ask
            friends for recommendations, maybe check Yelp — but none of those tools are designed
            for the specific question couples are actually asking: <em>Is this a good place to take
            someone on a date?</em>
          </p>
          <p>
            Rated 4.5 stars on Yelp doesn&apos;t tell you whether the lighting is romantic, whether
            it&apos;s too loud for conversation, or whether it&apos;s worth the price for a special night
            out. A movie review platform tells you what to watch but not where to go. And your
            friends&apos; recommendations are great, but they can&apos;t remember every place they loved two
            years ago.
          </p>
          <p>
            Dated was built to solve this. It&apos;s a place where couples can log the dates they&apos;ve
            been on, rate venues for the things that actually matter on a date, and discover what
            other couples have loved. Over time, it becomes a personal archive of your relationship
            — every restaurant, park, rooftop, gallery, and hidden corner you&apos;ve discovered together.
          </p>
        </div>

        {/* What you can do */}
        <div className="space-y-4">
          <h2 className="text-xl font-extrabold text-foreground">What you can do on Dated</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                emoji: '⭐',
                title: 'Review date spots',
                desc: 'Rate venues on ambiance, food, service, value, and overall date vibe. Write notes you\'ll actually want to read later.',
              },
              {
                emoji: '🗺️',
                title: 'Plan your next date',
                desc: 'Build a custom multi-stop date plan, or let our AI planner design one for you based on your preferences and neighbourhood.',
              },
              {
                emoji: '📍',
                title: 'Discover great places',
                desc: 'Browse the community map of reviewed date spots. Filter by type, price, and rating to find something that fits the vibe.',
              },
              {
                emoji: '📖',
                title: 'Keep a date journal',
                desc: 'Your profile becomes a personal history of every date you\'ve logged — organized by venue, date, and rating.',
              },
              {
                emoji: '✨',
                title: 'AI date planner',
                desc: 'Tell us your neighbourhood, budget, and vibe. Our AI builds a full itinerary with real venues, walking times, and the weather forecast.',
              },
              {
                emoji: '🏆',
                title: 'Earn achievements',
                desc: 'Unlock badges as you log more dates — from your first review to becoming a neighbourhood expert.',
              },
            ].map(({ emoji, title, desc }) => (
              <div key={title} className="rounded-2xl border border-border bg-card p-4 space-y-1.5">
                <p className="font-bold text-foreground text-sm">{emoji} {title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Who it's for */}
        <div className="space-y-3 text-foreground/80 leading-relaxed">
          <h2 className="text-xl font-extrabold text-foreground">Who it&apos;s for</h2>
          <p>
            Dated is built for couples at any stage of a relationship — whether you&apos;re planning
            a first date and want to get it right, or you&apos;ve been together for years and want a
            better way to discover new things and remember where you&apos;ve been.
          </p>
          <p>
            It&apos;s especially useful if you live in Vancouver, where we started — but the app
            works for couples anywhere in the world. Every review you write adds to a growing,
            community-sourced guide to the world&apos;s best date spots.
          </p>
        </div>

        {/* Built in Vancouver */}
        <div className="rounded-2xl bg-secondary/40 border border-border p-6 space-y-3">
          <p className="text-2xl">🍁</p>
          <h2 className="text-lg font-extrabold text-foreground">Built in Vancouver, BC</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Dated was built by a Vancouver-based developer who is, by all accounts, a chronic
            over-planner of dates — the kind of person who has strong opinions about ambiance,
            researches restaurants three weeks in advance, and still somehow ends up at the wrong
            place on the night. The irony is not lost on them.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The idea was simple: after one too many evenings spent scrolling through Google Maps,
            cross-referencing Yelp reviews written by people who clearly weren&apos;t on a date,
            and asking friends who couldn&apos;t remember where they went six months ago — it felt
            obvious that this tool should exist. So it got built.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Dated is an independent product. No outside funding, no corporate owner. Just a
            Vancouver developer, a genuine love of a well-planned evening out, and a deeply
            held belief that &ldquo;it&apos;s fine, anywhere is good&rdquo; is never actually true.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
          >
            Get in touch →
          </Link>
        </div>

        {/* CTA */}
        <div className="rounded-2xl bg-primary p-8 text-center space-y-4">
          <h2 className="text-2xl font-extrabold text-primary-foreground">Start logging your dates</h2>
          <p className="text-primary-foreground/80 text-sm">
            Free to join. Your first review takes two minutes.
          </p>
          <Link
            href="/signup"
            className="inline-flex rounded-xl bg-white px-8 py-3 text-sm font-bold text-primary hover:bg-white/90 transition-colors"
          >
            Create a free account
          </Link>
        </div>

      </main>
      <SiteFooter />
    </div>
  )
}
