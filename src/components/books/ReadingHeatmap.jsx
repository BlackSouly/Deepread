function startOfDay(date) {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  return result
}

function intensityFor(minutes) {
  if (minutes === 0) return 'bg-[var(--color-background-tertiary)]'
  if (minutes < 15) return 'bg-brand-50'
  if (minutes < 30) return 'bg-brand-200'
  if (minutes < 60) return 'bg-[#5DCAA5]'
  return 'bg-brand-500'
}

export function ReadingHeatmap({ logs }) {
  const today = startOfDay(new Date())
  const days = Array.from({ length: 28 }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (27 - index))
    const minutes = logs
      .filter((log) => startOfDay(new Date(log.createdAt)).getTime() === date.getTime())
      .reduce((sum, log) => sum + log.minutes, 0)
    return { date, minutes }
  })

  return (
    <section className="rounded-xl border border-[var(--color-border-tertiary)] bg-white p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[13px] font-medium">阅读活跃度</h2>
        <span className="text-[11px] text-[var(--color-text-tertiary)]">近 28 天</span>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => (
          <div
            key={day.date.toISOString()}
            title={`${day.date.toLocaleDateString()} · ${day.minutes} 分钟`}
            className={`aspect-square rounded-md border border-white ${intensityFor(day.minutes)}`}
          />
        ))}
      </div>
      <div className="mt-3 flex items-center justify-end gap-1 text-[10px] text-[var(--color-text-tertiary)]">
        <span>少</span>
        <span className="h-3 w-3 rounded-sm bg-[var(--color-background-tertiary)]" />
        <span className="h-3 w-3 rounded-sm bg-brand-50" />
        <span className="h-3 w-3 rounded-sm bg-brand-200" />
        <span className="h-3 w-3 rounded-sm bg-[#5DCAA5]" />
        <span className="h-3 w-3 rounded-sm bg-brand-500" />
        <span>多</span>
      </div>
    </section>
  )
}
