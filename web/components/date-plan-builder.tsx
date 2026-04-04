'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { X, Plus, GripVertical } from 'lucide-react'

type Stop = {
  id: string           // local temp id
  place_name: string
  notes: string
  duration_minutes: string
}

export function DatePlanBuilder({ userId }: { userId: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<'saved' | 'planned' | 'completed'>('planned')
  const [visitedOn, setVisitedOn] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [stops, setStops] = useState<Stop[]>([{ id: '1', place_name: '', notes: '', duration_minutes: '' }])
  const [error, setError] = useState('')
  const [saving, startTransition] = useTransition()

  function addStop() {
    setStops(prev => [...prev, { id: String(Date.now()), place_name: '', notes: '', duration_minutes: '' }])
  }

  function removeStop(id: string) {
    setStops(prev => prev.filter(s => s.id !== id))
  }

  function updateStop(id: string, field: keyof Stop, value: string) {
    setStops(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s))
  }

  function handleSave() {
    if (!title.trim()) { setError('Title is required.'); return }
    setError('')

    startTransition(async () => {
      const slug = title.trim().toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .slice(0, 50) + '-' + Math.random().toString(36).slice(2, 5)

      const { data: plan, error: planErr } = await supabase
        .from('date_plans')
        .insert({
          user_id: userId,
          title: title.trim(),
          description: description.trim() || null,
          slug,
          status,
          visited_on: visitedOn || null,
          is_public: isPublic,
        })
        .select('id, slug')
        .single()

      if (planErr || !plan) { setError(planErr?.message ?? 'Failed to save.'); return }

      const validStops = stops.filter(s => s.place_name.trim())
      if (validStops.length > 0) {
        // Upsert places and insert stops
        for (let i = 0; i < validStops.length; i++) {
          const s = validStops[i]
          let placeId: string | null = null

          if (s.place_name.trim()) {
            const { data: place } = await supabase
              .from('places')
              .upsert({ name: s.place_name.trim(), city: null }, { onConflict: 'name,city' })
              .select('id')
              .single()
            placeId = place?.id ?? null
          }

          await supabase.from('date_stops').insert({
            date_plan_id: plan.id,
            place_id: placeId,
            stop_order: i,
            duration_minutes: s.duration_minutes ? parseInt(s.duration_minutes) : null,
            notes: s.notes.trim() || null,
          })
        }
      }

      router.push(`/plan/${plan.slug}`)
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      {/* Basic info */}
      <div className="rounded-2xl bg-card border border-border p-5 space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">About this date</h2>

        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Title *"
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Describe the vibe…"
          rows={2}
          className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as any)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="saved">💡 Idea</option>
              <option value="planned">📅 Planned</option>
              <option value="completed">✅ Done</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Date</label>
            <input
              type="date"
              value={visitedOn}
              onChange={e => setVisitedOn(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>

        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div
            onClick={() => setIsPublic(p => !p)}
            className={`relative h-5 w-9 rounded-full transition-colors ${isPublic ? 'bg-primary' : 'bg-muted'}`}
          >
            <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${isPublic ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </div>
          <span className="text-sm font-semibold text-foreground">Share publicly</span>
        </label>
      </div>

      {/* Stops */}
      <div className="rounded-2xl bg-card border border-border p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Stops</h2>
          <button
            onClick={addStop}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus size={13} /> Add stop
          </button>
        </div>

        <div className="space-y-3">
          {stops.map((stop, i) => (
            <div key={stop.id} className="rounded-xl border border-border bg-background p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <input
                  type="text"
                  value={stop.place_name}
                  onChange={e => updateStop(stop.id, 'place_name', e.target.value)}
                  placeholder="Place name"
                  className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                {stops.length > 1 && (
                  <button onClick={() => removeStop(stop.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <X size={16} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={stop.duration_minutes}
                  onChange={e => updateStop(stop.id, 'duration_minutes', e.target.value)}
                  placeholder="Duration (min)"
                  min={0}
                  className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <input
                  type="text"
                  value={stop.notes}
                  onChange={e => updateStop(stop.id, 'notes', e.target.value)}
                  placeholder="Notes"
                  className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {saving ? 'Saving…' : 'Save date plan'}
      </button>
    </div>
  )
}
