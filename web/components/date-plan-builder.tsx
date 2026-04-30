'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { X, Plus } from 'lucide-react'
import { PlacesAutocomplete, type PlaceDetails } from '@/components/places-autocomplete'

type Stop = {
  id: string           // local temp id
  place_name: string
  notes: string
  duration_minutes: string
  // enriched from Places API
  google_place_id: string
  address: string
  lat: number | null
  lng: number | null
}

export type InitialPlanData = {
  planId: string
  planSlug: string
  title: string
  description: string
  status: 'saved' | 'planned' | 'completed'
  visitedOn: string
  isPublic: boolean
  isDraft: boolean
  stops: Stop[]
}

function newStop(id: string): Stop {
  return { id, place_name: '', notes: '', duration_minutes: '', google_place_id: '', address: '', lat: null, lng: null }
}

export function DatePlanBuilder({
  userId,
  initialData,
}: {
  userId: string
  initialData?: InitialPlanData
}) {
  const router = useRouter()
  const supabase = createClient()
  const isEditMode = !!initialData

  const [title, setTitle] = useState(initialData?.title ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [status, setStatus] = useState<'saved' | 'planned' | 'completed'>(initialData?.status ?? 'planned')
  const [visitedOn, setVisitedOn] = useState(initialData?.visitedOn ?? '')
  const [isPublic, setIsPublic] = useState(initialData?.isPublic ?? true)
  const [stops, setStops] = useState<Stop[]>(initialData?.stops.length ? initialData.stops : [newStop('1')])
  const [error, setError] = useState('')
  const [saving, startTransition] = useTransition()

  function addStop() {
    setStops(prev => [...prev, newStop(String(Date.now()))])
  }

  function removeStop(id: string) {
    setStops(prev => prev.filter(s => s.id !== id))
  }

  function updateStop(id: string, field: 'notes' | 'duration_minutes', value: string) {
    setStops(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s))
  }

  function updateStopPlace(id: string, place: PlaceDetails) {
    setStops(prev => prev.map(s => s.id === id ? {
      ...s,
      place_name: place.name,
      google_place_id: place.googlePlaceId,
      address: place.address,
      lat: place.lat,
      lng: place.lng,
    } : s))
  }

  function clearStopPlace(id: string) {
    setStops(prev => prev.map(s => s.id === id ? {
      ...s,
      place_name: '',
      google_place_id: '',
      address: '',
      lat: null,
      lng: null,
    } : s))
  }

  function handleSave(isDraft = false) {
    if (!title.trim()) { setError('Title is required.'); return }
    setError('')

    startTransition(async () => {
      let planId: string
      let planSlug: string

      if (isEditMode && initialData) {
        // Update existing plan
        const { error: updErr } = await supabase
          .from('date_plans')
          .update({
            title: title.trim(),
            description: description.trim() || null,
            status,
            visited_on: visitedOn || null,
            is_public: isDraft ? false : isPublic,
            is_draft: isDraft,
          })
          .eq('id', initialData.planId)
          .eq('user_id', userId)
        if (updErr) { setError(updErr.message); return }
        // Clear old stops for re-insert
        await supabase.from('date_stops').delete().eq('date_plan_id', initialData.planId)
        planId = initialData.planId
        planSlug = initialData.planSlug
      } else {
        // Create new plan
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
            is_public: isDraft ? false : isPublic,
            is_draft: isDraft,
          })
          .select('id, slug')
          .single()

        if (planErr || !plan) { setError(planErr?.message ?? 'Failed to save.'); return }
        planId = plan.id
        planSlug = plan.slug
      }

      // Fake plan object for stop insertion below
      const plan = { id: planId, slug: planSlug }

      const validStops = stops.filter(s => s.place_name.trim())
      if (validStops.length > 0) {
        for (let i = 0; i < validStops.length; i++) {
          const s = validStops[i]
          let placeId: string | null = null

          if (s.google_place_id) {
            // Known Google Place — upsert by google_place_id
            const { data: existing } = await supabase
              .from('places').select('id').eq('google_place_id', s.google_place_id).maybeSingle()
            if (existing) {
              placeId = existing.id
              await supabase.from('places').update({
                name: s.place_name, address: s.address, lat: s.lat, lng: s.lng,
              }).eq('id', existing.id)
            } else {
              const { data: newPlace } = await supabase.from('places').insert({
                name: s.place_name,
                google_place_id: s.google_place_id,
                address: s.address || null,
                lat: s.lat,
                lng: s.lng,
              }).select('id').single()
              placeId = newPlace?.id ?? null
            }
          } else {
            // Manual entry — plain name upsert
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

      if (isDraft) {
        router.push('/profile')
      } else {
        router.push(`/plan/${plan.slug}`)
      }
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
              <div className="flex items-start gap-2">
                <span className="flex h-6 w-6 mt-2.5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <PlacesAutocomplete
                    onSelect={place => updateStopPlace(stop.id, place)}
                    onClear={() => clearStopPlace(stop.id)}
                  />
                </div>
                {stops.length > 1 && (
                  <button onClick={() => removeStop(stop.id)} className="mt-2.5 text-muted-foreground hover:text-destructive transition-colors">
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

      <div className="flex gap-3">
        <button
          onClick={() => handleSave(true)}
          disabled={saving}
          className="flex-1 rounded-xl border border-border py-3.5 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving…' : 'Save as draft'}
        </button>
        <button
          onClick={() => handleSave(false)}
          disabled={saving}
          className="flex-[2] rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving…' : isEditMode ? 'Update plan' : 'Save date plan'}
        </button>
      </div>
    </div>
  )
}
