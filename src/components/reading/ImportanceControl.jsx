import { useState } from 'react'
import { IconRobot, IconStarFilled } from '@tabler/icons-react'
import { aiService } from '../../services/ai.js'
import { Badge } from '../common/Badge.jsx'
import { Button } from '../common/Button.jsx'

const selectClass = 'h-8 rounded-lg border border-[var(--color-border-secondary)] bg-white px-2 text-[12px] outline-none focus:border-brand-200 focus:ring-2 focus:ring-brand-50'

export function ImportanceControl({ chapter, bookPurpose, onChange }) {
  const [loading, setLoading] = useState(false)
  const hasAiSuggestion = chapter.importanceSource === 'ai' && chapter.aiSuggestionReason

  function updateImportance(importance, importanceSource = 'manual') {
    onChange({ ...chapter, importance, importanceSource })
  }

  async function askAi() {
    setLoading(true)
    const suggestion = await aiService.suggestKeyChapter(chapter.title, bookPurpose)
    onChange({
      ...chapter,
      importance: suggestion.suggest ? 'normal' : chapter.importance,
      importanceSource: 'ai',
      aiSuggestionReason: suggestion.reason,
    })
    setLoading(false)
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {chapter.importance === 'key' ? <Badge tone="purple"><IconStarFilled size={12} />重点章节</Badge> : null}
      {chapter.importance === 'ignored' ? <Badge tone="neutral">忽略章节</Badge> : null}
      {hasAiSuggestion ? <Badge tone="purple"><IconRobot size={12} />AI 建议重点</Badge> : null}
      <select className={selectClass} value={chapter.importance} onChange={(event) => updateImportance(event.target.value)}>
        <option value="normal">普通章节</option>
        <option value="key">重点章节</option>
        <option value="ignored">忽略章节</option>
      </select>
      <Button size="sm" variant="secondary" onClick={askAi} disabled={loading}>
        <IconRobot size={14} />
        {loading ? '分析中' : 'AI 建议'}
      </Button>
      {hasAiSuggestion ? (
        <div className="basis-full rounded-lg border border-[#CECBF6] bg-signal-purpleLight px-3 py-2 text-[12px] leading-5 text-signal-purple">
          {chapter.aiSuggestionReason}
          <div className="mt-2 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => updateImportance('key', 'manual')}>确认</Button>
            <Button size="sm" variant="secondary" onClick={() => updateImportance('normal', 'manual')}>降级</Button>
            <Button size="sm" variant="secondary" onClick={() => updateImportance('ignored', 'manual')}>忽略</Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
