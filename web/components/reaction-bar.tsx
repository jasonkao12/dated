'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { ReactionCounts, ReactionType } from '@/lib/types'

const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: 'heart',      emoji: '❤️',  label: 'Love it'     },
  { type: 'fire',       emoji: '🔥',  label: 'Hot spot'    },
  { type: 'want_to_go', emoji: '📍',  label: 'Want to go'  },
  { type: 'been_here',  emoji: '✅',  label: 'Been here'   },
]

type ReactionBarProps = {
  reviewId: string
  counts: ReactionCounts
  isAuthenticated: boolean
}

export function ReactionBar({ reviewId, counts, isAuthenticated }: ReactionBarProps) {
  const router = useRouter()
  const [localCounts, setLocalCounts] = useState(counts)
  const [active, setActive] = useState<ReactionType | null>(null)

  async function handleReaction(type: ReactionType) {
    if (!isAuthenticated) {
      router.push('/signup')
      return
    }

    const wasActive = active === type
    setActive(wasActive ? null : type)
    setLocalCounts(prev => ({
      ...prev,
      [type]: wasActive ? Math.max(0, prev[type] - 1) : prev[type] + 1,
      ...(wasActive ? {} : active ? { [active]: Math.max(0, prev[active] - 1) } : {}),
    }))
    // TODO: persist to Supabase once auth is wired up
  }

  return (
    <div className="flex flex-wrap gap-2">
      {REACTIONS.map(({ type, emoji, label }) => (
        <button
          key={type}
          onClick={() => handleReaction(type)}
          title={isAuthenticated ? label : 'Sign up to react'}
          className={cn(
            'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all',
            active === type
              ? 'border-primary bg-secondary text-primary'
              : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground'
          )}
        >
          <span>{emoji}</span>
          {localCounts[type] > 0 && (
            <span className="tabular-nums">{localCounts[type]}</span>
          )}
        </button>
      ))}
    </div>
  )
}
