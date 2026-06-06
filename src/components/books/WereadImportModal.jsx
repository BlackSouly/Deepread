import { useEffect, useMemo, useState } from 'react'
import { IconAlertTriangle, IconCheck, IconCloudDown, IconLoader2, IconPlugConnected, IconRefresh, IconSearch, IconSettings } from '@tabler/icons-react'
import { storage } from '../../services/storage.js'
import { mapWereadCategory, WEREAD_CONNECTION_STATUS, wereadService } from '../../services/weread.js'
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
const connectionTone = {
  [WEREAD_CONNECTION_STATUS.connected]: 'border-brand-200 bg-brand-50 text-brand-900',
  [WEREAD_CONNECTION_STATUS.notConfigured]: 'border-[#F5C4B3] bg-signal-orangeLight text-signal-orange',
  [WEREAD_CONNECTION_STATUS.failed]: 'border-[#F5C4B3] bg-white text-signal-orange',
}

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

function ConnectionIcon({ status }) {
  if (status === WEREAD_CONNECTION_STATUS.connected) return <IconPlugConnected size={15} />
  if (status === WEREAD_CONNECTION_STATUS.notConfigured) return <IconSettings size={15} />
  return <IconAlertTriangle size={15} />
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
  const importedWereadIds = useMemo(
    () => new Set(storage.getBooks().map((book) => book.wereadId).filter(Boolean)),
    [],
  )

  async function loadBookshelf() {
    try {
      setLoading(true)
      setSelectedIds([])
      const nextConnection = await wereadService.getConnectionStatus()
      setConnection(nextConnection)
      if (nextConnection.status !== WEREAD_CONNECTION_STATUS.connected) {
        setBookshelf([])
        return
      }
      setBookshelf(await wereadService.getBookshelf())
    } catch (error) {
      setConnection({
        status: WEREAD_CONNECTION_STATUS.failed,
        label: '连接失败',
        mode: 'mock',
        detail: error instanceof Error ? error.message : '同步微信读书书架失败。',
      })
      setBookshelf([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    async function load() {
      await loadBookshelf()
      if (!active) return
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
    if (importedWereadIds.has(bookId)) return
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
    const existingBook = storage.getBooks().find((item) => item.wereadId === book.id)
    if (existingBook) return existingBook

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
    const importableBooks = selectedBooks.filter((book) => !storage.getBooks().some((item) => item.wereadId === book.id))
    if (importableBooks.length === 0) {
      showToast('所选书籍已经导入，无需重复导入。', 'warning')
      return
    }
    setSubmitting(true)
    importableBooks.forEach((book) => createBookFromWeread(book, drafts[book.id]))
    showToast(`已从微信读书导入 ${importableBooks.length} 本书。`, 'success')
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
          <div className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border px-3 py-2 ${connectionTone[connection?.status] ?? connectionTone[WEREAD_CONNECTION_STATUS.failed]}`}>
            <div>
              <div className="flex items-center gap-1 text-[12px] font-medium">
                <ConnectionIcon status={connection?.status} />
                连接状态：{connection?.label}
              </div>
              <p className="mt-1 text-[11px] opacity-80">{connection?.detail}</p>
            </div>
            <Badge tone={connection?.status === WEREAD_CONNECTION_STATUS.connected ? 'done' : 'warning'}>
              <IconCloudDown size={12} />
              {connection?.mode === 'mock' ? 'Mock 同步' : 'MCP 同步'}
            </Badge>
          </div>

          {connection?.status === WEREAD_CONNECTION_STATUS.connected ? (
            <>
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
                  const alreadyImported = importedWereadIds.has(book.id)
                  return (
                    <button
                      key={book.id}
                      type="button"
                      disabled={alreadyImported}
                      className={`grid w-full grid-cols-[52px_1fr_auto] items-center gap-3 rounded-lg border p-3 text-left transition disabled:cursor-not-allowed ${
                        alreadyImported
                          ? 'border-[var(--color-border-tertiary)] bg-[var(--color-background-secondary)] opacity-70'
                          : selected
                            ? 'border-brand-200 bg-brand-50'
                            : 'border-[var(--color-border-tertiary)] bg-white hover:bg-[var(--color-background-secondary)]'
                      }`}
                      onClick={() => toggleBook(book.id)}
                    >
                      <img src={book.cover} alt={book.title} className="h-16 w-12 rounded-md object-cover shadow-sm" />
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-medium">{book.title}</div>
                        <div className="mt-1 text-[12px] text-[var(--color-text-secondary)]">{book.author}</div>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Badge tone="neutral">{statusLabel(book.status)}</Badge>
                          {alreadyImported ? <Badge tone="done">已导入</Badge> : null}
                          <span className="text-[11px] text-[var(--color-text-tertiary)]">阅读进度 {book.progress}%</span>
                        </div>
                      </div>
                      <span className={`flex h-7 w-7 items-center justify-center rounded-full border ${selected ? 'border-brand-500 bg-brand-500 text-white' : alreadyImported ? 'border-brand-200 bg-brand-50 text-brand-900' : 'border-[var(--color-border-secondary)] text-transparent'}`}>
                        <IconCheck size={15} />
                      </span>
                    </button>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-[var(--color-border-secondary)] bg-white px-6 text-center">
              <ConnectionIcon status={connection?.status} />
              <h3 className="mt-3 font-serif text-[18px] font-medium">{connection?.label}</h3>
              <p className="mt-2 max-w-md text-[13px] leading-6 text-[var(--color-text-secondary)]">
                {connection?.status === WEREAD_CONNECTION_STATUS.notConfigured
                  ? '配置 WeRead MCP Server 后即可同步真实微信读书书架。当前深读基础功能和手动添加不受影响。'
                  : '请检查 WeRead MCP Server 是否运行、账号是否已登录，或稍后重试。'}
              </p>
              <div className="mt-5 flex gap-2">
                <Button variant="secondary" onClick={onClose}>改用手动添加</Button>
                <Button onClick={loadBookshelf}><IconRefresh size={15} />重试连接</Button>
              </div>
            </div>
          )}

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

          <div className="rounded-lg border border-[#B5D4F4] bg-signal-blueLight px-3 py-2 text-[12px] leading-5 text-signal-blue">
            微信读书进度会作为外部参考展示；深读平台内的章节完成、星级和复习计划仍由你在阅读流程中独立维护。
          </div>

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
