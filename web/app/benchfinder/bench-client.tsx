'use client'

import dynamic from 'next/dynamic'
import type { Bench } from '@/components/bench-map'

const BenchMap = dynamic(() => import('@/components/bench-map').then(m => m.BenchMap), { ssr: false })

export function BenchClient({ benches }: { benches: Bench[] }) {
  return <BenchMap benches={benches} />
}
