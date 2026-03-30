import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/site-header'
import { ReviewCard } from '@/components/review-card'
import type { ReviewCardData } from '@/components/review-card'

export default async function MyDatesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: reviews } = await supabase
    .from('reviews')
    .select(`
      id, slug, title, body, visited_on, rating_overall, is_public, created_at,
      profiles ( id, username, display_name, avatar_url ),
      places ( id, name, city ),
      review_photos ( id, storage_path, sort_order ),
      review_tags ( date_tags ( id, label, emoji ) )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const allReviews = (reviews ?? []) as unknown as (ReviewCardData & { is_public: boolean })[]
  const publicCount  = allReviews.filter(r => r.is_public).length
  const privateCount = allReviews.filter(r => !r.is_public).length

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground">My Dates</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {allReviews.length} {allReviews.length === 1 ? 'date' : 'dates'} logged
              {allReviews.length > 0 && ` · ${publicCount} public · ${privateCount} private`}
            </p>
          </div>
          <Link
            href="/write"
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            + Log a date
          </Link>
        </div>

        {allReviews.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allReviews.map(review => (
              <div key={review.id} className="relative">
                <ReviewCard review={review} />
                {!review.is_public && (
                  <span className="absolute top-3 right-3 rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Private
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card p-16 text-center space-y-4">
            <p className="text-4xl">📓</p>
            <p className="text-xl font-extrabold text-foreground">No dates logged yet</p>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Every date you log becomes part of your personal date diary. Start with your most recent one.
            </p>
            <Link
              href="/write"
              className="inline-flex rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Log your first date
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
