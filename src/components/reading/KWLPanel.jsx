import { useState } from 'react'
import { IconChevronDown, IconChevronUp, IconPlus, IconTrash } from '@tabler/icons-react'
import { Button } from '../common/Button.jsx'

function KWLColumn({ title, items, placeholder, onAdd, onUpdate, onDelete }) {
  const [draft, setDraft] = useState('')
  return (
    <div className="rounded-lg border border-[var(--color-border-tertiary)] bg-white p-3">
      <div className="mb-3 text-[12px] font-medium">{title}</div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            <input className="min-w-0 flex-1 rounded-lg border border-[var(--color-border-secondary)] px-2 py-1.5 text-[12px]" value={item} onChange={(event) => onUpdate(index, event.target.value)} />
            <button type="button" className="text-[var(--color-text-tertiary)]" onClick={() => onDelete(index)} aria-label="删除"><IconTrash size={15} /></button>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input className="min-w-0 flex-1 rounded-lg border border-[var(--color-border-secondary)] px-2 py-1.5 text-[12px]" placeholder={placeholder} value={draft} onChange={(event) => setDraft(event.target.value)} />
        <Button size="sm" variant="secondary" onClick={() => { if (draft.trim()) { onAdd(draft.trim()); setDraft('') } }}><IconPlus size={14} />添加</Button>
      </div>
    </div>
  )
}

export function KWLPanel({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const kwl = value ?? { k: [], w: [], l: [] }

  function updateColumn(column, nextItems) {
    onChange({ ...kwl, [column]: nextItems })
  }

  function add(column, item) {
    updateColumn(column, [...kwl[column], item])
  }

  function update(column, index, item) {
    updateColumn(column, kwl[column].map((entry, entryIndex) => (entryIndex === index ? item : entry)))
  }

  function remove(column, index) {
    updateColumn(column, kwl[column].filter((_, entryIndex) => entryIndex !== index))
  }

  return (
    <section className="rounded-xl border border-[var(--color-border-tertiary)] bg-white p-4 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[13px] font-medium">阅读前 · KWL</h2>
          <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
            <span className="rounded-full bg-[var(--color-background-tertiary)] px-2 py-1">K · {kwl.k.length} 条</span>
            <span className="rounded-full bg-[var(--color-background-tertiary)] px-2 py-1">W · {kwl.w.length} 个问题</span>
            <span className="rounded-full bg-[var(--color-background-tertiary)] px-2 py-1">L · {kwl.l.length} 条</span>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setOpen(!open)}>
          {open ? <IconChevronUp size={15} /> : <IconChevronDown size={15} />}
          {open ? '收起' : '展开'}
        </Button>
      </div>
      {open ? (
        <div className="mt-4 grid gap-3 xl:grid-cols-3">
          <KWLColumn title="K · 已知" items={kwl.k} placeholder="添加已知内容" onAdd={(item) => add('k', item)} onUpdate={(i, item) => update('k', i, item)} onDelete={(i) => remove('k', i)} />
          <KWLColumn title="W · 想知道" items={kwl.w} placeholder="添加阅读问题" onAdd={(item) => add('w', item)} onUpdate={(i, item) => update('w', i, item)} onDelete={(i) => remove('w', i)} />
          <KWLColumn title="L · 学到了" items={kwl.l} placeholder="阅读后回填" onAdd={(item) => add('l', item)} onUpdate={(i, item) => update('l', i, item)} onDelete={(i) => remove('l', i)} />
        </div>
      ) : null}
    </section>
  )
}
