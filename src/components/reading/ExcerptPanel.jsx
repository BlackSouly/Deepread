import { useState } from 'react'
import { IconPlus, IconTrash } from '@tabler/icons-react'
import { Button } from '../common/Button.jsx'

export function ExcerptPanel({ excerpts, onChange }) {
  const [draft, setDraft] = useState({ content: '', source: '' })
  const overLimit = excerpts.length > 3

  function addExcerpt() {
    if (!draft.content.trim()) return
    onChange([...excerpts, { id: crypto.randomUUID(), content: draft.content.trim(), source: draft.source.trim() }])
    setDraft({ content: '', source: '' })
  }

  return (
    <div className="space-y-3">
      <div className={`rounded-lg px-3 py-2 text-[12px] ${overLimit ? 'bg-signal-orangeLight text-signal-orange' : 'bg-[var(--color-background-tertiary)] text-[var(--color-text-secondary)]'}`}>
        本章 {excerpts.length}/3 条，建议不超过 3 条
      </div>
      <div className="space-y-3">
        {excerpts.map((excerpt) => (
          <div key={excerpt.id} className="border-l-2 border-brand-500 bg-[var(--color-background-primary)] p-3">
            <div className="font-serif text-[13px] italic leading-6">{excerpt.content}</div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[11px] text-[var(--color-text-tertiary)]">{excerpt.source || '未填写页码'}</span>
              <button type="button" className="text-[var(--color-text-tertiary)]" onClick={() => onChange(excerpts.filter((item) => item.id !== excerpt.id))}><IconTrash size={15} /></button>
            </div>
          </div>
        ))}
      </div>
      <textarea className="min-h-20 w-full rounded-lg border border-[var(--color-border-secondary)] px-3 py-2 text-[13px]" placeholder="添加摘录" value={draft.content} onChange={(event) => setDraft({ ...draft, content: event.target.value })} />
      <div className="flex gap-2">
        <input className="min-w-0 flex-1 rounded-lg border border-[var(--color-border-secondary)] px-3 py-2 text-[12px]" placeholder="页码 / 来源" value={draft.source} onChange={(event) => setDraft({ ...draft, source: event.target.value })} />
        <Button size="sm" variant="secondary" onClick={addExcerpt}><IconPlus size={14} />添加摘录</Button>
      </div>
    </div>
  )
}
