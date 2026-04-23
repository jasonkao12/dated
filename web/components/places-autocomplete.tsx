'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type Suggestion = {
  placeId: string
  name: string
  secondary: string
}

type PlaceDetails = {
  googlePlaceId: string
  name: string
  address: string
  city: string
  lat: number | null
  lng: number | null
  website: string | null
  phone: string | null
  priceLevel: number | null
  types: string[]
}

type Props = {
  /** Called when a place is selected and details are loaded */
  onSelect?: (place: PlaceDetails) => void
  /** Called when selection is cleared */
  onClear?: () => void
  error?: string
}

const inputClass =
  'w-full rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export function PlacesAutocomplete({ onSelect, onClear, error }: Props) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [searching, setSearching] = useState(false)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [selected, setSelected] = useState<PlaceDetails | null>(null)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const debouncedQuery = useDebounce(query, 300)

  // Search suggestions
  useEffect(() => {
    if (debouncedQuery.length < 2 || selected) {
      setSuggestions([])
      return
    }
    setSearching(true)
    fetch(`/api/places/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then(r => r.json())
      .then(data => {
        setSuggestions(data.suggestions ?? [])
        setOpen(true)
      })
      .catch(() => setSuggestions([]))
      .finally(() => setSearching(false))
  }, [debouncedQuery, selected])

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSelect = useCallback(async (s: Suggestion) => {
    setOpen(false)
    setQuery(s.name)
    setSuggestions([])
    setLoadingDetails(true)
    try {
      const res = await fetch(`/api/places/details?placeId=${s.placeId}`)
      const data = await res.json()
      if (data.place) {
        setSelected(data.place)
        onSelect?.(data.place)
      }
    } finally {
      setLoadingDetails(false)
    }
  }, [onSelect])

  const handleClear = useCallback(() => {
    setSelected(null)
    setQuery('')
    setSuggestions([])
    onClear?.()
  }, [onClear])

  // Hidden fields — passed to the server action
  const hidden = selected ? (
    <>
      <input type="hidden" name="google_place_id" value={selected.googlePlaceId} />
      <input type="hidden" name="venue_name"      value={selected.name} />
      <input type="hidden" name="venue_address"   value={selected.address} />
      <input type="hidden" name="venue_city"      value={selected.city} />
      <input type="hidden" name="venue_lat"       value={selected.lat ?? ''} />
      <input type="hidden" name="venue_lng"       value={selected.lng ?? ''} />
      <input type="hidden" name="venue_website"   value={selected.website ?? ''} />
      <input type="hidden" name="venue_phone"     value={selected.phone ?? ''} />
      <input type="hidden" name="venue_price_level" value={selected.priceLevel ?? ''} />
    </>
  ) : null

  // Selected state — show pill with venue info
  if (selected) {
    return (
      <div className="space-y-1">
        {hidden}
        <div className="flex items-start justify-between gap-3 rounded-xl border border-primary/40 bg-primary/5 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{selected.name}</p>
            <p className="truncate text-xs text-muted-foreground">{selected.address}</p>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="shrink-0 rounded-lg px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            Change
          </button>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative space-y-1">
      {/* Hidden fields still render when nothing selected so the form doesn't error */}
      <input type="hidden" name="google_place_id" value="" />
      <input type="hidden" name="venue_address"   value="" />
      <input type="hidden" name="venue_lat"       value="" />
      <input type="hidden" name="venue_lng"       value="" />
      <input type="hidden" name="venue_website"   value="" />
      <input type="hidden" name="venue_phone"     value="" />
      <input type="hidden" name="venue_price_level" value="" />

      <div className="relative">
        <input
          type="text"
          name="venue_name"
          required
          value={query}
          onChange={e => { setQuery(e.target.value); setSelected(null) }}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder="Search for a venue…"
          autoComplete="off"
          className={inputClass}
        />
        {(searching || loadingDetails) && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs animate-pulse">
            …
          </span>
        )}
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
          {suggestions.map(s => (
            <li key={s.placeId}>
              <button
                type="button"
                onMouseDown={e => e.preventDefault()} // prevent blur before click
                onClick={() => handleSelect(s)}
                className="w-full px-4 py-3 text-left hover:bg-muted transition-colors"
              >
                <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                <p className="text-xs text-muted-foreground truncate">{s.secondary}</p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
