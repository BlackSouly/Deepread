export function ProgressBar({ value }) {
  const width = `${Math.max(0, Math.min(100, value))}%`
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-background-tertiary)] shadow-inner">
      <div className="h-full rounded-full bg-brand-500 transition-all duration-300" style={{ width }} />
    </div>
  )
}
