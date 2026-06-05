import { useEffect, useState } from 'react'
import { IconArrowRight, IconX } from '@tabler/icons-react'
import { aiService } from '../../services/ai.js'
import { storage } from '../../services/storage.js'
import { getNextReviewDate } from '../../utils/reviewSchedule.js'
import { getReviewMode } from '../../utils/reviewMode.js'
import { Button } from '../common/Button.jsx'
import { useToast } from '../common/ToastProvider.jsx'
import { StarRating } from '../reading/StarRating.jsx'

export function ReviewCardModal({ item, onClose, onCompleted }) {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [evaluation, setEvaluation] = useState(null)
  const [nextRating, setNextRating] = useState(null)
  const { showToast } = useToast()

  useEffect(() => {
    let active = true
    aiService.generateReviewQuestion(item.title, item.source).then((result) => {
      if (active) setQuestion(result)
    })
    return () => {
      active = false
    }
  }, [item])

  async function submit() {
    try {
      const result = await aiService.evaluateFeynmanRecall(answer, item.title)
      setEvaluation(result)
      setSubmitted(true)
      showToast('本次复述已提交，可以查看历史对比。', 'success')
    } catch {
      showToast('复习评价生成失败，请稍后重试。', 'error')
    }
  }

  function complete() {
    const rating = nextRating ?? item.starRating
    storage.updateReviewItem(item.id, {
      ...item,
      starRating: rating,
      reviewCount: item.reviewCount + 1,
      lastReviewDate: new Date().toISOString(),
      nextReviewDate: getNextReviewDate(rating, item.reviewCount + 1),
      reviewMode: getReviewMode(rating, item.reviewCount + 1),
      lastAnswer: answer,
    })
    showToast('复习已完成，已安排下次复习。', 'success')
    onCompleted()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 px-4">
      <section className="w-full max-w-3xl rounded-xl bg-white shadow-card">
        <div className="flex items-start justify-between border-b border-[var(--color-border-tertiary)] p-5">
          <div>
            <h2 className="font-serif text-[18px] font-medium">{item.title}</h2>
            <p className="mt-1 text-[12px] text-[var(--color-text-secondary)]">{item.source} · 第 {item.reviewCount + 1} 次复习</p>
          </div>
          <button type="button" onClick={onClose} className="text-[var(--color-text-tertiary)]"><IconX size={18} /></button>
        </div>
        <div className="space-y-4 p-5">
          <div className="rounded-lg bg-[var(--color-background-primary)] p-4 text-[13px] leading-6">{question || '正在生成复习问题...'}</div>
          <textarea className="min-h-36 w-full resize-y rounded-lg border border-[var(--color-border-secondary)] px-3 py-3 text-[13px] leading-6" value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="在此写下你的复述..." />
          {!submitted ? (
            <Button onClick={submit}>提交复述</Button>
          ) : (
            <>
              <div className="rounded-lg border border-[var(--color-border-tertiary)] p-4">
                <div className="mb-2 text-[12px] font-medium">上次星级对比</div>
                <p className="text-[13px] text-[var(--color-text-secondary)]">上次评定：{item.starRating} 星。你已经提交本次复述，因此现在展示历史结果。</p>
                {item.lastAnswer ? <p className="mt-2 text-[12px] text-[var(--color-text-tertiary)]">上次答案：{item.lastAnswer}</p> : null}
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-lg bg-brand-50 p-3 text-[12px] text-brand-900">{evaluation.correct}</div>
                <div className="rounded-lg bg-signal-amberLight p-3 text-[12px] text-[#8B5B08]">{evaluation.missing?.join('、')}</div>
                <div className="rounded-lg bg-signal-blueLight p-3 text-[12px] text-signal-blue">{evaluation.suggestion}</div>
              </div>
              <StarRating value={nextRating ?? item.starRating} onChange={setNextRating} label="重新打星" />
              <Button onClick={complete}><IconArrowRight size={16} />下一条</Button>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
