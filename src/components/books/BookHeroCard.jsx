import { Link } from 'react-router-dom'
import { IconBook2, IconChecklist, IconFlag, IconPlayerPlay } from '@tabler/icons-react'
import { Badge } from '../common/Badge.jsx'
import { Button } from '../common/Button.jsx'
import { ProgressBar } from '../common/ProgressBar.jsx'
import { getBookChapterStats, getNextChapter } from '../../utils/bookMetrics.js'

export function BookHeroCard({ book, chapters }) {
  const chapterStats = getBookChapterStats(chapters)
  const progress = chapterStats.progress
  const nextChapter = getNextChapter(chapters)

  return (
    <section className="overflow-hidden rounded-xl border border-[var(--color-border-tertiary)] bg-white shadow-card">
      <div className="grid gap-5 border-b border-[var(--color-border-tertiary)] bg-[var(--color-background-secondary)] p-5 lg:grid-cols-[132px_1fr_auto]">
        <div className="aspect-[4/5] overflow-hidden rounded-xl bg-brand-50 shadow-sm">
          {book.coverImage ? (
            <img src={book.coverImage} alt={book.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full flex-col justify-between bg-white p-4 text-brand-900">
              <IconBook2 size={28} />
              <div>
                <div className="font-serif text-[18px] font-medium leading-6">{book.title}</div>
                <div className="mt-2 h-1 w-10 rounded-full bg-brand-500" />
              </div>
            </div>
          )}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--color-text-tertiary)]">
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 shadow-sm"><IconBook2 size={13} />书籍总览</span>
            <Badge tone="neutral">{book.type}</Badge>
          </div>
          <h1 className="mt-2 font-serif text-[24px] font-medium leading-tight">{book.title}</h1>
          <p className="mt-1 text-[13px] text-[var(--color-text-secondary)]">{book.author || '未填写作者'}</p>
          <div className="mt-4 max-w-xl">
            <div className="mb-2 flex items-center justify-between text-[12px] text-[var(--color-text-secondary)]">
              <span>当前进度</span>
              <span>{progress}% · {chapterStats.requiredDone}/{chapterStats.requiredTotal} 章</span>
            </div>
            <ProgressBar value={progress} />
          </div>
        </div>
        <div className="flex items-start gap-2 lg:flex-col">
          {nextChapter ? (
            <Link to={`/book/${book.id}/chapter/${nextChapter.id}`}>
              <Button className="w-full">
                <IconPlayerPlay size={16} />
                继续阅读
              </Button>
            </Link>
          ) : null}
          {nextChapter ? (
            <Link to={`/book/${book.id}/chapter/${nextChapter.id}/summary`}>
              <Button variant="secondary" className="w-full">
                <IconChecklist size={16} />
                查看总结
              </Button>
            </Link>
          ) : null}
        </div>
      </div>
      <div className="grid gap-3 p-5 lg:grid-cols-[1fr_260px]">
        <div className="rounded-lg border-l-2 border-brand-500 bg-[var(--color-background-primary)] px-3 py-2">
          <div className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--color-text-tertiary)]"><IconFlag size={13} />阅读目的</div>
          <p className="mt-1 text-[13px] leading-6 text-[var(--color-text-secondary)]">{book.purpose}</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-[var(--color-text-secondary)] lg:grid-cols-1 lg:text-left">
          <div className="rounded-lg border border-[var(--color-border-tertiary)] bg-white px-3 py-2">
            <div className="text-[16px] font-medium text-[var(--color-text-primary)]">{chapterStats.total}</div>
            <div>总章节</div>
          </div>
          <div className="rounded-lg border border-[var(--color-border-tertiary)] bg-white px-3 py-2">
            <div className="text-[16px] font-medium text-[var(--color-text-primary)]">{chapterStats.keyTotal}</div>
            <div>重点章节</div>
          </div>
          <div className="rounded-lg border border-[var(--color-border-tertiary)] bg-white px-3 py-2">
            <div className="text-[16px] font-medium text-[var(--color-text-primary)]">{chapterStats.requiredReading}</div>
            <div>阅读中</div>
          </div>
        </div>
      </div>
    </section>
  )
}
