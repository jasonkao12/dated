'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

type Notification = {
  id: string
  type: string
  body: string | null
  read: boolean
  created_at: string
  actor: { username: string; display_name: string | null } | null
}

const TYPE_LABEL: Record<string, string> = {
  comment: 'commented on your review',
  reaction: 'reacted to your review',
  couple_accepted: 'linked with you',
  new_follower: 'started following you',
}

export function NotificationBell() {
  const supabase = createClient()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('notifications')
        .select('id, type, body, read, created_at, actor:profiles!actor_id(username, display_name)')
        .order('created_at', { ascending: false })
        .limit(20)

      const items = (data ?? []) as unknown as Notification[]
      setNotifications(items)
      setUnreadCount(items.filter(n => !n.read).length)
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function markAllRead() {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id)
    if (unreadIds.length === 0) return
    await supabase.from('notifications').update({ read: true }).in('id', unreadIds)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  function handleToggle() {
    const wasOpen = open
    setOpen(!wasOpen)
    if (!wasOpen) markAllRead()
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'now'
    if (mins < 60) return `${mins}m`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h`
    const days = Math.floor(hrs / 24)
    return `${days}d`
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleToggle}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors relative"
        aria-label="Notifications"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 rounded-xl border border-border bg-card shadow-lg overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold text-foreground">Notifications</p>
            <a href="/settings/notifications" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Settings
            </a>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <p className="px-4 py-6 text-sm text-muted-foreground text-center">Loading...</p>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted-foreground text-center">No notifications yet</p>
            ) : (
              notifications.map(n => {
                const actorName = n.actor?.display_name ?? n.actor?.username ?? 'Someone'
                return (
                  <div
                    key={n.id}
                    className={cn(
                      'flex gap-3 px-4 py-3 border-b border-border last:border-0 transition-colors',
                      !n.read && 'bg-primary/5'
                    )}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-foreground">
                      {actorName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">
                        <span className="font-semibold">{actorName}</span>{' '}
                        {TYPE_LABEL[n.type] ?? n.type}
                      </p>
                      {n.body && n.type === 'comment' && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">"{n.body}"</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(n.created_at)}</p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
