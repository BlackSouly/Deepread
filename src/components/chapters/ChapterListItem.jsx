import { Link } from 'react-router-dom'
import { IconCheck, IconEdit, IconRobot, IconStarFilled } from '@tabler/icons-react'
import { Badge } from '../common/Badge.jsx'

function statusLabel(status) {
  if (status === 'done') return '已完成'
  if (status === 'reading') return '阅读中'
  return '未开始'
}

export function ChapterListItem({ chapter, onEdit }) {
  const isDone = chapter.status === 'done'
  const isReading = chapter.status === 'reading'

  return (
    <div className="grid items-center gap-3 border-b border-[var(--color-border-tertiary)] px-1 py-3 last:border-b-0 md:grid-cols-[42px_1fr_auto]">
      <Link
        to={`/book/${chapter.bookId}/chapter/${chapter.id}`}
        className={`flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-medium ${
          isDone ? 'bg-brand-500 text-white' : isReading ? 'bg-brand-50 text-brand-900' : 'bg-[var(--color-background-tertiary)] text-[var(--color-text-secondary)]'
        }`}
      >
        {isDone ? <IconCheck size={15} /> : chapter.order}
      </Link>
      <Link to={`/book/${chapter.bookId}/chapter/${chapter.id}`} className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-[13px] font-medium">{chapter.title}</h3>
          {chapter.starRating ? <span className="text-[11px] text-signal-amber">{'★'.repeat(chapter.starRating)}</span> : null}
        </div>
        <p className="mt-1 text-[11px] text-[var(--color-text-tertiary)]">{chapter.sectionCount} 个小节 · {statusLabel(chapter.status)}</p>
      </Link>
      <div className="flex flex-wrap justify-start gap-2 md:justify-end">
        {chapter.importance === 'key' ? <Badge tone="purple"><IconStarFilled size={12} />重点章节</Badge> : null}
        {chapter.importanceSource === 'ai' ? <Badge tone="purple"><IconRobot size={12} />AI 建议重点</Badge> : null}
        {chapter.importance === 'ignored' ? <Badge tone="neutral">忽略章节</Badge> : null}
        <Badge tone={isDone ? 'done' : isReading ? 'blue' : 'neutral'}>{statusLabel(chapter.status)}</Badge>
        <button
          type="button"
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-background-tertiary)]"
          onClick={() => onEdit(chapter)}
          aria-label="编辑章节"
        >
          <IconEdit size={15} />
        </button>
      </div>
    </div>
  )
}
