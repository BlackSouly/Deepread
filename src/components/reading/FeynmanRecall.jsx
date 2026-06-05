import { useState } from 'react'
import { IconCheck, IconLock, IconSparkles, IconAlertTriangle, IconBulb } from '@tabler/icons-react'
import { aiService } from '../../services/ai.js'
import { Button } from '../common/Button.jsx'
import { useToast } from '../common/ToastProvider.jsx'
import { StarRating } from './StarRating.jsx'

export function FeynmanRecall({ title, aiContext, hint = '先写，再看参考', value, onChange, onSubmit, standardAnswer, onStandardAnswer, evaluation, onEvaluation, starRating, onStarRating, starLabel = '本小节掌握' }) {
  const [unlocked, setUnlocked] = useState(Boolean(standardAnswer && value?.trim()))
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()
  const summaryContext = aiContext ?? title

  async function submitRecall() {
    try {
      setLoading(true)
      const answer = standardAnswer || (await aiService.generateSectionSummary(summaryContext))
      const nextEvaluation = await aiService.evaluateFeynmanRecall(value, answer)
      onStandardAnswer(answer)
      onEvaluation(nextEvaluation)
      setUnlocked(true)
      onSubmit?.()
      showToast('复述已提交，AI 对照已生成。', 'success')
    } catch {
      showToast('复述评价生成失败，请稍后重试。', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function unlockEarly() {
    const confirmed = window.confirm('提前查看会降低费曼练习效果，建议先完成自己的复述再对比。确认提前查看吗？')
    if (!confirmed) return
    try {
      setLoading(true)
      const answer = standardAnswer || (await aiService.generateSectionSummary(summaryContext))
      onStandardAnswer(answer)
      setUnlocked(true)
      showToast('已提前解锁 AI 标准概括。', 'warning')
    } catch {
      showToast('AI 标准概括生成失败，请稍后重试。', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="rounded-xl border border-[var(--color-border-tertiary)] bg-white p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[13px] font-medium">{title}</h2>
          <p className="mt-1 text-[11px] text-[var(--color-text-tertiary)]">{hint}</p>
        </div>
        <Button size="sm" onClick={submitRecall} disabled={loading}>
          <IconCheck size={15} />
          提交复述
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div>
          <div className="mb-2 text-[12px] font-medium text-brand-900">我的费曼复述</div>
          <textarea
            className="min-h-40 w-full resize-y rounded-lg border border-brand-200 bg-brand-50 px-3 py-3 text-[13px] leading-6 outline-none focus:ring-2 focus:ring-brand-200"
            placeholder="用最简单的话解释给一个完全不了解的人..."
            value={value}
            onChange={(event) => onChange(event.target.value)}
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[12px] font-medium">AI 标准概括</span>
            {!unlocked ? (
              <Button size="sm" variant="secondary" onClick={unlockEarly} disabled={loading}>
                <IconLock size={14} />
                手动解锁
              </Button>
            ) : null}
          </div>
          {unlocked ? (
            <div className="min-h-40 rounded-lg border border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] p-3 text-[13px] leading-6 text-[var(--color-text-secondary)]">
              {standardAnswer}
            </div>
          ) : (
            <div className="flex min-h-40 flex-col items-center justify-center rounded-lg border border-dashed border-[var(--color-border-secondary)] bg-[var(--color-background-primary)] p-4 text-center text-[12px] text-[var(--color-text-tertiary)]">
              <IconLock size={20} />
              <span className="mt-2">已提交复述后自动解锁</span>
            </div>
          )}
        </div>
      </div>

      {evaluation?.correct ? (
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-lg bg-brand-50 p-3 text-[12px] leading-5 text-brand-900"><IconCheck size={15} /> 正确的部分<br />{evaluation.correct}</div>
          <div className="rounded-lg bg-signal-amberLight p-3 text-[12px] leading-5 text-[#8B5B08]"><IconAlertTriangle size={15} /> 缺失的关键点<br />{evaluation.missing?.join('、')}</div>
          <div className="rounded-lg bg-signal-blueLight p-3 text-[12px] leading-5 text-signal-blue"><IconBulb size={15} /> 改进建议<br />{evaluation.suggestion}</div>
        </div>
      ) : null}

      <div className="mt-4">
        <StarRating value={starRating} onChange={onStarRating} label={starLabel} />
      </div>
    </section>
  )
}
