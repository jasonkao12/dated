import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { logApiUsage } from '@/lib/usage'

// TODO: Sponsored placement — inject partner venues here before Places validation
// when a venue's type + neighbourhood matches a sponsor's criteria.
// See marketing/outreach/10-sponsored-placement.md for the model.

const VANCOUVER = { latitude: 49.2827, longitude: -123.1207 }

// --- Weather ---
const WEATHER_CODES: Record<number, string> = {
  0: 'clear skies', 1: 'mainly clear', 2: 'partly cloudy', 3: 'overcast',
  45: 'foggy', 48: 'foggy', 51: 'light drizzle', 53: 'drizzle', 55: 'heavy drizzle',
  61: 'light rain', 63: 'rain', 65: 'heavy rain',
  71: 'light snow', 73: 'snow', 75: 'heavy snow',
  80: 'rain showers', 81: 'rain showers', 82: 'heavy showers',
  95: 'thunderstorm',
}

async function getWeather() {
  try {
    const res = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=49.2827&longitude=-123.1207&current=temperature_2m,precipitation,weather_code&timezone=America%2FVancouver',
      { next: { revalidate: 1800 } } // cache 30 min
    )
    const data = await res.json()
    const code = data.current?.weather_code ?? 0
    const temp = Math.round(data.current?.temperature_2m ?? 12)
    const condition = WEATHER_CODES[code] ?? 'mild'
    const isRainy = [51,53,55,61,63,65,80,81,82,95].includes(code)
    return { temp, condition, isRainy }
  } catch {
    return { temp: 12, condition: 'mild', isRainy: false }
  }
}

// --- Places Text Search to validate a venue ---
async function findPlace(venueName: string, neighbourhood: string) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) return null

  const query = `${venueName} ${neighbourhood} Vancouver BC`
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.types,places.priceLevel',
    },
    body: JSON.stringify({
      textQuery: query,
      locationBias: { circle: { center: VANCOUVER, radius: 50000 } },
      maxResultCount: 1,
    }),
  })

  if (!res.ok) return null
  const data = await res.json()
  const place = data.places?.[0]
  if (!place) return null

  await logApiUsage({ service: 'google_places', endpoint: 'text-search', status: 'success', cost_cents: 3.2 })

  return {
    google_place_id: place.id,
    name: place.displayName?.text ?? venueName,
    address: place.formattedAddress ?? '',
    lat: place.location?.latitude ?? null,
    lng: place.location?.longitude ?? null,
  }
}

// --- Routes API: travel time between two points ---
async function getTravelMinutes(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): Promise<number | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY // Routes uses the same server key
  if (!apiKey) return null

  const res = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'routes.legs.duration',
    },
    body: JSON.stringify({
      origin: { location: { latLng: { latitude: from.lat, longitude: from.lng } } },
      destination: { location: { latLng: { latitude: to.lat, longitude: to.lng } } },
      travelMode: 'WALK',
    }),
  })

  if (!res.ok) return null
  const data = await res.json()
  const seconds = parseInt(data.routes?.[0]?.legs?.[0]?.duration ?? '0')
  return seconds ? Math.ceil(seconds / 60) : null
}

export async function POST(req: NextRequest) {
  const { budget, vibe, neighbourhood, type } = await req.json()

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'AI not configured' }, { status: 500 })
  }

  // 1. Weather
  const weather = await getWeather()

  // 2. Gemini — generate the date plan
  const prompt = `You are an expert Vancouver date night planner. Generate a specific, realistic date plan using real Vancouver venues.

Preferences:
- Budget: ${budget} per person
- Vibe: ${vibe}
- Neighbourhood preference: ${neighbourhood}
- Date type: ${type}
- Current weather: ${weather.temp}°C, ${weather.condition}
${weather.isRainy ? '- Note: It is rainy — prefer indoor venues or covered patios' : ''}

Return ONLY a valid JSON object with this exact structure (no markdown, no code fences):
{
  "title": "A short catchy name for this date (max 6 words)",
  "description": "One sentence that captures the vibe",
  "weather_note": "One line about how the weather affects the plan, or null",
  "stops": [
    {
      "order": 1,
      "venue_name": "Exact real venue name",
      "venue_type": "restaurant|bar|cafe|activity|experience|park",
      "neighbourhood": "Specific Vancouver neighbourhood",
      "duration_minutes": 90,
      "notes": "2-3 sentences: what to do, what to order, tips",
      "why_it_fits": "One sentence: why this fits the vibe and budget"
    }
  ],
  "total_duration_minutes": 180,
  "estimated_cost_per_person": "$X-Y"
}

Rules:
- Use 2-3 stops only
- All venues must be real, currently operating Vancouver businesses
- Stops should be geographically close to minimize travel
- Be specific: name dishes, drinks, or activities to try
- Respect the budget strictly
- Account for the weather (rain = indoor preference)
- Do NOT wrap in markdown or code fences — return raw JSON only`

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  let planText = ''

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' })
    const result = await model.generateContent(prompt)
    planText = result.response.text().trim()
    const usage = result.response.usageMetadata
    await logApiUsage({
      service: 'gemini',
      endpoint: 'choose-date',
      tokens_in: usage?.promptTokenCount,
      tokens_out: usage?.candidatesTokenCount,
      cost_cents: usage
        ? ((usage.promptTokenCount ?? 0) / 1000 * 0.0075) + ((usage.candidatesTokenCount ?? 0) / 1000 * 0.03)
        : undefined,
    })
  } catch {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' })
      const result = await model.generateContent(prompt)
      planText = result.response.text().trim()
    } catch {
      return NextResponse.json({ error: 'Failed to generate date plan' }, { status: 500 })
    }
  }

  // 3. Parse Gemini output
  let plan: any
  try {
    // Strip markdown fences if present despite instructions
    const cleaned = planText.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim()
    plan = JSON.parse(cleaned)
  } catch {
    return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
  }

  // 4. Validate each stop against Places API
  const validatedStops = await Promise.all(
    (plan.stops ?? []).map(async (stop: any) => {
      const found = await findPlace(stop.venue_name, stop.neighbourhood)
      return {
        ...stop,
        google_place_id: found?.google_place_id ?? null,
        verified_name: found?.name ?? stop.venue_name,
        address: found?.address ?? null,
        lat: found?.lat ?? null,
        lng: found?.lng ?? null,
        verified: !!found,
      }
    })
  )

  // 5. Routes API — travel times between consecutive stops
  for (let i = 0; i < validatedStops.length - 1; i++) {
    const from = validatedStops[i]
    const to = validatedStops[i + 1]
    if (from.lat && from.lng && to.lat && to.lng) {
      const mins = await getTravelMinutes(
        { lat: from.lat, lng: from.lng },
        { lat: to.lat, lng: to.lng }
      )
      validatedStops[i].travel_to_next_minutes = mins
    }
  }

  return NextResponse.json({
    plan: {
      ...plan,
      stops: validatedStops,
      weather: { temp: weather.temp, condition: weather.condition },
    },
  })
}
