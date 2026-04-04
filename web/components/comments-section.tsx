'use client'

import { useState, useEffect, useTransition, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

type Comment = {
  id: string
  body: string
  created_at: string
  user_id: string
  profiles: { username: string; display_name: string | null } | null
}

export function CommentsSection({
  reviewId,
  isAuthenticated,
}: {
  reviewId: string
  isAuthenticated: boolean
}) {
  const supabase = createClient()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [body, setBody] = useState('')
  const [submitting, startTransition] = useTransition()
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    async function load() {
      const [{ data }, { data: { user } }] = await Promise.all([
        supabase
          .from('comments')
          .select('id, body, created_at, user_id, profiles(username, display_name)')
          .eq('review_id', reviewId)
          .order('created_at', { ascending: true }),
        supabase.auth.getUser(),
      ])
      setComments((data ?? []) as unknown as Comment[])
      setCurrentUserId(user?.id ?? null)
      setLoading(false)
    }
    load()
  }, [reviewId])

  function handleSubmit() {
    if (!body.trim() || !currentUserId) return
    startTransition(async () => {
      const { data, error } = await supabase
        .from('comments')
        .insert({ review_id: reviewId, user_id: currentUserId, body: body.trim() })
        .select('id, body, created_at, user_id, profiles(username, display_name)')
        .single()
      if (!error && data) {
        setComments(prev => [...prev, data as unknown as Comment])
        setBody('')
      }
    })
  }

  async function handleDelete(commentId: string) {
    await supabase.from('comments').delete().eq('id', commentId)
    setComments(prev => prev.filter(c => c.id !== commentId))
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Comments {comments.length > 0 && `· ${comments.length}`}
      </h2>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {isAuthenticated ? 'Be the first to comment.' : 'No comments yet.'}
        </p>
      ) : (
        <div className="space-y-3">
          {comments.map(comment => {
            const author = comment.profiles
            const name = author?.display_name ?? author?.username ?? 'User'
            const initials = name.charAt(0).toUpperCase()
            const isOwn = comment.user_id === currentUserId
            const date = new Date(comment.created_at).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric',
            })
            return (
              <div key={comment.id} className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-foreground">{name}</span>
                    <span className="text-xs text-muted-foreground">{date}</span>
                    {isOwn && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="ml-auto text-xs text-muted-foreground hover:text-destructive transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-foreground leading-relaxed">{comment.body}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {isAuthenticated ? (
        <div className="flex gap-3">
          <textarea
            ref={textareaRef}
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Write a comment…"
            rows={2}
            maxLength={1000}
            className="flex-1 resize-none rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit()
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={!body.trim() || submitting}
            className="self-end rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            Post
          </button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          <a href="/login" className="text-primary font-semibold hover:underline">Sign in</a> to leave a comment.
        </p>
      )}
    </div>
  )
}
