import { NextRequest, NextResponse } from 'next/server'
import { logApiUsage } from '@/lib/usage'

const FIELD_MASK = [
  'id',
  'displayName',
  'formattedAddress',
  'addressComponents',
  'location',
  'types',
  'websiteUri',
  'regularOpeningHours',
  'priceLevel',
  'nationalPhoneNumber',
].join(',')

function extractCity(components: any[]): string {
  if (!components) return ''
  const locality = components.find((c: any) => c.types?.includes('locality'))
  const province = components.find((c: any) => c.types?.includes('administrative_area_level_1'))
  if (locality && province) return `${locality.longText}, ${province.shortText}`
  if (locality) return locality.longText ?? ''
  return ''
}

function mapPriceLevel(level: string | undefined): number | null {
  // Google Places API (New) returns string enum
  const map: Record<string, number> = {
    PRICE_LEVEL_FREE: 0,
    PRICE_LEVEL_INEXPENSIVE: 1,
    PRICE_LEVEL_MODERATE: 2,
    PRICE_LEVEL_EXPENSIVE: 3,
    PRICE_LEVEL_VERY_EXPENSIVE: 4,
  }
  return level ? (map[level] ?? null) : null
}

export async function GET(req: NextRequest) {
  const placeId = req.nextUrl.searchParams.get('placeId')?.trim()
  if (!placeId) return NextResponse.json({ error: 'placeId required' }, { status: 400 })

  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'Places API not configured' }, { status: 500 })

  const start = Date.now()

  const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
    headers: {
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': FIELD_MASK,
    },
  })

  const duration = Date.now() - start

  if (!res.ok) {
    const err = await res.text()
    await logApiUsage({ service: 'google_places', endpoint: 'details', status: 'error', metadata: { error: err } })
    return NextResponse.json({ error: 'Places API error' }, { status: 502 })
  }

  const p = await res.json()
  await logApiUsage({
    service: 'google_places',
    endpoint: 'details',
    status: 'success',
    cost_cents: 1.7, // $0.017 per Place Details request
    metadata: { placeId, duration_ms: duration },
  })

  const place = {
    googlePlaceId: p.id,
    name: p.displayName?.text ?? '',
    address: p.formattedAddress ?? '',
    city: extractCity(p.addressComponents ?? []),
    lat: p.location?.latitude ?? null,
    lng: p.location?.longitude ?? null,
    website: p.websiteUri ?? null,
    phone: p.nationalPhoneNumber ?? null,
    priceLevel: mapPriceLevel(p.priceLevel),
    types: p.types ?? [],
    hours: p.regularOpeningHours ?? null,
  }

  return NextResponse.json({ place })
}
