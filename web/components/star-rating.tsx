import { cn } from '@/lib/utils'

type StarRatingProps = {
  value: number | null
  max?: number
  size?: 'sm' | 'md' | 'lg'
  showNumber?: boolean
}

export function StarRating({ value, max = 5, size = 'md', showNumber = false }: StarRatingProps) {
  if (value === null) return null

  const sizes = { sm: 'text-sm', md: 'text-base', lg: 'text-xl' }
  const filled = Math.round(value)

  return (
    <span className={cn('inline-flex items-center gap-1', sizes[size])}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={i < filled ? 'text-primary' : 'text-muted-foreground/30'}>
          ★
        </span>
      ))}
      {showNumber && (
        <span className="ml-1 font-semibold tabular-nums text-foreground">{value.toFixed(1)}</span>
      )}
    </span>
  )
}
