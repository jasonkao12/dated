export type Profile = {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
}

export type Place = {
  id: string
  name: string
  address: string | null
  city: string | null
  country: string | null
  place_type: string | null
  price_level: number | null
  website: string | null
}

export type DateTag = {
  id: string
  label: string
  emoji: string | null
}

export type ReviewPhoto = {
  id: string
  storage_path: string
  alt_text: string | null
  sort_order: number
}

export type ReactionType = 'heart' | 'fire' | 'want_to_go' | 'been_here'

export type ReactionCounts = Record<ReactionType, number>

export type Review = {
  id: string
  slug: string
  title: string
  body: string | null
  visited_on: string | null
  rating_overall: number | null
  rating_ambiance: number | null
  rating_food: number | null
  rating_service: number | null
  rating_value: number | null
  rating_vibe: number | null
  is_public: boolean
  view_count: number
  created_at: string
  profiles: Profile
  places: Place | null
  review_photos: ReviewPhoto[]
  review_tags: { date_tags: DateTag }[]
  reaction_counts: ReactionCounts
}
