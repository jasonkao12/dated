'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { deleteReview } from '@/app/actions/review'

export function ReviewOwnerActions({ reviewId, slug }: { reviewId: string; slug: string }) {
  const [confirming, setConfirming] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      await deleteReview(reviewId)
    })
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/r/${slug}/edit`}
        className="rounded-lg border border-border bg-card px-4 py-1.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
      >
        Edit
      </Link>

      {confirming ? (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Delete this review?</span>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="rounded-lg bg-destructive px-3 py-1.5 text-sm font-semibold text-white hover:bg-destructive/90 disabled:opacity-60 transition-colors"
          >
            {isPending ? 'Deleting…' : 'Yes, delete'}
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="rounded-lg border border-border px-3 py-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          className="rounded-lg border border-border bg-card px-4 py-1.5 text-sm font-semibold text-muted-foreground hover:text-destructive hover:border-destructive/50 transition-colors"
        >
          Delete
        </button>
      )}
    </div>
  )
}
