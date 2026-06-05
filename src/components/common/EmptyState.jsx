export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-dashed border-[var(--color-border-secondary)] bg-white px-8 text-center shadow-sm">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-brand-200 bg-brand-50 text-brand-900 shadow-sm">{icon}</div>
      <h2 className="font-serif text-[20px] font-medium">{title}</h2>
      <p className="mt-2 max-w-md text-[13px] leading-6 text-[var(--color-text-secondary)]">{description}</p>
      <div className="mt-5">{action}</div>
    </div>
  )
}
