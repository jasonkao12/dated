'use client'

import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps'

const MAP_ID = 'DEMO_MAP_ID'

type Stop = {
  order: number
  verified_name?: string
  venue_name: string
  lat?: number | null
  lng?: number | null
}

export function RouteMap({ stops }: { stops: Stop[] }) {
  const located = stops.filter(s => s.lat && s.lng)
  if (located.length === 0) return null

  // Center on midpoint of all stops
  const avgLat = located.reduce((sum, s) => sum + s.lat!, 0) / located.length
  const avgLng = located.reduce((sum, s) => sum + s.lng!, 0) / located.length

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!}>
      <Map
        mapId={MAP_ID}
        defaultCenter={{ lat: avgLat, lng: avgLng }}
        defaultZoom={14}
        style={{ height: 280, borderRadius: 16, overflow: 'hidden' }}
        gestureHandling="cooperative"
        disableDefaultUI={false}
        clickableIcons={false}
      >
        {located.map((stop, i) => (
          <AdvancedMarker
            key={i}
            position={{ lat: stop.lat!, lng: stop.lng! }}
            title={stop.verified_name ?? stop.venue_name}
          >
            <div style={{
              background: '#734e97',
              color: '#fff',
              borderRadius: '999px',
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 800,
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              border: '2px solid white',
            }}>
              {stop.order}
            </div>
          </AdvancedMarker>
        ))}
      </Map>
    </APIProvider>
  )
}
