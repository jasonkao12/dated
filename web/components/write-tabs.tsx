'use client'

import { useState } from 'react'
import { WriteForm } from '@/components/write-form'
import { DatePlanSelector } from '@/components/date-plan-selector'
import { DateReviewForm } from '@/components/date-review-form'

export type PlanStop = {
  id: string
  stop_order: number
  places: { id: string; name: string } | null
}

export type PlanOption = {
  id: string
  title: string
  slug: string
  status: 'saved' | 'planned' | 'completed'
  visited_on: string | null
  date_stops: PlanStop[]
}

type Tab = 'date' | 'venue'

export function WriteTabs({ plans }: { plans: PlanOption[] }) {
  const [tab, setTab] = useState<Tab>('date')
  const [selectedPlan, setSelectedPlan] = useState<PlanOption | null>(null)

  const tabClass = (t: Tab) =>
    `flex-1 py-2.5 text-sm font-bold rounded-xl transition-colors ${
      tab === t
        ? 'bg-primary text-primary-foreground shadow-sm'
        : 'text-muted-foreground hover:text-foreground'
    }`

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex gap-1 rounded-2xl border border-border bg-muted/40 p-1">
        <button type="button" className={tabClass('date')} onClick={() => setTab('date')}>
          🗓️ Review a Date
        </button>
        <button type="button" className={tabClass('venue')} onClick={() => setTab('venue')}>
          📍 Review a Venue
        </button>
      </div>

      {tab === 'date' && (
        selectedPlan
          ? <DateReviewForm plan={selectedPlan} onChangePlan={() => setSelectedPlan(null)} />
          : <DatePlanSelector plans={plans} onSelect={setSelectedPlan} />
      )}

      {tab === 'venue' && <WriteForm />}
    </div>
  )
}
