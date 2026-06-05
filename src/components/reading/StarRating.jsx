import { IconStar, IconStarFilled } from '@tabler/icons-react'
import { getReviewRuleText } from '../../utils/reviewSchedule.js'

const labels = {
  1: '完全不会',
  2: '模糊认知',
  3: '基本掌握',
  4: '完全掌握',
}

export function StarRating({ value, onChange, label = '掌握程度' }) {
  return (
    <div className="rounded-lg border border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[12px] font-medium">{label}</span>
        <span className="text-[11px] text-[var(--color-text-secondary)]">{value ? labels[value] : '未评定'}</span>
      </div>
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4].map((rating) => (
          <button
            key={rating}
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-signal-amber hover:bg-signal-amberLight"
            onClick={() => onChange(rating)}
            aria-label={`${rating} 星`}
          >
            {value >= rating ? <IconStarFilled size={20} /> : <IconStar size={20} />}
          </button>
        ))}
        <span className="ml-2 text-[11px] text-[var(--color-text-tertiary)]">{getReviewRuleText(value)}</span>
      </div>
    </div>
  )
}
