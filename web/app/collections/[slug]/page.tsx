import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/site-header'
import { ReviewCard, type ReviewCardData } from '@/components/review-card'

type Props = { params: Promise<{ slug: string }> }

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: collection } = await supabase
    .from('collections')
    .select('id, name, description, is_public, user_id, profiles(username, display_name)')
    .eq('slug', slug)
    .single()

  if (!collection) notFound()
  if (!collection.is_public && collection.user_id !== user?.id) notFound()

  const { data: items } = await supabase
    .from('collection_items')
    .select(`
      id, added_at,
      reviews (
        id, slug, title, body, visited_on, rating_overall, is_public, created_at,
        profiles ( id, username, display_name, avatar_url ),
        places ( id, name, city ),
        review_photos ( id, storage_path, sort_order ),
        review_tags ( date_tags ( id, label, emoji ) )
      )
    `)
    .eq('collection_id', collection.id)
    .order('added_at', { ascending: false })

  const reviews = (items ?? [])
    .map(item => item.reviews)
    .filter(Boolean) as unknown as ReviewCardData[]

  const owner = collection.profiles as unknown as { username: string; display_name: string | null } | null
  const isOwner = user?.id === collection.user_id

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-foreground">{collection.name}</h1>
              {owner && (
                <p className="text-sm text-muted-foreground mt-1">
                  by{' '}
                  <Link href={`/u/${owner.username}`} className="hover:text-primary transition-colors font-medium">
                    {owner.display_name ?? owner.username}
                  </Link>
                  {!collection.is_public && (
                    <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">Private</span>
                  )}
                </p>
              )}
              {collection.description && (
                <p className="mt-2 text-sm text-foreground/80 max-w-xl">{collection.description}</p>
              )}
            </div>
            {isOwner && (
              <Link
                href="/collections"
                className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                My collections
              </Link>
            )}
          </div>
          <p className="text-xs text-muted-foreground pt-1">
            {reviews.length} {reviews.length === 1 ? 'date' : 'dates'}
          </p>
        </div>

        {reviews.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map(review => (
              <ReviewCard key={review.slug} review={review} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-14 text-center space-y-3">
            <p className="text-lg font-semibold text-foreground">No dates in this collection yet</p>
            {isOwner && (
              <p className="text-sm text-muted-foreground">
                Open any review and click "Add to collection" to get started.
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
