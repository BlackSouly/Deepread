import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IconBook2, IconClockHour4, IconDeviceFloppy, IconEdit, IconExternalLink, IconLibraryPlus, IconRefresh, IconSearch, IconTrash } from '@tabler/icons-react'
import { storage } from '../services/storage.js'
import { WEREAD_CONNECTION_STATUS, wereadService } from '../services/weread.js'
import { AddBookModal } from '../components/books/AddBookModal.jsx'
import { Button } from '../components/common/Button.jsx'
import { Badge } from '../components/common/Badge.jsx'
import { Modal } from '../components/common/Modal.jsx'
import { ProgressBar } from '../components/common/ProgressBar.jsx'
import { useToast } from '../components/common/ToastProvider.jsx'
import { formatMinutes, getBookChapterStats } from '../utils/bookMetrics.js'
import { countDueReviews } from '../utils/reviewQueue.js'

const bookTypes = ['工具书', '叙事', '理论', '其他']
const sourceFilters = [
  { value: 'all', label: '全部来源' },
  { value: 'manual', label: '手动添加' },
  { value: 'weread', label: '微信读书' },
]
const statusFilters = [
  { value: 'all', label: '全部状态' },
  { value: 'not_started', label: '未开始' },
  { value: 'reading', label: '阅读中' },
  { value: 'done', label: '已完成' },
]
const inputClass = 'w-full rounded-lg border border-[var(--color-border-secondary)] bg-white px-3 py-2 text-[13px] outline-none'
const libraryGridColumns = 'minmax(220px, 1.4fr) 120px 160px 150px 120px 110px'

function formatDate(value) {
  if (!value) return '无记录'
  return new Date(value).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

function SourceBadge({ book }) {
  if (book.importedFrom === 'weread') return <Badge tone="blue">微信读书</Badge>
  return <Badge tone="neutral">手动添加</Badge>
}

function getLibraryStatus(chapterStats) {
  if (chapterStats.requiredTotal === 0 || chapterStats.requiredDone === 0 && chapterStats.requiredReading === 0) return 'not_started'
  if (chapterStats.requiredDone === chapterStats.requiredTotal) return 'done'
  return 'reading'
}

function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-lg border border-[var(--color-border-tertiary)] bg-white px-3 py-2 shadow-sm">
      <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-secondary)]">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-[17px] font-medium">{value}</div>
    </div>
  )
}

function DeleteBookModal({ book, onCancel, onConfirm }) {
  return (
    <Modal title="删除书籍" onClose={onCancel}>
      <div className="space-y-4">
        <div className="rounded-lg border border-[#F5C4B3] bg-signal-orangeLight px-3 py-2 text-[13px] leading-6 text-signal-orange">
          删除「{book.title}」会同时移除章节、阅读记录、复习队列和阅读时长记录。
        </div>
        <div className="flex justify-end gap-2 border-t border-[var(--color-border-tertiary)] pt-4">
          <Button variant="secondary" onClick={onCancel}>取消</Button>
          <Button variant="warning" onClick={() => onConfirm(book.id)}><IconTrash size={16} />确认删除</Button>
        </div>
      </div>
    </Modal>
  )
}

function EditBookModal({ book, onCancel, onSave }) {
  const [form, setForm] = useState({
    title: book.title ?? '',
    author: book.author ?? '',
    type: book.type ?? '工具书',
    purpose: book.purpose ?? '',
  })
  const [submitted, setSubmitted] = useState(false)
  const hasError = submitted && (!form.title.trim() || !form.purpose.trim())

  function submit(event) {
    event.preventDefault()
    setSubmitted(true)
    if (!form.title.trim() || !form.purpose.trim()) return
    onSave({
      ...book,
      title: form.title.trim(),
      author: form.author.trim(),
      type: form.type,
      purpose: form.purpose.trim(),
    })
  }

  return (
    <Modal title="编辑书籍信息" onClose={onCancel}>
      <form className="space-y-4" onSubmit={submit}>
        {hasError ? (
          <div className="rounded-lg border border-[#F5C4B3] bg-signal-orangeLight px-3 py-2 text-[12px] text-signal-orange">
            书名和阅读目的必须填写。
          </div>
        ) : null}
        {book.importedFrom === 'weread' ? (
          <div className="rounded-lg border border-[#B5D4F4] bg-signal-blueLight px-3 py-2 text-[12px] leading-5 text-signal-blue">
            这本书来自微信读书。微信读书 ID、外部进度和来源分类会保留为同步信息；这里仅编辑深读平台内使用的基础信息。
          </div>
        ) : null}
        <div className="grid gap-4 md:grid-cols-2">
          <label>
            <span className="mb-1.5 block text-[12px] font-medium text-[var(--color-text-secondary)]">书名 <span className="text-signal-orange">*</span></span>
            <input className={inputClass} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          </label>
          <label>
            <span className="mb-1.5 block text-[12px] font-medium text-[var(--color-text-secondary)]">作者</span>
            <input className={inputClass} value={form.author} onChange={(event) => setForm({ ...form, author: event.target.value })} />
          </label>
          <label>
            <span className="mb-1.5 block text-[12px] font-medium text-[var(--color-text-secondary)]">书籍类型</span>
            <select className={inputClass} value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
              {bookTypes.map((type) => <option key={type}>{type}</option>)}
            </select>
          </label>
          <label>
            <span className="mb-1.5 block text-[12px] font-medium text-[var(--color-text-secondary)]">来源</span>
            <input className={`${inputClass} bg-[var(--color-background-secondary)] text-[var(--color-text-tertiary)]`} value={book.importedFrom === 'weread' ? '微信读书' : '手动添加'} disabled />
          </label>
        </div>
        <label className="block">
          <span className="mb-1.5 block text-[12px] font-medium text-[var(--color-text-secondary)]">阅读目的 <span className="text-signal-orange">*</span></span>
          <textarea className={`${inputClass} min-h-28 resize-y`} value={form.purpose} onChange={(event) => setForm({ ...form, purpose: event.target.value })} />
        </label>
        <div className="flex justify-end gap-2 border-t border-[var(--color-border-tertiary)] pt-4">
          <Button variant="secondary" onClick={onCancel}>取消</Button>
          <Button type="submit"><IconDeviceFloppy size={16} />保存信息</Button>
        </div>
      </form>
    </Modal>
  )
}

export function LibraryPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [books, setBooks] = useState(() => storage.getBooks())
  const [showAddBook, setShowAddBook] = useState(false)
  const [editingBook, setEditingBook] = useState(null)
  const [deletingBook, setDeletingBook] = useState(null)
  const [syncingBookId, setSyncingBookId] = useState(null)
  const [query, setQuery] = useState('')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const rows = useMemo(() => books.map((book) => {
    const chapters = storage.getChapters(book.id)
    const stats = storage.getReadingStats(book.id)
    const chapterStats = getBookChapterStats(chapters)
    const dueReviews = countDueReviews(storage.getReviewQueue(), (item) => item.bookId === book.id)
    return { book, chapters, stats, chapterStats, dueReviews, libraryStatus: getLibraryStatus(chapterStats) }
  }), [books])

  const visibleRows = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    return rows.filter(({ book, libraryStatus }) => {
      const source = book.importedFrom === 'weread' ? 'weread' : 'manual'
      const matchesSource = sourceFilter === 'all' || sourceFilter === source
      const matchesStatus = statusFilter === 'all' || statusFilter === libraryStatus
      const matchesQuery = !keyword || `${book.title} ${book.author ?? ''}`.toLowerCase().includes(keyword)
      return matchesSource && matchesStatus && matchesQuery
    })
  }, [query, rows, sourceFilter, statusFilter])

  const totals = rows.reduce((acc, row) => ({
    books: acc.books + 1,
    wereadBooks: acc.wereadBooks + (row.book.importedFrom === 'weread' ? 1 : 0),
    dueReviews: acc.dueReviews + row.dueReviews,
    minutes: acc.minutes + row.stats.totalMinutes,
  }), { books: 0, wereadBooks: 0, dueReviews: 0, minutes: 0 })

  function refresh() {
    setBooks(storage.getBooks())
  }

  function deleteBook(bookId) {
    storage.deleteBook(bookId)
    setDeletingBook(null)
    refresh()
    showToast('书籍已删除。', 'success')
  }

  function saveBook(book) {
    storage.saveBook(book)
    setEditingBook(null)
    refresh()
    showToast('书籍信息已保存。', 'success')
  }

  async function syncWereadProgress(book) {
    if (!book.wereadId) return
    try {
      setSyncingBookId(book.id)
      const connection = await wereadService.getConnectionStatus()
      if (connection.status !== WEREAD_CONNECTION_STATUS.connected) {
        showToast(`微信读书${connection.label}：${connection.detail}`, 'warning')
        return
      }
      const progress = await wereadService.getReadingProgress(book.wereadId)
      storage.saveBook({ ...book, wereadProgress: progress })
      refresh()
      showToast(`已同步「${book.title}」的微信读书进度：${progress}%。`, 'success')
    } catch {
      showToast('同步微信读书进度失败，请稍后重试。', 'error')
    } finally {
      setSyncingBookId(null)
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <section className="overflow-hidden rounded-xl border border-[var(--color-border-tertiary)] bg-white shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--color-border-tertiary)] bg-[var(--color-background-secondary)] px-5 py-4">
          <div>
            <div className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] text-[var(--color-text-tertiary)] shadow-sm">
              <IconLibraryPlus size={13} />
              管理台
            </div>
            <h1 className="mt-2 font-serif text-[22px] font-medium leading-tight">书架管理</h1>
            <p className="mt-2 max-w-2xl text-[13px] leading-6 text-[var(--color-text-secondary)]">统一查看手动添加与微信读书导入的书籍，管理来源、进度、更新时间和删除操作。</p>
          </div>
          <Button onClick={() => setShowAddBook(true)}><IconLibraryPlus size={16} />添加新书</Button>
        </div>
        <div className="grid gap-3 px-5 py-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={<IconBook2 size={14} />} label="书籍总数" value={`${totals.books} 本`} />
          <StatCard icon={<IconExternalLink size={14} />} label="微信读书导入" value={`${totals.wereadBooks} 本`} />
          <StatCard icon={<IconRefresh size={14} />} label="待复习" value={`${totals.dueReviews} 条`} />
          <StatCard icon={<IconClockHour4 size={14} />} label="累计阅读" value={formatMinutes(totals.minutes)} />
        </div>
      </section>

      <section className="rounded-xl border border-[var(--color-border-tertiary)] bg-white p-5 shadow-card">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-[13px] font-medium">全部书籍</h2>
            <p className="mt-1 text-[11px] text-[var(--color-text-tertiary)]">删除操作会同步清理该书的阅读记录和复习数据。</p>
          </div>
          <span className="rounded-full bg-[var(--color-background-secondary)] px-2.5 py-1 text-[11px] text-[var(--color-text-secondary)]">{visibleRows.length}/{rows.length} 本</span>
        </div>

        <div className="mb-4 grid gap-3 md:grid-cols-[1fr_160px_160px]">
          <label className="relative block">
            <IconSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
            <input className={`${inputClass} pl-9`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索书名或作者" />
          </label>
          <select className={inputClass} value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value)}>
            {sourceFilters.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <select className={inputClass} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            {statusFilters.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </div>

        {rows.length === 0 ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-[var(--color-border-secondary)] bg-white px-8 text-center">
            <IconLibraryPlus size={24} className="text-[var(--color-text-tertiary)]" />
            <h3 className="mt-3 font-serif text-[18px] font-medium">还没有书籍</h3>
            <p className="mt-2 text-[13px] text-[var(--color-text-secondary)]">添加一本书后，这里会显示完整管理列表。</p>
            <Button className="mt-5" onClick={() => setShowAddBook(true)}>添加新书</Button>
          </div>
        ) : visibleRows.length === 0 ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-[var(--color-border-secondary)] bg-white px-8 text-center">
            <IconSearch size={24} className="text-[var(--color-text-tertiary)]" />
            <h3 className="mt-3 font-serif text-[18px] font-medium">没有匹配的书籍</h3>
            <p className="mt-2 text-[13px] text-[var(--color-text-secondary)]">调整搜索词、来源或状态筛选后再试。</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-[var(--color-border-tertiary)]">
            <div className="grid gap-3 border-b border-[var(--color-border-tertiary)] bg-[var(--color-background-secondary)] px-4 py-3 text-[11px] font-medium text-[var(--color-text-secondary)]" style={{ gridTemplateColumns: libraryGridColumns }}>
              <span>书籍</span>
              <span>来源</span>
              <span>深读进度</span>
              <span>微信读书进度</span>
              <span>更新</span>
              <span className="text-right">操作</span>
            </div>
            <div className="divide-y divide-[var(--color-border-tertiary)]">
              {visibleRows.map(({ book, chapterStats, dueReviews }) => (
                <div key={book.id} className="grid items-center gap-3 px-4 py-3 text-[12px]" style={{ gridTemplateColumns: libraryGridColumns }}>
                  <Link to={`/book/${book.id}`} className="min-w-0">
                    <div className="truncate font-medium">{book.title}</div>
                    <div className="mt-1 truncate text-[11px] text-[var(--color-text-tertiary)]">{book.author || '未填写作者'} · {chapterStats.total} 章 · 待复习 {dueReviews}</div>
                  </Link>
                  <SourceBadge book={book} />
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-[var(--color-text-secondary)]">
                      <span>{chapterStats.requiredDone}/{chapterStats.requiredTotal}</span>
                      <span>{chapterStats.progress}%</span>
                    </div>
                    <ProgressBar value={chapterStats.progress} />
                  </div>
                  <span className="text-[12px] text-[var(--color-text-secondary)]">
                    {book.importedFrom === 'weread' ? `${book.wereadProgress ?? 0}%` : '无'}
                  </span>
                  <span className="text-[12px] text-[var(--color-text-secondary)]">{formatDate(book.updatedAt)}</span>
                  <div className="flex justify-end gap-1">
                    <Link to={`/book/${book.id}`}>
                      <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-background-tertiary)]" aria-label="查看书籍">
                        <IconExternalLink size={15} />
                      </button>
                    </Link>
                    <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-background-tertiary)]" onClick={() => setEditingBook(book)} aria-label="编辑书籍">
                      <IconEdit size={15} />
                    </button>
                    {book.importedFrom === 'weread' ? (
                      <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-signal-blue hover:bg-signal-blueLight disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={() => syncWereadProgress(book)}
                        disabled={syncingBookId === book.id}
                        aria-label="同步微信读书进度"
                      >
                        <IconRefresh size={15} className={syncingBookId === book.id ? 'animate-spin' : ''} />
                      </button>
                    ) : null}
                    <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-signal-orange hover:bg-signal-orangeLight" onClick={() => setDeletingBook(book)} aria-label="删除书籍">
                      <IconTrash size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {showAddBook ? (
        <AddBookModal
          onClose={() => setShowAddBook(false)}
          onCreated={(bookId) => {
            setShowAddBook(false)
            refresh()
            navigate(`/book/${bookId}`)
          }}
        />
      ) : null}
      {editingBook ? <EditBookModal book={editingBook} onCancel={() => setEditingBook(null)} onSave={saveBook} /> : null}
      {deletingBook ? <DeleteBookModal book={deletingBook} onCancel={() => setDeletingBook(null)} onConfirm={deleteBook} /> : null}
    </div>
  )
}
