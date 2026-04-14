'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type Prefs = {
  email_comments: boolean
  email_reactions: boolean
  email_couple: boolean
  email_followers: boolean
}

const DEFAULTS: Prefs = {
  email_comments: true,
  email_reactions: true,
  email_couple: true,
  email_followers: true,
}

const LABELS: Record<keyof Prefs, { title: string; description: string }> = {
  email_comments: { title: 'Comments', description: 'When someone comments on your review' },
  email_reactions: { title: 'Reactions', description: 'When someone reacts to your review' },
  email_couple: { title: 'Couple links', description: 'When your partner links with you' },
  email_followers: { title: 'New followers', description: 'When someone starts following you' },
}

export function NotificationPreferences({ userId }: { userId: string }) {
  const supabase = createClient()
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('notification_preferences')
        .select('email_comments, email_reactions, email_couple, email_followers')
        .eq('user_id', userId)
        .maybeSingle()
      if (data) setPrefs(data as Prefs)
      setLoading(false)
    }
    load()
  }, [userId])

  async function toggle(key: keyof Prefs) {
    const updated = { ...prefs, [key]: !prefs[key] }
    setPrefs(updated)
    setSaving(true)
    await supabase
      .from('notification_preferences')
      .upsert({ user_id: userId, ...updated })
    setSaving(false)
  }

  if (loading) return <p className="text-sm text-muted-foreground">Loading...</p>

  return (
    <div className="space-y-1">
      {(Object.keys(LABELS) as (keyof Prefs)[]).map(key => (
        <label
          key={key}
          className="flex items-center justify-between rounded-xl px-4 py-3 hover:bg-secondary/50 transition-colors cursor-pointer"
        >
          <div>
            <p className="text-sm font-semibold text-foreground">{LABELS[key].title}</p>
            <p className="text-xs text-muted-foreground">{LABELS[key].description}</p>
          </div>
          <button
            onClick={() => toggle(key)}
            disabled={saving}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
              prefs[key] ? 'bg-primary' : 'bg-border'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                prefs[key] ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </label>
      ))}
    </div>
  )
}
