'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { publishReviewDraft, deleteReviewDraft, publishPlanDraft, deletePlanDraft } from '@/app/actions/drafts'

export type DraftReview = {
  id: string
  slug: string
  title: string
  rating_overall: number | null
  created_at: string
}

export type DraftPlan = {
  id: string
  slug: string
  title: string
  status: string
  created_at: string
  date_stops: { count: number }[]
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function ActionButtons({
  onPublish,
  onDelete,
  editHref,
  pending,
}: {
  onPublish: () => void
  onDelete: () => void
  editHref: string
  pending: boolean
}) {
  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <Link
        href={editHref}
        className="rounded-lg border border-border px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        Edit
      </Link>
      <button
        type="button"
        onClick={onPublish}
        disabled={pending}
        className="rounded-lg bg-primary/10 border border-primary/30 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
      >
        Publish
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={pending}
        className="rounded-lg border border-destructive/30 px-2.5 py-1 text-xs font-semibold text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  )
}

export function DraftsSection({
  reviews: initialReviews,
  plans: initialPlans,
}: {
  reviews: DraftReview[]
  plans: DraftPlan[]
}) {
  const [reviews, setReviews] = useState(initialReviews)
  const [plans, setPlans]     = useState(initialPlans)
  const [isPending, startTransition] = useTransition()

  if (reviews.length === 0 && plans.length === 0) return null

  function handlePublishReview(id: string) {
    startTransition(async () => {
      await publishReviewDraft(id)
      setReviews(prev => prev.filter(r => r.id !== id))
    })
  }
  function handleDeleteReview(id: string) {
    startTransition(async () => {
      await deleteReviewDraft(id)
      setReviews(prev => prev.filter(r => r.id !== id))
    })
  }
  function handlePublishPlan(id: string) {
    startTransition(async () => {
      await publishPlanDraft(id)
      setPlans(prev => prev.filter(p => p.id !== id))
    })
  }
  function handleDeletePlan(id: string) {
    startTransition(async () => {
      await deletePlanDraft(id)
      setPlans(prev => prev.filter(p => p.id !== id))
    })
  }

  return (
    <section className="space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-1">
        Drafts
      </h2>

      <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">

        {/* Draft reviews */}
        {reviews.map(r => (
          <div key={r.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                  Review
                </span>
                <p className="text-sm font-semibold text-foreground truncate">{r.title}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{formatDate(r.created_at)}</p>
            </div>
            <ActionButtons
              editHref={`/r/${r.slug}/edit`}
              onPublish={() => handlePublishReview(r.id)}
              onDelete={() => handleDeleteReview(r.id)}
              pending={isPending}
            />
          </div>
        ))}

        {/* Draft plans */}
        {plans.map(p => {
          const stopCount = p.date_stops?.[0]?.count ?? 0
          return (
            <div key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                    Plan
                  </span>
                  <p className="text-sm font-semibold text-foreground truncate">{p.title}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {stopCount} {stopCount === 1 ? 'stop' : 'stops'} · {formatDate(p.created_at)}
                </p>
              </div>
              <ActionButtons
                editHref={`/date-builder/${p.slug}/edit`}
                onPublish={() => handlePublishPlan(p.id)}
                onDelete={() => handleDeletePlan(p.id)}
                pending={isPending}
              />
            </div>
          )
        })}
      </div>
    </section>
  )
}
