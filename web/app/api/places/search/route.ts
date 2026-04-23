import { NextRequest, NextResponse } from 'next/server'
import { logApiUsage } from '@/lib/usage'

// Vancouver city centre bias
const VANCOUVER_LAT = 49.2827
const VANCOUVER_LNG = -123.1207

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q')?.trim()
  if (!query || query.length < 2) return NextResponse.json({ suggestions: [] })

  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'Places API not configured' }, { status: 500 })

  const start = Date.now()

  const res = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
    },
    body: JSON.stringify({
      input: query,
      locationBias: {
        circle: {
          center: { latitude: VANCOUVER_LAT, longitude: VANCOUVER_LNG },
          radius: 50000, // 50km max allowed by Places API (New)
        },
      },
      // Max 5 types allowed by Places API (New)
      includedPrimaryTypes: [
        'restaurant', 'bar', 'cafe', 'tourist_attraction', 'establishment',
      ],
    }),
  })

  const duration = Date.now() - start

  if (!res.ok) {
    const err = await res.text()
    await logApiUsage({ service: 'google_places', endpoint: 'autocomplete', status: 'error', metadata: { error: err } })
    return NextResponse.json({ error: 'Places API error', detail: err }, { status: 502 })
  }

  const data = await res.json()
  await logApiUsage({
    service: 'google_places',
    endpoint: 'autocomplete',
    status: 'success',
    cost_cents: 0.283, // ~$0.00283 per autocomplete request (Places API New pricing)
    metadata: { query, results: data.suggestions?.length ?? 0, duration_ms: duration },
  })

  const suggestions = (data.suggestions ?? []).map((s: any) => ({
    placeId: s.placePrediction?.placeId,
    name: s.placePrediction?.structuredFormat?.mainText?.text ?? '',
    secondary: s.placePrediction?.structuredFormat?.secondaryText?.text ?? '',
  })).filter((s: any) => s.placeId && s.name)

  return NextResponse.json({ suggestions })
}
