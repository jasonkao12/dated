'use client'

import { useState } from 'react'

type RatingInputProps = {
  name: string
  label: string
  required?: boolean
}

export function RatingInput({ name, label, required }: RatingInputProps) {
  const [value, setValue] = useState<number | null>(null)
  const [hovered, setHovered] = useState<number | null>(null)

  const display = hovered ?? value

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-foreground">
        {label}
        {!required && (
          <span className="ml-1 text-xs font-normal text-muted-foreground">(optional)</span>
        )}
      </label>
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => {
          const starValue = i + 1
          const filled = display !== null && starValue <= display
          return (
            <button
              key={i}
              type="button"
              aria-label={`Rate ${starValue} star${starValue !== 1 ? 's' : ''}`}
              className={
                'text-2xl leading-none transition-colors focus:outline-none ' +
                (filled ? 'text-primary' : 'text-muted-foreground/30 hover:text-primary/60')
              }
              onMouseEnter={() => setHovered(starValue)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setValue(starValue === value ? null : starValue)}
            >
              ★
            </button>
          )
        })}
        {value !== null && (
          <span className="ml-2 text-sm text-muted-foreground tabular-nums">{value}/5</span>
        )}
      </div>
      <input type="hidden" name={name} value={value ?? ''} />
    </div>
  )
}
