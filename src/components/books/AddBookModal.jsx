import { useMemo, useState } from 'react'
import { IconPlus } from '@tabler/icons-react'
import { storage } from '../../services/storage.js'
import { Button } from '../common/Button.jsx'
import { Modal } from '../common/Modal.jsx'

const bookTypes = ['工具书', '叙事', '理论', '其他']

function Field({ label, children, required = false }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-medium text-[var(--color-text-secondary)]">
        {label}
        {required ? <span className="text-signal-orange"> *</span> : null}
      </span>
      {children}
    </label>
  )
}

const inputClass = 'w-full rounded-lg border border-[var(--color-border-secondary)] bg-white px-3 py-2 text-[13px] outline-none transition focus:border-brand-200 focus:ring-2 focus:ring-brand-50'

export function AddBookModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    title: '',
    author: '',
    type: '工具书',
    purpose: '',
    isbn: '',
    readingCycle: '',
    chaptersText: '第一章\n第二章\n第三章',
  })
  const [submitted, setSubmitted] = useState(false)

  const chapterTitles = useMemo(
    () => form.chaptersText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean),
    [form.chaptersText],
  )

  const hasErrors = submitted && (!form.title.trim() || !form.purpose.trim())

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }))
  }

  function submit(event) {
    event.preventDefault()
    setSubmitted(true)
    if (!form.title.trim() || !form.purpose.trim()) return

    const book = storage.saveBook({
      title: form.title.trim(),
      author: form.author.trim(),
      type: form.type,
      purpose: form.purpose.trim(),
      coverImage: '',
      isbn: form.isbn.trim(),
      readingCycle: form.readingCycle.trim(),
      totalChapters: chapterTitles.length,
    })

    chapterTitles.forEach((title, index) => {
      storage.saveChapter({
        bookId: book.id,
        order: index + 1,
        title,
        sectionCount: 3,
        importance: 'normal',
        importanceSource: 'manual',
        aiSuggestionReason: '',
        status: index === 0 ? 'reading' : 'pending',
        starRating: null,
        completedAt: null,
      })
    })

    onCreated(book.id)
  }

  return (
    <Modal title="添加新书" onClose={onClose}>
      <form className="space-y-4" onSubmit={submit}>
        {hasErrors ? (
          <div className="rounded-lg border border-[#F5C4B3] bg-signal-orangeLight px-3 py-2 text-[12px] text-signal-orange">
            书名和阅读目的必须填写。
          </div>
        ) : null}
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="书名" required>
            <input className={inputClass} value={form.title} onChange={(event) => updateField('title', event.target.value)} />
          </Field>
          <Field label="作者">
            <input className={inputClass} value={form.author} onChange={(event) => updateField('author', event.target.value)} />
          </Field>
          <Field label="书籍类型">
            <select className={inputClass} value={form.type} onChange={(event) => updateField('type', event.target.value)}>
              {bookTypes.map((type) => <option key={type}>{type}</option>)}
            </select>
          </Field>
          <Field label="ISBN">
            <input className={inputClass} value={form.isbn} onChange={(event) => updateField('isbn', event.target.value)} placeholder="预留自动抓取封面" />
          </Field>
        </div>
        <Field label="阅读目的" required>
          <textarea
            className={`${inputClass} min-h-24 resize-y`}
            value={form.purpose}
            onChange={(event) => updateField('purpose', event.target.value)}
            placeholder="这句话会贯穿整个阅读过程"
          />
        </Field>
        <div className="grid gap-4 md:grid-cols-[1fr_2fr]">
          <Field label="预计阅读周期">
            <input className={inputClass} value={form.readingCycle} onChange={(event) => updateField('readingCycle', event.target.value)} placeholder="例如 21 天" />
          </Field>
          <Field label={`章节列表（${chapterTitles.length} 章）`}>
            <textarea className={`${inputClass} min-h-28 resize-y`} value={form.chaptersText} onChange={(event) => updateField('chaptersText', event.target.value)} />
          </Field>
        </div>
        <div className="flex justify-end gap-2 border-t border-[var(--color-border-tertiary)] pt-4">
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button type="submit">
            <IconPlus size={16} />
            创建书籍
          </Button>
        </div>
      </form>
    </Modal>
  )
}
