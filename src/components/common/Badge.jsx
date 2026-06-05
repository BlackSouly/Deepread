export function Badge({ children, tone = 'neutral', className = '' }) {
  const tones = {
    neutral: 'bg-[var(--color-background-tertiary)] text-[var(--color-text-secondary)] border-[var(--color-border-secondary)]',
    done: 'bg-brand-50 text-brand-900 border-brand-200',
    warning: 'bg-signal-orangeLight text-signal-orange border-[#F5C4B3]',
    purple: 'bg-signal-purpleLight text-signal-purple border-[#CECBF6]',
    blue: 'bg-signal-blueLight text-signal-blue border-[#B5D4F4]',
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] leading-none ${tones[tone]} ${className}`}>
      {children}
    </span>
  )
}
