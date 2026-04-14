'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bookmark } from 'lucide-react'

type Collection = {
  id: string
  name: string
  slug: string
}

export function AddToCollection({
  reviewId,
  isAuthenticated,
}: {
  reviewId: string
  isAuthenticated: boolean
}) {
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [collections, setCollections] = useState<Collection[]>([])
  const [added, setAdded] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function loadCollections() {
    if (!isAuthenticated) return
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const [{ data: cols }, { data: items }] = await Promise.all([
      supabase.from('collections').select('id, name, slug').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('collection_items').select('collection_id').eq('review_id', reviewId),
    ])

    setCollections((cols ?? []) as Collection[])
    setAdded(new Set((items ?? []).map(i => i.collection_id)))
    setLoading(false)
  }

  function handleOpen() {
    if (!isAuthenticated) {
      window.location.href = '/login'
      return
    }
    setOpen(o => !o)
    if (!open) loadCollections()
  }

  async function toggle(collectionId: string) {
    if (added.has(collectionId)) {
      await supabase.from('collection_items')
        .delete()
        .eq('collection_id', collectionId)
        .eq('review_id', reviewId)
      setAdded(prev => { const n = new Set(prev); n.delete(collectionId); return n })
    } else {
      await supabase.from('collection_items')
        .insert({ collection_id: collectionId, review_id: reviewId })
      setAdded(prev => new Set([...prev, collectionId]))
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        title="Add to collection"
      >
        <Bookmark size={15} />
        <span>Save</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-64 rounded-2xl border border-border bg-card shadow-lg p-2">
          {loading ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">Loading…</p>
          ) : collections.length === 0 ? (
            <div className="px-3 py-3 text-center space-y-2">
              <p className="text-sm text-muted-foreground">No collections yet.</p>
              <a
                href="/collections/new"
                className="block rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground text-center hover:bg-primary/90 transition-colors"
              >
                + New collection
              </a>
            </div>
          ) : (
            <>
              {collections.map(col => (
                <button
                  key={col.id}
                  onClick={() => toggle(col.id)}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
                >
                  <span className={`h-4 w-4 rounded border flex items-center justify-center text-xs ${added.has(col.id) ? 'border-primary bg-primary text-primary-foreground' : 'border-border'}`}>
                    {added.has(col.id) ? '✓' : ''}
                  </span>
                  <span className="flex-1 truncate font-medium text-foreground">{col.name}</span>
                </button>
              ))}
              <div className="border-t border-border mt-1 pt-1">
                <a
                  href="/collections/new"
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors"
                >
                  + New collection
                </a>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
