type Badge = {
  id: string
  emoji: string
  label: string
  description: string
  earned: boolean
  tier: 'bronze' | 'silver' | 'gold'
}

type ReviewData = {
  rating_overall: number | null
  body: string | null
  places: { city: string | null } | null
  visited_on: string | null
}

export function computeAchievements(reviews: ReviewData[]): Badge[] {
  const count = reviews.length
  const cities = new Set(reviews.map(r => r.places?.city).filter(Boolean))
  const highRated = reviews.filter(r => r.rating_overall !== null && r.rating_overall >= 4).length
  const withStory = reviews.filter(r => r.body && r.body.length >= 100).length
  const datesWithVisited = reviews.filter(r => r.visited_on).length
  const years = new Set(reviews.map(r => r.visited_on?.slice(0, 4)).filter(Boolean))

  return [
    {
      id: 'explorer',
      emoji: '🌱',
      label: 'Explorer',
      description: 'Log your first date',
      earned: count >= 1,
      tier: 'bronze',
    },
    {
      id: 'regular',
      emoji: '🗓️',
      label: 'Regular',
      description: 'Log 10 dates',
      earned: count >= 10,
      tier: 'silver',
    },
    {
      id: 'local_legend',
      emoji: '🏆',
      label: 'Local Legend',
      description: 'Log 50 dates',
      earned: count >= 50,
      tier: 'gold',
    },
    {
      id: 'city_hopper',
      emoji: '✈️',
      label: 'City Hopper',
      description: 'Visit 3+ different cities',
      earned: cities.size >= 3,
      tier: 'silver',
    },
    {
      id: 'globetrotter',
      emoji: '🌍',
      label: 'Globetrotter',
      description: 'Visit 10+ different cities',
      earned: cities.size >= 10,
      tier: 'gold',
    },
    {
      id: 'critic',
      emoji: '⭐',
      label: 'Date Critic',
      description: 'Rate 5 dates 4 stars or above',
      earned: highRated >= 5,
      tier: 'silver',
    },
    {
      id: 'storyteller',
      emoji: '📖',
      label: 'Storyteller',
      description: 'Write detailed reviews for 5 dates',
      earned: withStory >= 5,
      tier: 'bronze',
    },
    {
      id: 'consistent',
      emoji: '💑',
      label: 'Date Night',
      description: 'Log dates across 2+ years',
      earned: years.size >= 2,
      tier: 'silver',
    },
    {
      id: 'documented',
      emoji: '📍',
      label: 'Documented',
      description: 'Log 5 dates with visit dates',
      earned: datesWithVisited >= 5,
      tier: 'bronze',
    },
  ]
}

export function AchievementBadges({ reviews }: { reviews: ReviewData[] }) {
  const badges = computeAchievements(reviews)
  const earned = badges.filter(b => b.earned)
  const locked = badges.filter(b => !b.earned)

  return (
    <div className="space-y-3">
      {earned.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {earned.map(badge => (
            <div
              key={badge.id}
              className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5"
              title={badge.description}
            >
              <span className="text-base">{badge.emoji}</span>
              <span className="text-xs font-semibold text-foreground">{badge.label}</span>
            </div>
          ))}
        </div>
      )}
      {locked.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {locked.map(badge => (
            <div
              key={badge.id}
              className="flex items-center gap-1.5 rounded-full border border-dashed border-border bg-transparent px-3 py-1.5 opacity-40"
              title={badge.description}
            >
              <span className="text-base grayscale">{badge.emoji}</span>
              <span className="text-xs font-semibold text-muted-foreground">{badge.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
