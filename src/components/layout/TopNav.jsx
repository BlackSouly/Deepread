import { Link } from 'react-router-dom'
import { IconBell, IconBook2 } from '@tabler/icons-react'

export function TopNav({ reviewCount }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[var(--color-border-tertiary)] bg-white/95 px-5 backdrop-blur">
      <Link to="/" className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-white">
          <IconBook2 size={19} />
        </span>
        <span className="font-serif text-[18px] font-medium text-brand-900">深读</span>
      </Link>
      <div className="flex items-center gap-3">
        <Link
          to="/review"
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-signal-orangeLight px-3 text-[12px] font-medium text-signal-orange"
        >
          <IconBell size={15} />
          待复习 {reviewCount}
        </Link>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-background-tertiary)] text-[12px] font-medium text-[var(--color-text-secondary)]">
          DS
        </div>
      </div>
    </header>
  )
}
