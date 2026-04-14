'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function NewCollectionForm({ userId }: { userId: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [error, setError] = useState('')
  const [saving, startTransition] = useTransition()

  function handleSubmit() {
    if (!name.trim()) { setError('Name is required.'); return }
    setError('')
    startTransition(async () => {
      const slug = name.trim().toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .slice(0, 50) + '-' + Math.random().toString(36).slice(2, 5)

      const { error } = await supabase.from('collections').insert({
        user_id: userId,
        name: name.trim(),
        description: description.trim() || null,
        is_public: isPublic,
        slug,
      })

      if (error) { setError(error.message); return }
      router.push('/collections')
      router.refresh()
    })
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Name *
        </label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Best NYC dates"
          maxLength={100}
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Description
        </label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="What's this collection about?"
          rows={3}
          className="w-full resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      <label className="flex items-center gap-3 cursor-pointer select-none">
        <div
          onClick={() => setIsPublic(p => !p)}
          className={`relative h-5 w-9 rounded-full transition-colors ${isPublic ? 'bg-primary' : 'bg-muted'}`}
        >
          <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${isPublic ? 'translate-x-4' : 'translate-x-0.5'}`} />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Public collection</p>
          <p className="text-xs text-muted-foreground">Anyone can view and save this collection</p>
        </div>
      </label>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={saving}
        className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {saving ? 'Creating…' : 'Create collection'}
      </button>
    </div>
  )
}
