'use client'

import { useState } from 'react'
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps'

export type Bench = {
  id: string
  name: string
  nickname: string
  neighbourhood: string
  description: string
  lat: number
  lng: number
  ratings: {
    label: string
    emoji: string
    score: number // 1–5
  }[]
}

const MAP_ID = 'DEMO_MAP_ID'
const VANCOUVER = { lat: 49.2731, lng: -123.1507 }

function Stars({ score }: { score: number }) {
  return (
    <span className="text-amber-400 tracking-tighter text-xs">
      {'★'.repeat(score)}{'☆'.repeat(5 - score)}
    </span>
  )
}

function BenchMarker({ bench, selected, onClick }: {
  bench: Bench
  selected: boolean
  onClick: () => void
}) {
  return (
    <AdvancedMarker
      position={{ lat: bench.lat, lng: bench.lng }}
      onClick={onClick}
      title={bench.name}
      zIndex={selected ? 10 : 1}
    >
      <div
        style={{
          fontSize: selected ? 36 : 28,
          lineHeight: 1,
          cursor: 'pointer',
          transition: 'font-size 0.15s ease, filter 0.15s ease',
          filter: selected
            ? 'drop-shadow(0 3px 8px rgba(0,0,0,0.5))'
            : 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
          userSelect: 'none',
        }}
      >
        🪑
      </div>
    </AdvancedMarker>
  )
}

function BenchCard({ bench, onClose }: { bench: Bench; onClose: () => void }) {
  return (
    <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-20 animate-in slide-in-from-bottom-2 duration-200">
      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-xl overflow-hidden">
        <div className="bg-amber-50 dark:bg-amber-950/40 px-5 pt-5 pb-3 relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 text-lg leading-none"
          >
            ×
          </button>
          <p className="text-2xl mb-1">🪑</p>
          <h3 className="font-extrabold text-zinc-900 dark:text-zinc-100 text-base leading-tight">
            {bench.name}
          </h3>
          <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-0.5">
            "{bench.nickname}" · {bench.neighbourhood}
          </p>
        </div>
        <div className="px-5 py-4 space-y-3">
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {bench.description}
          </p>
          <div className="space-y-1.5 pt-1">
            {bench.ratings.map(r => (
              <div key={r.label} className="flex items-center justify-between gap-2">
                <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                  <span>{r.emoji}</span> {r.label}
                </span>
                <Stars score={r.score} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function BenchMap({ benches }: { benches: Bench[] }) {
  const [selected, setSelected] = useState<Bench | null>(null)

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!}>
      <div className="relative w-full" style={{ height: '70vh', minHeight: 420 }}>
        <Map
          mapId={MAP_ID}
          defaultCenter={VANCOUVER}
          defaultZoom={12}
          style={{ width: '100%', height: '100%', borderRadius: 16 }}
          gestureHandling="cooperative"
          disableDefaultUI={false}
          clickableIcons={false}
          onClick={() => setSelected(null)}
        >
          {benches.map(bench => (
            <BenchMarker
              key={bench.id}
              bench={bench}
              selected={selected?.id === bench.id}
              onClick={() => setSelected(bench)}
            />
          ))}
        </Map>

        {selected && (
          <BenchCard bench={selected} onClose={() => setSelected(null)} />
        )}
      </div>
    </APIProvider>
  )
}
