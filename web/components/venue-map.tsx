'use client'

import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps'

const MAP_ID = 'DEMO_MAP_ID'

type Props = {
  lat: number
  lng: number
  name: string
}

export function VenueMap({ lat, lng, name }: Props) {
  const position = { lat, lng }

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!}>
      <Map
        mapId={MAP_ID}
        defaultCenter={position}
        defaultZoom={15}
        style={{ height: 220, borderRadius: 16, overflow: 'hidden' }}
        gestureHandling="none"
        disableDefaultUI
        clickableIcons={false}
      >
        <AdvancedMarker position={position} title={name}>
          <div
            style={{
              background: '#734e97',
              color: '#fff',
              borderRadius: '999px',
              padding: '5px 10px',
              fontSize: 12,
              fontWeight: 800,
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              whiteSpace: 'nowrap',
              maxWidth: 180,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            📍 {name}
          </div>
        </AdvancedMarker>
      </Map>
    </APIProvider>
  )
}
