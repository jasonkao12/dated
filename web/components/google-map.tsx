'use client'

import { useState } from 'react'
import { APIProvider, Map, AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps'

// Note: AdvancedMarker requires a mapId. Replace DEMO_MAP_ID with a real one from
// Google Cloud Console → Maps Platform → Map Management → Create Map ID
const MAP_ID = 'DEMO_MAP_ID'
const VANCOUVER = { lat: 49.2827, lng: -123.1207 }

export type PlacePin = {
  id: string
  name: string
  city: string | null
  lat: number
  lng: number
  avgRating: number | null
  topSlug: string | null
}

export function GoogleMap({ places }: { places: PlacePin[] }) {
  const [selected, setSelected] = useState<PlacePin | null>(null)

  const center = places.length > 0
    ? { lat: places[0].lat, lng: places[0].lng }
    : VANCOUVER

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!}>
      <Map
        mapId={MAP_ID}
        defaultCenter={center}
        defaultZoom={12}
        style={{ height: 500, borderRadius: 16, overflow: 'hidden' }}
        gestureHandling="cooperative"
        clickableIcons={false}
      >
        {places.map(place => (
          <AdvancedMarker
            key={place.id}
            position={{ lat: place.lat, lng: place.lng }}
            onClick={() => setSelected(place)}
          >
            <div
              style={{
                background: '#734e97',
                color: '#fff',
                borderRadius: '999px',
                padding: '4px 9px',
                fontSize: 12,
                fontWeight: 800,
                boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {place.avgRating ? `${place.avgRating.toFixed(1)}★` : '★'}
            </div>
          </AdvancedMarker>
        ))}

        {selected && (
          <InfoWindow
            position={{ lat: selected.lat, lng: selected.lng }}
            onCloseClick={() => setSelected(null)}
            pixelOffset={[0, -36]}
          >
            <div style={{ minWidth: 140, padding: '2px 4px' }}>
              <p style={{ fontWeight: 700, fontSize: 13, margin: 0 }}>{selected.name}</p>
              {selected.city && (
                <p style={{ fontSize: 11, color: '#666', margin: '2px 0 0' }}>{selected.city}</p>
              )}
              {selected.avgRating !== null && (
                <p style={{ fontSize: 12, fontWeight: 600, color: '#734e97', margin: '4px 0 0' }}>
                  {selected.avgRating.toFixed(1)}★
                </p>
              )}
              {selected.topSlug && (
                <a
                  href={`/r/${selected.topSlug}`}
                  style={{ fontSize: 12, color: '#734e97', fontWeight: 600, display: 'block', marginTop: 6 }}
                >
                  View review →
                </a>
              )}
            </div>
          </InfoWindow>
        )}
      </Map>
    </APIProvider>
  )
}
