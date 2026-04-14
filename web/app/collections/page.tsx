import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/site-header'

export default async function CollectionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: collections } = await supabase
    .from('collections')
    .select('id, name, description, is_public, slug, created_at, collection_items(count)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground">Collections</h1>
            <p className="text-sm text-muted-foreground mt-1">Curate lists of your favourite dates</p>
          </div>
          <Link
            href="/collections/new"
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            + New collection
          </Link>
        </div>

        {collections && collections.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {collections.map(col => {
              const itemCount = (col.collection_items as any)?.[0]?.count ?? 0
              return (
                <Link
                  key={col.id}
                  href={`/collections/${col.slug}`}
                  className="group rounded-2xl bg-card border border-border p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="font-bold text-foreground group-hover:text-primary transition-colors truncate">
                        {col.name}
                      </h2>
                      {col.description && (
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{col.description}</p>
                      )}
                      <p className="mt-3 text-xs text-muted-foreground">
                        {itemCount} {itemCount === 1 ? 'date' : 'dates'}
                        {!col.is_public && (
                          <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                            Private
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-14 text-center space-y-4">
            <p className="text-4xl">🗂️</p>
            <p className="text-xl font-bold text-foreground">No collections yet</p>
            <p className="text-sm text-muted-foreground">
              Create themed lists — "Best NYC dates", "Rainy day spots", whatever fits your story.
            </p>
            <Link
              href="/collections/new"
              className="inline-block rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Create your first collection
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
