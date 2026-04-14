import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/site-header'
import { ReviewCard } from '@/components/review-card'
import type { ReviewCardData } from '@/components/review-card'

export default async function DatesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: recentDates } = await supabase
    .from('reviews')
    .select(`
      id, slug, title, body, visited_on, rating_overall, is_public, created_at,
      profiles ( id, username, display_name, avatar_url ),
      places ( id, name, city ),
      review_photos ( id, storage_path, sort_order ),
      review_tags ( date_tags ( id, label, emoji ) )
    `)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(30)

  const dates = (recentDates ?? []) as unknown as ReviewCardData[]

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-8 space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground">Dates</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Real date experiences from the community
            </p>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <Link
                href="/my-dates"
                className="rounded-xl border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors"
              >
                My Dates
              </Link>
            )}
            <Link
              href={user ? '/write' : '/signup'}
              className="rounded-xl bg-primary px-5 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              + Log a date
            </Link>
          </div>
        </div>

        {dates.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dates.map(date => (
              <ReviewCard key={date.id} review={date} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card p-16 text-center space-y-4">
            <p className="text-4xl">💑</p>
            <p className="text-xl font-extrabold text-foreground">No dates logged yet</p>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Be the first to share a date experience with the community.
            </p>
            <Link
              href={user ? '/write' : '/signup'}
              className="inline-flex rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Log a date
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
