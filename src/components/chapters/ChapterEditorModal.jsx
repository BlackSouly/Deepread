import { useState } from 'react'
import { IconDeviceFloppy } from '@tabler/icons-react'
import { Button } from '../common/Button.jsx'
import { Modal } from '../common/Modal.jsx'

const inputClass = 'w-full rounded-lg border border-[var(--color-border-secondary)] bg-white px-3 py-2 text-[13px] outline-none transition focus:border-brand-200 focus:ring-2 focus:ring-brand-50'

export function ChapterEditorModal({ chapter, nextOrder, onClose, onSave }) {
  const [form, setForm] = useState({
    title: chapter?.title ?? '',
    sectionCount: chapter?.sectionCount ?? 3,
    importance: chapter?.importance ?? 'normal',
  })
  const [submitted, setSubmitted] = useState(false)

  function submit(event) {
    event.preventDefault()
    setSubmitted(true)
    if (!form.title.trim()) return
    onSave({
      ...chapter,
      order: chapter?.order ?? nextOrder,
      title: form.title.trim(),
      sectionCount: Number(form.sectionCount),
      importance: form.importance,
      importanceSource: chapter?.importanceSource ?? 'manual',
      aiSuggestionReason: chapter?.aiSuggestionReason ?? '',
      status: chapter?.status ?? 'pending',
      starRating: chapter?.starRating ?? null,
      completedAt: chapter?.completedAt ?? null,
    })
  }

  return (
    <Modal title={chapter ? '编辑章节' : '添加章节'} onClose={onClose}>
      <form className="space-y-4" onSubmit={submit}>
        {submitted && !form.title.trim() ? (
          <div className="rounded-lg border border-[#F5C4B3] bg-signal-orangeLight px-3 py-2 text-[12px] text-signal-orange">
            章节标题必须填写。
          </div>
        ) : null}
        <label className="block">
          <span className="mb-1.5 block text-[12px] font-medium text-[var(--color-text-secondary)]">章节标题</span>
          <input className={inputClass} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-[var(--color-text-secondary)]">小节数</span>
            <input className={inputClass} type="number" min="1" max="12" value={form.sectionCount} onChange={(event) => setForm({ ...form, sectionCount: event.target.value })} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-[var(--color-text-secondary)]">重要性</span>
            <select className={inputClass} value={form.importance} onChange={(event) => setForm({ ...form, importance: event.target.value })}>
              <option value="normal">普通章节</option>
              <option value="key">重点章节</option>
              <option value="ignored">忽略章节</option>
            </select>
          </label>
        </div>
        <div className="flex justify-end gap-2 border-t border-[var(--color-border-tertiary)] pt-4">
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button type="submit"><IconDeviceFloppy size={16} />保存章节</Button>
        </div>
      </form>
    </Modal>
  )
}
