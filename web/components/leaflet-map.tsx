'use client'

import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'

type PlacePin = {
  id: string
  name: string
  city: string | null
  latitude: number
  longitude: number
  avgRating: number | null
  topSlug: string | null
}

export default function LeafletMap({ places }: { places: PlacePin[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    async function init() {
      const L = (await import('leaflet')).default

      // Fix default marker icon path issue with webpack
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      const center = places.length > 0
        ? [places[0].latitude, places[0].longitude] as [number, number]
        : [40.7128, -74.006] as [number, number]

      const map = L.map(containerRef.current!).setView(center, 12)
      mapRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      for (const place of places) {
        const popup = `
          <div style="font-family:sans-serif;min-width:140px">
            <p style="margin:0 0 4px;font-weight:800;font-size:14px">${place.name}</p>
            ${place.city ? `<p style="margin:0 0 4px;color:#666;font-size:12px">${place.city}</p>` : ''}
            ${place.avgRating !== null ? `<p style="margin:0 0 6px;font-size:13px;color:#734e97">★ ${place.avgRating.toFixed(1)}</p>` : ''}
            ${place.topSlug ? `<a href="/r/${place.topSlug}" style="font-size:12px;color:#734e97;font-weight:600">View review →</a>` : ''}
          </div>
        `
        L.marker([place.latitude, place.longitude])
          .addTo(map)
          .bindPopup(popup)
      }

      // Fit bounds if multiple places
      if (places.length > 1) {
        const bounds = L.latLngBounds(places.map(p => [p.latitude, p.longitude] as [number, number]))
        map.fitBounds(bounds, { padding: [40, 40] })
      }
    }

    init()

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  return <div ref={containerRef} className="h-[500px] rounded-2xl overflow-hidden border border-border z-0" />
}
