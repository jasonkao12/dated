'use client'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

type Props = {
  visitedDates: string[]   // array of "YYYY-MM-DD" strings
  year?: number
}

export function DateHeatmap({ visitedDates, year }: Props) {
  const targetYear = year ?? new Date().getFullYear()

  // Build count map
  const countMap: Record<string, number> = {}
  for (const d of visitedDates) {
    if (d.startsWith(String(targetYear))) {
      countMap[d] = (countMap[d] ?? 0) + 1
    }
  }

  // Build a 7-row grid for the full year (Jan 1 → Dec 31)
  const jan1 = new Date(targetYear, 0, 1)
  // Offset so col 0 = week containing Jan 1, starting Monday (0=Mon…6=Sun)
  const startDow = (jan1.getDay() + 6) % 7  // 0=Mon
  const totalDays = isLeapYear(targetYear) ? 366 : 365
  const totalCells = startDow + totalDays
  const numWeeks = Math.ceil(totalCells / 7)

  // monthOffsets: for each week column, which month label to show (if it's the first week of a new month)
  const monthLabels: { col: number; label: string }[] = []
  let lastMonth = -1

  const weeks: { date: string | null; count: number }[][] = []
  for (let w = 0; w < numWeeks; w++) {
    const week: { date: string | null; count: number }[] = []
    for (let d = 0; d < 7; d++) {
      const dayIndex = w * 7 + d - startDow
      if (dayIndex < 0 || dayIndex >= totalDays) {
        week.push({ date: null, count: 0 })
      } else {
        const date = new Date(targetYear, 0, dayIndex + 1)
        const iso = toISO(date)
        const month = date.getMonth()
        if (month !== lastMonth) {
          monthLabels.push({ col: w, label: MONTHS[month] })
          lastMonth = month
        }
        week.push({ date: iso, count: countMap[iso] ?? 0 })
      }
    }
    weeks.push(week)
  }

  const totalDatesLogged = visitedDates.filter(d => d.startsWith(String(targetYear))).length

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          {targetYear} date activity
        </p>
        <p className="text-xs text-muted-foreground">
          {totalDatesLogged} {totalDatesLogged === 1 ? 'date' : 'dates'} logged
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {/* Day labels */}
          <div className="flex flex-col gap-px pt-5">
            {[0,1,2,3,4,5,6].map(d => (
              <div key={d} className="h-3 w-7 flex items-center">
                <span className="text-[9px] text-muted-foreground">
                  {d === 0 ? 'Mon' : d === 2 ? 'Wed' : d === 4 ? 'Fri' : ''}
                </span>
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex flex-col gap-0">
            {/* Month labels row */}
            <div className="flex gap-px h-5">
              {weeks.map((_, w) => {
                const label = monthLabels.find(m => m.col === w)
                return (
                  <div key={w} className="w-3 flex items-center justify-start">
                    {label && (
                      <span className="text-[9px] text-muted-foreground leading-none">
                        {label.label}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Day rows */}
            {[0,1,2,3,4,5,6].map(dow => (
              <div key={dow} className="flex gap-px mb-px">
                {weeks.map((week, w) => {
                  const cell = week[dow]
                  if (!cell.date) {
                    return <div key={w} className="w-3 h-3 rounded-sm" />
                  }
                  const intensity = cell.count === 0 ? 0 : cell.count === 1 ? 1 : cell.count === 2 ? 2 : 3
                  const bg = intensity === 0
                    ? 'bg-muted/40 dark:bg-muted/20'
                    : intensity === 1
                    ? 'bg-primary/30'
                    : intensity === 2
                    ? 'bg-primary/60'
                    : 'bg-primary'
                  return (
                    <div
                      key={w}
                      className={`w-3 h-3 rounded-sm ${bg} transition-opacity`}
                      title={cell.count > 0 ? `${cell.date}: ${cell.count} date${cell.count > 1 ? 's' : ''}` : cell.date}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1.5 justify-end">
        <span className="text-[10px] text-muted-foreground">Less</span>
        {['bg-muted/40 dark:bg-muted/20','bg-primary/30','bg-primary/60','bg-primary'].map((bg, i) => (
          <div key={i} className={`w-3 h-3 rounded-sm ${bg}`} />
        ))}
        <span className="text-[10px] text-muted-foreground">More</span>
      </div>
    </div>
  )
}

function toISO(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function isLeapYear(year: number) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}
