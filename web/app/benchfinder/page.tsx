import dynamic from 'next/dynamic'
import type { Bench } from '@/components/bench-map'

// No SiteHeader. No links. You found this yourself.
export const metadata = { title: 'Bench Finder 🪑', robots: 'noindex, nofollow' }

const BenchMap = dynamic(() => import('@/components/bench-map').then(m => m.BenchMap), { ssr: false })

const BENCHES: Bench[] = [
  {
    id: 'prospect-point',
    name: 'Prospect Point Overlook Bench',
    nickname: 'The Brooder',
    neighbourhood: 'Stanley Park',
    description: 'Perched above Lions Gate Bridge with a direct line to the North Shore mountains. Ideal for watching cruise ships, contemplating large decisions, or pretending you\'re in a movie.',
    lat: 49.3117,
    lng: -123.1416,
    ratings: [
      { label: 'Sunset view',       emoji: '🌅', score: 5 },
      { label: 'Wind factor',       emoji: '💨', score: 4 },
      { label: 'Crying potential',  emoji: '😢', score: 5 },
      { label: 'Snack proximity',   emoji: '🥐', score: 2 },
      { label: 'People watching',   emoji: '👀', score: 3 },
    ],
  },
  {
    id: 'english-bay',
    name: 'English Bay Sunset Bench',
    nickname: 'The Philosopher',
    neighbourhood: 'West End',
    description: 'Watch the sun melt into the Pacific while strangers walk dogs and eat ice cream. The bench equivalent of a deep breath. Often occupied by someone who has figured life out.',
    lat: 49.2858,
    lng: -123.1453,
    ratings: [
      { label: 'Sunset view',       emoji: '🌅', score: 5 },
      { label: 'Wind factor',       emoji: '💨', score: 3 },
      { label: 'Crying potential',  emoji: '😢', score: 3 },
      { label: 'Snack proximity',   emoji: '🥐', score: 5 },
      { label: 'People watching',   emoji: '👀', score: 5 },
    ],
  },
  {
    id: 'granville-island',
    name: 'Granville Island Dock Bench',
    nickname: 'The Romantic',
    neighbourhood: 'Granville Island',
    description: 'Wedged between bobbing boats and the smell of a nearby bakery. Best paired with something from the public market. The seagulls will try to ruin it — do not let them.',
    lat: 49.2721,
    lng: -123.1345,
    ratings: [
      { label: 'Sunset view',       emoji: '🌅', score: 3 },
      { label: 'Wind factor',       emoji: '💨', score: 2 },
      { label: 'Crying potential',  emoji: '😢', score: 2 },
      { label: 'Snack proximity',   emoji: '🥐', score: 5 },
      { label: 'People watching',   emoji: '👀', score: 4 },
    ],
  },
  {
    id: 'qe-park',
    name: 'Queen Elizabeth Park Summit Bench',
    nickname: 'The Garden Thinker',
    neighbourhood: 'Cambie',
    description: 'Perched at the highest point in Vancouver\'s park system with 360° views of gardens, city, and mountains. Squirrels here are bold. Do not make eye contact.',
    lat: 49.2417,
    lng: -123.1117,
    ratings: [
      { label: 'Sunset view',       emoji: '🌅', score: 4 },
      { label: 'Wind factor',       emoji: '💨', score: 2 },
      { label: 'Crying potential',  emoji: '😢', score: 2 },
      { label: 'Snack proximity',   emoji: '🥐', score: 2 },
      { label: 'People watching',   emoji: '👀', score: 3 },
    ],
  },
  {
    id: 'jericho-beach',
    name: 'Jericho Beach East Bench',
    nickname: 'The First Date',
    neighbourhood: 'Jericho',
    description: 'Far enough from downtown to feel intentional, close enough to bail gracefully. Guaranteed wind-messed hair, which somehow helps. The mountains across the water do the heavy lifting.',
    lat: 49.2753,
    lng: -123.1997,
    ratings: [
      { label: 'Sunset view',       emoji: '🌅', score: 4 },
      { label: 'Wind factor',       emoji: '💨', score: 5 },
      { label: 'Crying potential',  emoji: '😢', score: 3 },
      { label: 'Snack proximity',   emoji: '🥐', score: 2 },
      { label: 'People watching',   emoji: '👀', score: 3 },
    ],
  },
  {
    id: 'coal-harbour',
    name: 'Coal Harbour Seawall Bench',
    nickname: 'The Lunch Escape',
    neighbourhood: 'Coal Harbour',
    description: 'Seaplanes take off and land three times while you eat your sandwich. Mountains behind you, convention centre ahead, the gnawing sense that you should be back at your desk.',
    lat: 49.2889,
    lng: -123.1213,
    ratings: [
      { label: 'Sunset view',       emoji: '🌅', score: 3 },
      { label: 'Wind factor',       emoji: '💨', score: 2 },
      { label: 'Crying potential',  emoji: '😢', score: 2 },
      { label: 'Snack proximity',   emoji: '🥐', score: 4 },
      { label: 'People watching',   emoji: '👀', score: 5 },
    ],
  },
  {
    id: 'kits-beach',
    name: 'Kits Beach Mountain View Bench',
    nickname: 'The Local Legend',
    neighbourhood: 'Kitsilano',
    description: 'Volleyball to your right, mountains straight ahead, oat milk latte somewhere nearby. Frequented by people who have genuinely figured out work-life balance and would like you to know it.',
    lat: 49.2748,
    lng: -123.1532,
    ratings: [
      { label: 'Sunset view',       emoji: '🌅', score: 5 },
      { label: 'Wind factor',       emoji: '💨', score: 3 },
      { label: 'Crying potential',  emoji: '😢', score: 1 },
      { label: 'Snack proximity',   emoji: '🥐', score: 4 },
      { label: 'People watching',   emoji: '👀', score: 5 },
    ],
  },
  {
    id: 'spanish-banks',
    name: 'Spanish Banks West Bench',
    nickname: 'The Secret',
    neighbourhood: 'UBC',
    description: 'Somehow always empty despite being objectively perfect. Wide-open tidal flats, North Shore mountains, the full span of English Bay. The best bench in Vancouver. Tell no one.',
    lat: 49.2735,
    lng: -123.2102,
    ratings: [
      { label: 'Sunset view',       emoji: '🌅', score: 5 },
      { label: 'Wind factor',       emoji: '💨', score: 4 },
      { label: 'Crying potential',  emoji: '😢', score: 4 },
      { label: 'Snack proximity',   emoji: '🥐', score: 1 },
      { label: 'People watching',   emoji: '👀', score: 2 },
    ],
  },
  {
    id: 'sun-yat-sen',
    name: 'Dr. Sun Yat-Sen Garden Bench',
    nickname: 'The Scholar',
    neighbourhood: 'Chinatown',
    description: 'Ancient limestone, koi ponds, and the sound of water doing exactly what water should do. The only bench in Vancouver where you will genuinely feel your cortisol drop. Worth the entrance fee.',
    lat: 49.2799,
    lng: -123.1019,
    ratings: [
      { label: 'Sunset view',       emoji: '🌅', score: 2 },
      { label: 'Wind factor',       emoji: '💨', score: 1 },
      { label: 'Crying potential',  emoji: '😢', score: 2 },
      { label: 'Snack proximity',   emoji: '🥐', score: 3 },
      { label: 'People watching',   emoji: '👀', score: 3 },
    ],
  },
  {
    id: 'trout-lake',
    name: 'Trout Lake Park Bench',
    nickname: 'The Sunday Ritual',
    neighbourhood: 'East Vancouver',
    description: 'Ducks, dogs in sweaters, kids on scooters, and the distinct feeling that this is what a good day looks like. The neighbourhood comes here to exhale. You should too.',
    lat: 49.2561,
    lng: -123.0642,
    ratings: [
      { label: 'Sunset view',       emoji: '🌅', score: 2 },
      { label: 'Wind factor',       emoji: '💨', score: 1 },
      { label: 'Crying potential',  emoji: '😢', score: 1 },
      { label: 'Snack proximity',   emoji: '🥐', score: 3 },
      { label: 'People watching',   emoji: '👀', score: 4 },
    ],
  },
  {
    id: 'wreck-beach-top',
    name: 'Wreck Beach Trail Top Bench',
    nickname: 'The Decision Maker',
    neighbourhood: 'UBC',
    description: 'Sit here before deciding whether to descend the 473 stairs. The bench exists specifically for this moment of negotiation between your ambitions and your knees. The answer is yes. Go.',
    lat: 49.2638,
    lng: -123.2551,
    ratings: [
      { label: 'Sunset view',       emoji: '🌅', score: 4 },
      { label: 'Wind factor',       emoji: '💨', score: 3 },
      { label: 'Crying potential',  emoji: '😢', score: 3 },
      { label: 'Snack proximity',   emoji: '🥐', score: 1 },
      { label: 'People watching',   emoji: '👀', score: 4 },
    ],
  },
  {
    id: 'douglas-park',
    name: 'Douglas Park Corner Bench',
    nickname: 'The Neighbourhood Watch',
    neighbourhood: 'Mount Pleasant',
    description: 'Where locals read novels, half-watch their dogs, and quietly judge joggers\' form. No view to speak of, but a deep sense of belonging to somewhere specific. Underrated.',
    lat: 49.2530,
    lng: -123.1025,
    ratings: [
      { label: 'Sunset view',       emoji: '🌅', score: 1 },
      { label: 'Wind factor',       emoji: '💨', score: 1 },
      { label: 'Crying potential',  emoji: '😢', score: 1 },
      { label: 'Snack proximity',   emoji: '🥐', score: 4 },
      { label: 'People watching',   emoji: '👀', score: 5 },
    ],
  },
]

export default function BenchFinderPage() {
  return (
    <div className="min-h-screen bg-amber-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-4xl px-4 py-10 space-y-8">

        {/* Header */}
        <div className="text-center space-y-2">
          <p className="text-5xl">🪑</p>
          <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Bench Finder
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-sm mx-auto">
            Vancouver&apos;s finest sitting establishments, ranked by what actually matters.
          </p>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-600 font-medium uppercase tracking-widest pt-1">
            {BENCHES.length} verified benches · Click one to begin
          </p>
        </div>

        {/* Map */}
        <div className="rounded-2xl overflow-hidden shadow-lg ring-1 ring-zinc-200 dark:ring-zinc-800">
          <BenchMap benches={BENCHES} />
        </div>

        {/* Bench list */}
        <div className="space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
            The registry
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {BENCHES.map(bench => (
              <div
                key={bench.id}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-2"
              >
                <div>
                  <p className="font-bold text-zinc-900 dark:text-zinc-100 text-sm leading-tight">
                    {bench.name}
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
                    &ldquo;{bench.nickname}&rdquo; · {bench.neighbourhood}
                  </p>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2">
                  {bench.description}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
                  {bench.ratings.map(r => (
                    <div key={r.label} className="flex items-center gap-1">
                      <span className="text-[11px] text-zinc-400">{r.emoji}</span>
                      <Stars score={r.score} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-zinc-300 dark:text-zinc-700 pb-4">
          You found this. That means something. Probably.
        </p>
      </div>
    </div>
  )
}

function Stars({ score }: { score: number }) {
  return (
    <span className="text-amber-400 text-[11px] tracking-tighter">
      {'★'.repeat(score)}{'☆'.repeat(5 - score)}
    </span>
  )
}
