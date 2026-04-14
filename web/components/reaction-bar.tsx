'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
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
  reviewOwnerId: string
  counts: ReactionCounts
  isAuthenticated: boolean
}

export function ReactionBar({ reviewId, reviewOwnerId, counts, isAuthenticated }: ReactionBarProps) {
  const router = useRouter()
  const supabase = createClient()
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

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (wasActive) {
      // Remove reaction
      await supabase
        .from('reactions')
        .delete()
        .eq('review_id', reviewId)
        .eq('user_id', user.id)
        .eq('reaction_type', type)
    } else {
      // Remove previous reaction if switching
      if (active) {
        await supabase
          .from('reactions')
          .delete()
          .eq('review_id', reviewId)
          .eq('user_id', user.id)
          .eq('reaction_type', active)
      }
      // Insert new reaction
      await supabase
        .from('reactions')
        .upsert({ review_id: reviewId, user_id: user.id, reaction_type: type })

      // Notify review owner
      fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'reaction', recipientId: reviewOwnerId, reviewId }),
      }).catch(() => {})
    }
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
