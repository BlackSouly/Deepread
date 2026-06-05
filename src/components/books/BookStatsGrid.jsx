import { IconClockHour4, IconFlag, IconRefresh, IconStar } from '@tabler/icons-react'
import { formatMinutes, getBookChapterStats } from '../../utils/bookMetrics.js'

function StatCard({ icon, label, value, detail, tone = 'neutral' }) {
  const toneClass = tone === 'warning' ? 'text-signal-orange bg-signal-orangeLight' : 'text-[var(--color-text-secondary)] bg-[var(--color-background-tertiary)]'
  return (
    <div className="rounded-xl border border-[var(--color-border-tertiary)] bg-white p-4 shadow-card">
      <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${toneClass}`}>{icon}</div>
      <div className="text-[18px] font-medium">{value}</div>
      <div className="mt-1 text-[12px] text-[var(--color-text-secondary)]">{label}</div>
      <div className="mt-2 text-[11px] text-[var(--color-text-tertiary)]">{detail}</div>
    </div>
  )
}

export function BookStatsGrid({ chapters, stats, reviewCount }) {
  const chapterStats = getBookChapterStats(chapters)

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard icon={<IconFlag size={18} />} label="已完成章节" value={`${chapterStats.requiredDone}/${chapterStats.requiredTotal}`} detail="忽略章节不计入必读进度" />
      <StatCard icon={<IconClockHour4 size={18} />} label="累计阅读时长" value={formatMinutes(stats.totalMinutes)} detail={`本周 ${formatMinutes(stats.weekMinutes)}`} />
      <StatCard icon={<IconRefresh size={18} />} label="待复习条目" value={reviewCount} detail="到期条目优先处理" tone="warning" />
      <StatCard icon={<IconStar size={18} />} label="重点章节" value={`${chapterStats.keyDone}/${chapterStats.keyTotal}`} detail="手动与 AI 建议分开显示" />
    </div>
  )
}
