'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { Map, List } from 'lucide-react'

type PlacePin = {
  id: string
  name: string
  city: string | null
  latitude: number
  longitude: number
  avgRating: number | null
  topSlug: string | null
}

// Lazy-load the actual map to avoid SSR issues with Leaflet
const LeafletMap = dynamic(() => import('./leaflet-map'), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] rounded-2xl bg-muted animate-pulse flex items-center justify-center">
      <p className="text-sm text-muted-foreground">Loading map…</p>
    </div>
  ),
})

export function PlacesMap({ places }: { places: PlacePin[] }) {
  const [view, setView] = useState<'list' | 'map'>('list')

  if (places.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {places.length} place{places.length !== 1 ? 's' : ''} on map
        </p>
        <div className="flex items-center rounded-lg border border-border overflow-hidden">
          <button
            onClick={() => setView('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors ${view === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <List size={13} /> List
          </button>
          <button
            onClick={() => setView('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors ${view === 'map' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Map size={13} /> Map
          </button>
        </div>
      </div>

      {view === 'map' && <LeafletMap places={places} />}
    </div>
  )
}
