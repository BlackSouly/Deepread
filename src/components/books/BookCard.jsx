import { Link } from 'react-router-dom'
import { IconBook2, IconChevronRight } from '@tabler/icons-react'
import { Badge } from '../common/Badge.jsx'
import { ProgressBar } from '../common/ProgressBar.jsx'
import { storage } from '../../services/storage.js'
import { getBookProgress, getBookStatus } from '../../utils/bookMetrics.js'

export function BookCard({ book }) {
  const chapters = storage.getChapters(book.id)
  const progress = getBookProgress(chapters)
  const status = getBookStatus(chapters)

  return (
    <Link to={`/book/${book.id}`} className="group block overflow-hidden rounded-xl border border-[var(--color-border-tertiary)] bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card">
      <div className="aspect-[4/5] overflow-hidden bg-brand-50">
        {book.coverImage ? (
          <img src={book.coverImage} alt={book.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full flex-col justify-between bg-[var(--color-background-secondary)] p-4 text-brand-900">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm">
              <IconBook2 size={20} />
            </div>
            <div>
              <div className="font-serif text-[20px] font-medium leading-7">{book.title}</div>
              <div className="mt-2 h-1 w-10 rounded-full bg-brand-500" />
            </div>
          </div>
        )}
      </div>
      <div className="p-4">
        <h2 className="line-clamp-2 font-serif text-[17px] font-medium leading-6 group-hover:text-brand-900">{book.title}</h2>
        <p className="mt-1 text-[12px] text-[var(--color-text-secondary)]">{book.author || '未填写作者'}</p>
        {book.importedFrom === 'weread' ? (
          <p className="mt-2 text-[11px] text-signal-blue">微信读书进度 {book.wereadProgress ?? 0}%</p>
        ) : null}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-[var(--color-text-secondary)]">
            <span>阅读进度</span>
            <span>{progress}%</span>
          </div>
          <ProgressBar value={progress} />
        </div>
        <div className="mt-4 flex items-center justify-between">
          <Badge tone={status === '已完成' ? 'done' : status === '阅读中' ? 'blue' : 'neutral'}>{status}</Badge>
          <span className="inline-flex items-center gap-1 text-[11px] text-[var(--color-text-tertiary)]">{chapters.length} 章 <IconChevronRight size={13} /></span>
        </div>
      </div>
    </Link>
  )
}
