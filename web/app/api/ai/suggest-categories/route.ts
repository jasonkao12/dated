import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'
import { logApiUsage } from '@/lib/usage'

const CATEGORIES = [
  'Restaurants', 'Cafes', 'Nature & Outdoors', 'Indoor Activities',
  'Arts & Culture', 'Games & Entertainment', 'Nightlife', 'Wellness',
  'Day Trip', 'Road Trip', 'Vacation', 'First Date', 'Anniversary',
  'Romantic', 'Budget-friendly', 'Experiences',
]

export async function POST(request: Request) {
  const { title, body, venue_name, venue_type } = await request.json()

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 })
  }

  const prompt = `You are categorizing a date review. Based on the review details below, pick the most relevant categories from the list.

Review title: ${title || '(none)'}
Venue: ${venue_name || '(none)'}
Venue type: ${venue_type || '(none)'}
Review body: ${body || '(none)'}

Available categories: ${CATEGORIES.join(', ')}

Return ONLY a JSON array of matching category names (1-4 categories). Example: ["Restaurants", "Anniversary"]
Return only the JSON array, no other text.`

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

  // Primary: gemini-3.1-flash-lite-preview — fastest and cheapest
  // Fallback: gemini-2.5-flash-lite — stable if preview is unavailable
  let text = ''
  let modelUsed = 'gemini-3.1-flash-lite-preview'
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' })
    const result = await model.generateContent(prompt)
    text = result.response.text().trim()
    const usage = result.response.usageMetadata
    await logApiUsage({
      service: 'gemini',
      endpoint: 'suggest-categories',
      tokens_in: usage?.promptTokenCount,
      tokens_out: usage?.candidatesTokenCount,
      cost_cents: usage ? ((usage.promptTokenCount ?? 0) / 1000 * 0.0075) + ((usage.candidatesTokenCount ?? 0) / 1000 * 0.03) : undefined,
    })
  } catch {
    modelUsed = 'gemini-2.5-flash-lite'
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' })
      const result = await model.generateContent(prompt)
      text = result.response.text().trim()
      const usage = result.response.usageMetadata
      await logApiUsage({
        service: 'gemini',
        endpoint: 'suggest-categories (fallback)',
        tokens_in: usage?.promptTokenCount,
        tokens_out: usage?.candidatesTokenCount,
        cost_cents: usage ? ((usage.promptTokenCount ?? 0) / 1000 * 0.0075) + ((usage.candidatesTokenCount ?? 0) / 1000 * 0.03) : undefined,
      })
    } catch {
      await logApiUsage({ service: 'gemini', endpoint: 'suggest-categories', status: 'error' })
      return NextResponse.json({ categories: [] })
    }
  }

  let suggested: string[] = []
  try {
    const parsed = JSON.parse(text)
    if (Array.isArray(parsed)) {
      suggested = parsed.filter((c: unknown) => typeof c === 'string' && CATEGORIES.includes(c))
    }
  } catch {
    // If parsing fails, return empty
  }

  return NextResponse.json({ categories: suggested })
}
