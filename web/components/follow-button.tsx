'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function FollowButton({ profileId }: { profileId: string }) {
  const supabase = createClient()
  const [following, setFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.id === profileId) { setLoading(false); return }
      setCurrentUserId(user.id)

      const { data } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', profileId)
        .maybeSingle()

      setFollowing(!!data)
      setLoading(false)
    }
    check()
  }, [profileId])

  async function toggle() {
    if (!currentUserId) return

    if (following) {
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', profileId)
      setFollowing(false)
    } else {
      await supabase
        .from('follows')
        .insert({ follower_id: currentUserId, following_id: profileId })
      setFollowing(true)

      // Notify the user being followed
      fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'new_follower', recipientId: profileId }),
      }).catch(() => {})
    }
  }

  // Don't show for own profile or when not logged in
  if (loading || !currentUserId) return null

  return (
    <button
      onClick={toggle}
      className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
        following
          ? 'bg-secondary text-foreground hover:bg-secondary/80'
          : 'bg-primary text-primary-foreground hover:bg-primary/90'
      }`}
    >
      {following ? 'Following' : 'Follow'}
    </button>
  )
}
