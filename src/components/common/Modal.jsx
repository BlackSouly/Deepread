import { IconX } from '@tabler/icons-react'

export function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-sm">
      <div className="max-h-[88vh] w-full max-w-2xl overflow-auto rounded-xl border border-white/80 bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-[var(--color-border-tertiary)] bg-[var(--color-background-secondary)] px-5 py-4">
          <div>
            <h2 className="font-serif text-[18px] font-medium">{title}</h2>
            <p className="mt-1 text-[11px] text-[var(--color-text-tertiary)]">更改会写入本地阅读数据。</p>
          </div>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition hover:bg-[var(--color-background-tertiary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200 focus-visible:ring-offset-2 active:translate-y-px"
            onClick={onClose}
            aria-label="关闭"
          >
            <IconX size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
