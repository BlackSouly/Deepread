import { StarRating } from '../reading/StarRating.jsx'
import { getEffectiveChapterRating, getReviewRuleText } from '../../utils/reviewSchedule.js'

export function ChapterStarRatingSection({ chapterRating, sectionRatings, onChange }) {
  const effective = getEffectiveChapterRating(chapterRating, sectionRatings)

  return (
    <section className="rounded-xl border border-[var(--color-border-tertiary)] bg-white p-5 shadow-card">
      <h2 className="mb-4 text-[13px] font-medium">章节整体评定</h2>
      <StarRating value={chapterRating} onChange={onChange} label="章节整体掌握" />
      <div className="mt-4 rounded-lg bg-[var(--color-background-primary)] p-3 text-[12px] leading-6 text-[var(--color-text-secondary)]">
        章节星级以最低小节星级为触发基准，不因整体印象良好而掩盖薄弱点。
        <br />
        当前有效星级：{effective ? `${effective} 星 · ${getReviewRuleText(effective)}` : '未生成'}
      </div>
    </section>
  )
}
