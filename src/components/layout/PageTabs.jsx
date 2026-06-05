export function PageTabs({ tabs, active }) {
  return (
    <div className="inline-flex rounded-full bg-[var(--color-background-tertiary)] p-1">
      {tabs.map((tab) => (
        <span
          key={tab.id}
          className={`rounded-full px-3 py-1.5 text-[12px] font-medium ${
            tab.id === active ? 'bg-white text-[var(--color-text-primary)] shadow-sm' : 'text-[var(--color-text-secondary)]'
          }`}
        >
          {tab.label}
        </span>
      ))}
    </div>
  )
}
