import { useState } from 'react'
import { Link } from 'react-router-dom'
import { IconCalendarDue, IconCards, IconClock, IconInbox, IconPlayerPlay, IconRepeat, IconRoute } from '@tabler/icons-react'
import { storage } from '../services/storage.js'
import { Button } from '../components/common/Button.jsx'
import { Badge } from '../components/common/Badge.jsx'
import { ReviewCardModal } from '../components/review/ReviewCardModal.jsx'
import { splitReviewQueue } from '../utils/reviewQueue.js'

function formatDate(value) {
  return new Date(value).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

function ReviewModeBadge({ mode }) {
  return (
    <Badge tone="blue">
      {mode === 'chapter' ? <IconRoute size={12} /> : <IconCards size={12} />}
      {mode === 'chapter' ? '跳回章节' : '卡片复习'}
    </Badge>
  )
}

function StarLine({ rating }) {
  return <span className="text-[11px] text-signal-amber">{'★'.repeat(rating)}{'☆'.repeat(4 - rating)}</span>
}

export function ReviewQueuePage() {
  const [queue, setQueue] = useState(() => storage.getReviewQueue())
  const [selected, setSelected] = useState(null)
  const { due: today, upcoming } = splitReviewQueue(queue)
  const preview = selected ?? today[0] ?? upcoming[0]

  function refresh() {
    const next = storage.getReviewQueue()
    setQueue(next)
    setSelected(null)
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <section className="overflow-hidden rounded-xl border border-[#F5C4B3] bg-signal-orangeLight shadow-card">
        <div className="h-1 bg-signal-orange" />
        <div className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-signal-orange text-white"><IconClock size={18} /></span>
            <div>
              <h1 className="font-serif text-[20px] font-medium">今日有 {today.length} 条需要复习</h1>
              <p className="mt-1 text-[13px] text-signal-orange">其中 {today.filter((item) => item.starRating <= 2).length} 条为低星级，建议优先处理。</p>
            </div>
          </div>
          <Button variant="warning" disabled={today.length === 0} onClick={() => today[0] && setSelected(today[0])}><IconPlayerPlay size={16} />开始复习</Button>
        </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <section className="rounded-xl border border-[var(--color-border-tertiary)] bg-white p-5 shadow-card">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[13px] font-medium">今日待复习</h2>
              <span className="rounded-full bg-[var(--color-background-secondary)] px-2.5 py-1 text-[11px] text-[var(--color-text-secondary)]">{today.length} 条</span>
            </div>
            <div className="mt-3 divide-y divide-[var(--color-border-tertiary)]">
              {today.map((item) => (
                <button key={item.id} type="button" onClick={() => setSelected(item)} className="flex w-full items-center justify-between gap-3 py-3 text-left">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-[13px] font-medium">{item.title}</div>
                      <StarLine rating={item.starRating} />
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-[var(--color-text-tertiary)]">
                      <span>{item.source}</span>
                      <span className="inline-flex items-center gap-1"><IconRepeat size={12} />第 {item.reviewCount + 1} 次</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                    <ReviewModeBadge mode={item.reviewMode} />
                    <Badge tone="warning">今日到期</Badge>
                  </div>
                </button>
              ))}
              {today.length === 0 ? (
                <div className="flex min-h-[132px] flex-col items-center justify-center rounded-lg border border-dashed border-[var(--color-border-secondary)] bg-[var(--color-background-secondary)] px-4 py-6 text-center">
                  <IconInbox size={22} className="text-[var(--color-text-tertiary)]" />
                  <p className="mt-2 text-[13px] font-medium">今天没有到期复习</p>
                  <p className="mt-1 text-[12px] text-[var(--color-text-tertiary)]">新的低星章节会自动出现在这里。</p>
                </div>
              ) : null}
            </div>
          </section>
          <section className="rounded-xl border border-[var(--color-border-tertiary)] bg-white p-5 shadow-card">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[13px] font-medium">近期计划</h2>
              <span className="rounded-full bg-[var(--color-background-secondary)] px-2.5 py-1 text-[11px] text-[var(--color-text-secondary)]">{upcoming.length} 条</span>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {upcoming.map((item) => (
                <button key={item.id} type="button" onClick={() => setSelected(item)} className="rounded-lg border border-[var(--color-border-tertiary)] p-3 text-left">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[13px] font-medium">{item.title}</div>
                    <StarLine rating={item.starRating} />
                  </div>
                  <div className="mt-1 text-[11px] text-[var(--color-text-tertiary)]">{item.source}</div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[11px] text-[var(--color-text-tertiary)]">{formatDate(item.nextReviewDate)}</span>
                    <ReviewModeBadge mode={item.reviewMode} />
                  </div>
                </button>
              ))}
              {upcoming.length === 0 ? (
                <div className="flex min-h-[112px] flex-col items-center justify-center rounded-lg border border-dashed border-[var(--color-border-secondary)] bg-[var(--color-background-secondary)] px-4 py-6 text-center md:col-span-2">
                  <IconCalendarDue size={22} className="text-[var(--color-text-tertiary)]" />
                  <p className="mt-2 text-[13px] font-medium">暂无近期计划</p>
                  <p className="mt-1 text-[12px] text-[var(--color-text-tertiary)]">完成章节评星后会生成下一次复习时间。</p>
                </div>
              ) : null}
            </div>
          </section>
        </div>

        <aside className="rounded-xl border border-[var(--color-border-tertiary)] bg-white p-5 shadow-card lg:sticky lg:top-20 lg:self-start">
          <h2 className="text-[13px] font-medium">卡片复习预览</h2>
          {preview ? (
            <div className="mt-4 space-y-3">
              <div className="font-serif text-[18px] font-medium">{preview.title}</div>
              <div className="text-[12px] text-[var(--color-text-secondary)]">{preview.source}</div>
              <div className="flex flex-wrap gap-2">
                <Badge tone="neutral">星级已隐藏</Badge>
                <ReviewModeBadge mode={preview.reviewMode} />
                <Badge tone="neutral">第 {preview.reviewCount + 1} 次</Badge>
              </div>
              {preview.reviewMode === 'chapter' ? (
                <Link to={`/book/${preview.bookId}/chapter/${preview.chapterId}`}><Button className="w-full">跳回章节</Button></Link>
              ) : (
                <Button className="w-full" onClick={() => setSelected(preview)}>开始卡片复习</Button>
              )}
            </div>
          ) : <p className="mt-4 text-[13px] text-[var(--color-text-secondary)]">暂无复习任务。</p>}
        </aside>
      </div>

      {selected && selected.reviewMode === 'card' ? <ReviewCardModal item={selected} onClose={() => setSelected(null)} onCompleted={refresh} /> : null}
    </div>
  )
}
