import { useEffect, useMemo, useState } from 'react'
import { IconCheck, IconCloudDown, IconLoader2, IconSearch } from '@tabler/icons-react'
import { storage } from '../../services/storage.js'
import { mapWereadCategory, wereadService } from '../../services/weread.js'
import { Button } from '../common/Button.jsx'
import { Modal } from '../common/Modal.jsx'
import { Badge } from '../common/Badge.jsx'
import { useToast } from '../common/ToastProvider.jsx'

const bookTypes = ['工具书', '叙事', '理论', '其他']
const filterOptions = [
  { value: 'all', label: '全部' },
  { value: 'reading', label: '在读' },
  { value: 'finished', label: '已读' },
  { value: 'wish', label: '想读' },
]

const inputClass = 'w-full rounded-lg border border-[var(--color-border-secondary)] bg-white px-3 py-2 text-[13px] outline-none'

function statusLabel(status) {
  if (status === 'reading') return '在读'
  if (status === 'finished') return '已读'
  return '想读'
}

function createChapterDraft(book) {
  return (book.chapters?.length ? book.chapters : Array.from({ length: book.totalChapters || 3 }, (_, index) => `第 ${index + 1} 章`)).join('\n')
}

function createImportDraft(book) {
  return {
    purpose: '',
    type: mapWereadCategory(book.category),
    chaptersText: createChapterDraft(book),
  }
}

export function WereadImportModal({ onClose, onImported }) {
  const [step, setStep] = useState('select')
  const [connection, setConnection] = useState(null)
  const [bookshelf, setBookshelf] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [drafts, setDrafts] = useState({})
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      const [nextConnection, nextBookshelf] = await Promise.all([
        wereadService.getConnectionStatus(),
        wereadService.getBookshelf(),
      ])
      if (!active) return
      setConnection(nextConnection)
      setBookshelf(nextBookshelf)
      setLoading(false)
    }
    load()
    return () => {
      active = false
    }
  }, [])

  const visibleBooks = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    return bookshelf.filter((book) => {
      const matchesStatus = statusFilter === 'all' || book.status === statusFilter
      const matchesQuery = !keyword || `${book.title} ${book.author}`.toLowerCase().includes(keyword)
      return matchesStatus && matchesQuery
    })
  }, [bookshelf, query, statusFilter])

  const selectedBooks = selectedIds.map((id) => bookshelf.find((book) => book.id === id)).filter(Boolean)
  const hasDraftErrors = submitted && selectedBooks.some((book) => !drafts[book.id]?.purpose?.trim())

  function toggleBook(bookId) {
    setSelectedIds((current) => current.includes(bookId) ? current.filter((id) => id !== bookId) : [...current, bookId])
  }

  async function continueToConfirm() {
    const detailedBooks = await Promise.all(selectedBooks.map((book) => wereadService.getBookDetail(book.id)))
    const nextDrafts = {}
    detailedBooks.filter(Boolean).forEach((book) => {
      nextDrafts[book.id] = drafts[book.id] ?? createImportDraft(book)
    })
    setBookshelf((current) => current.map((book) => detailedBooks.find((detail) => detail?.id === book.id) ?? book))
    setDrafts(nextDrafts)
    setStep('confirm')
  }

  function updateDraft(bookId, field, value) {
    setDrafts((current) => ({
      ...current,
      [bookId]: { ...current[bookId], [field]: value },
    }))
  }

  function createBookFromWeread(book, draft) {
    const chapterTitles = draft.chaptersText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
    const savedBook = storage.saveBook({
      title: book.title,
      author: book.author,
      type: draft.type,
      purpose: draft.purpose.trim(),
      coverImage: book.cover,
      isbn: '',
      totalChapters: chapterTitles.length,
      wereadId: book.id,
      wereadProgress: book.progress,
      wereadCategory: book.category,
      importedFrom: 'weread',
    })

    chapterTitles.forEach((title, index) => {
      storage.saveChapter({
        bookId: savedBook.id,
        order: index + 1,
        title,
        sectionCount: 3,
        importance: 'normal',
        importanceSource: 'manual',
        aiSuggestionReason: '',
        status: index === 0 && book.progress > 0 && book.progress < 100 ? 'reading' : book.progress >= 100 ? 'done' : 'pending',
        starRating: null,
        completedAt: book.progress >= 100 ? new Date().toISOString() : null,
      })
    })

    return savedBook
  }

  async function importBooks(event) {
    event.preventDefault()
    setSubmitted(true)
    if (selectedBooks.some((book) => !drafts[book.id]?.purpose?.trim())) return
    setSubmitting(true)
    selectedBooks.forEach((book) => createBookFromWeread(book, drafts[book.id]))
    showToast(`已从微信读书导入 ${selectedBooks.length} 本书。`, 'success')
    setSubmitting(false)
    onImported()
  }

  return (
    <Modal title="从微信读书导入" onClose={onClose}>
      {loading ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center text-[13px] text-[var(--color-text-secondary)]">
          <IconLoader2 size={24} className="animate-spin text-brand-900" />
          <span className="mt-3">正在同步微信读书书架...</span>
        </div>
      ) : step === 'select' ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2">
            <div>
              <div className="text-[12px] font-medium text-brand-900">连接状态：{connection?.label}</div>
              <p className="mt-1 text-[11px] text-brand-900/80">{connection?.detail}</p>
            </div>
            <Badge tone="done"><IconCloudDown size={12} />Mock 同步</Badge>
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_180px]">
            <label className="relative block">
              <IconSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
              <input className={`${inputClass} pl-9`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索书名或作者" />
            </label>
            <select className={inputClass} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              {filterOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>

          <div className="max-h-[420px] space-y-2 overflow-auto pr-1">
            {visibleBooks.map((book) => {
              const selected = selectedIds.includes(book.id)
              return (
                <button
                  key={book.id}
                  type="button"
                  className={`grid w-full grid-cols-[52px_1fr_auto] items-center gap-3 rounded-lg border p-3 text-left transition ${selected ? 'border-brand-200 bg-brand-50' : 'border-[var(--color-border-tertiary)] bg-white hover:bg-[var(--color-background-secondary)]'}`}
                  onClick={() => toggleBook(book.id)}
                >
                  <img src={book.cover} alt={book.title} className="h-16 w-12 rounded-md object-cover shadow-sm" />
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-medium">{book.title}</div>
                    <div className="mt-1 text-[12px] text-[var(--color-text-secondary)]">{book.author}</div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge tone="neutral">{statusLabel(book.status)}</Badge>
                      <span className="text-[11px] text-[var(--color-text-tertiary)]">阅读进度 {book.progress}%</span>
                    </div>
                  </div>
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full border ${selected ? 'border-brand-500 bg-brand-500 text-white' : 'border-[var(--color-border-secondary)] text-transparent'}`}>
                    <IconCheck size={15} />
                  </span>
                </button>
              )
            })}
          </div>

          <div className="flex justify-end gap-2 border-t border-[var(--color-border-tertiary)] pt-4">
            <Button variant="secondary" onClick={onClose}>取消</Button>
            <Button disabled={selectedIds.length === 0} onClick={continueToConfirm}>
              下一步：补充阅读目的
            </Button>
          </div>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={importBooks}>
          {hasDraftErrors ? (
            <div className="rounded-lg border border-[#F5C4B3] bg-signal-orangeLight px-3 py-2 text-[12px] text-signal-orange">
              每本导入书籍都必须填写阅读目的。
            </div>
          ) : null}

          <div className="max-h-[500px] space-y-4 overflow-auto pr-1">
            {selectedBooks.map((book) => {
              const draft = drafts[book.id] ?? createImportDraft(book)
              return (
                <section key={book.id} className="rounded-xl border border-[var(--color-border-tertiary)] bg-white p-4">
                  <div className="grid gap-3 md:grid-cols-[52px_1fr]">
                    <img src={book.cover} alt={book.title} className="h-16 w-12 rounded-md object-cover shadow-sm" />
                    <div>
                      <div className="font-serif text-[16px] font-medium">{book.title}</div>
                      <div className="mt-1 text-[12px] text-[var(--color-text-secondary)]">{book.author} · 微信读书进度 {book.progress}%</div>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-[1fr_160px]">
                    <label>
                      <span className="mb-1.5 block text-[12px] font-medium text-[var(--color-text-secondary)]">阅读目的 <span className="text-signal-orange">*</span></span>
                      <textarea className={`${inputClass} min-h-20 resize-y`} value={draft.purpose} onChange={(event) => updateDraft(book.id, 'purpose', event.target.value)} placeholder="为什么要深读这本书？这句话会贯穿后续阅读流程。" />
                    </label>
                    <label>
                      <span className="mb-1.5 block text-[12px] font-medium text-[var(--color-text-secondary)]">书籍类型</span>
                      <select className={inputClass} value={draft.type} onChange={(event) => updateDraft(book.id, 'type', event.target.value)}>
                        {bookTypes.map((type) => <option key={type}>{type}</option>)}
                      </select>
                    </label>
                  </div>
                  <label className="mt-3 block">
                    <span className="mb-1.5 block text-[12px] font-medium text-[var(--color-text-secondary)]">章节列表</span>
                    <textarea className={`${inputClass} min-h-24 resize-y`} value={draft.chaptersText} onChange={(event) => updateDraft(book.id, 'chaptersText', event.target.value)} />
                  </label>
                </section>
              )
            })}
          </div>

          <div className="flex justify-between gap-2 border-t border-[var(--color-border-tertiary)] pt-4">
            <Button variant="secondary" onClick={() => setStep('select')}>返回选择</Button>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={onClose}>取消</Button>
              <Button type="submit" disabled={submitting}>
                <IconCloudDown size={16} />
                {submitting ? '导入中' : `确认导入 ${selectedBooks.length} 本`}
              </Button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  )
}
