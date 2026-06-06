import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { IconBook2, IconBookUpload, IconCheck, IconClockHour4, IconExternalLink, IconPlus, IconRefresh } from '@tabler/icons-react'
import { storage } from '../services/storage.js'
import { Button } from '../components/common/Button.jsx'
import { EmptyState } from '../components/common/EmptyState.jsx'
import { BookCard } from '../components/books/BookCard.jsx'
import { AddBookModal } from '../components/books/AddBookModal.jsx'
import { WereadImportModal } from '../components/books/WereadImportModal.jsx'
import { getBookChapterStats } from '../utils/bookMetrics.js'
import { countDueReviews } from '../utils/reviewQueue.js'

function BookshelfStat({ icon, label, value }) {
  return (
    <div className="rounded-lg border border-[var(--color-border-tertiary)] bg-white px-3 py-2 shadow-sm">
      <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-secondary)]">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-[17px] font-medium text-[var(--color-text-primary)]">{value}</div>
    </div>
  )
}

export function BookshelfPage() {
  const navigate = useNavigate()
  const [books, setBooks] = useState(() => storage.getBooks())
  const [showAddBook, setShowAddBook] = useState(false)
  const [showWereadImport, setShowWereadImport] = useState(false)
  const [importedBooks, setImportedBooks] = useState([])
  const bookshelfStats = books.reduce((acc, book) => {
    const chapters = storage.getChapters(book.id)
    const chapterStats = getBookChapterStats(chapters)
    const stats = storage.getReadingStats(book.id)
    return {
      totalChapters: acc.totalChapters + chapterStats.requiredTotal,
      doneChapters: acc.doneChapters + chapterStats.requiredDone,
      readingBooks: acc.readingBooks + (chapterStats.progress > 0 && chapterStats.progress < 100 ? 1 : 0),
      totalMinutes: acc.totalMinutes + stats.totalMinutes,
    }
  }, { totalChapters: 0, doneChapters: 0, readingBooks: 0, totalMinutes: 0 })
  const dueReviewCount = countDueReviews(storage.getReviewQueue())

  function refreshBooks() {
    setBooks(storage.getBooks())
  }

  function handleCreated(bookId) {
    setShowAddBook(false)
    refreshBooks()
    navigate(`/book/${bookId}`)
  }

  function handleWereadImported(nextImportedBooks = []) {
    setShowWereadImport(false)
    setImportedBooks(nextImportedBooks)
    refreshBooks()
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <section className="overflow-hidden rounded-xl border border-[var(--color-border-tertiary)] bg-white shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--color-border-tertiary)] bg-[var(--color-background-secondary)] px-5 py-4">
          <div>
            <div className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] text-[var(--color-text-tertiary)] shadow-sm">
              <IconBook2 size={13} />
              阅读驾驶舱
            </div>
            <h1 className="mt-2 font-serif text-[22px] font-medium leading-tight">我的书架</h1>
            <p className="mt-2 max-w-2xl text-[13px] leading-6 text-[var(--color-text-secondary)]">用结构化方法推进每一本书的深度阅读，把章节复述、总结和复习计划串成一条持续路径。</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setShowWereadImport(true)}>
              <IconBookUpload size={16} />
              从微信读书导入
            </Button>
            <Button onClick={() => setShowAddBook(true)}>
              <IconPlus size={16} />
              手动添加
            </Button>
          </div>
        </div>
        <div className="grid gap-3 px-5 py-4 sm:grid-cols-2 lg:grid-cols-4">
          <BookshelfStat icon={<IconBook2 size={14} />} label="书籍" value={`${books.length} 本`} />
          <BookshelfStat icon={<IconBookUpload size={14} />} label="章节完成" value={`${bookshelfStats.doneChapters}/${bookshelfStats.totalChapters}`} />
          <BookshelfStat icon={<IconClockHour4 size={14} />} label="累计阅读" value={`${bookshelfStats.totalMinutes} 分钟`} />
          <BookshelfStat icon={<IconRefresh size={14} />} label="今日复习" value={`${dueReviewCount} 条`} />
        </div>
      </section>

      {importedBooks.length > 0 ? (
        <section className="rounded-xl border border-brand-200 bg-brand-50 px-5 py-4 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-[13px] font-medium text-brand-900">
                <IconCheck size={16} />
                已从微信读书导入 {importedBooks.length} 本书
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {importedBooks.map((book) => (
                  <Link key={book.id} to={`/book/${book.id}`} className="inline-flex items-center gap-1 rounded-full border border-brand-200 bg-white px-2.5 py-1 text-[11px] text-brand-900">
                    {book.title}
                    <IconExternalLink size={12} />
                  </Link>
                ))}
              </div>
            </div>
            <button type="button" className="text-[11px] text-brand-900 hover:underline" onClick={() => setImportedBooks([])}>收起</button>
          </div>
        </section>
      ) : null}

      {books.length === 0 ? (
        <EmptyState
          icon={<IconBookUpload size={24} />}
          title="书架还是空的"
          description="添加第一本书，填写阅读目的和章节列表，深读会为你建立阅读路径。"
          action={<Button onClick={() => setShowAddBook(true)}>添加新书</Button>}
        />
      ) : (
        <section className="rounded-xl border border-[var(--color-border-tertiary)] bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-[13px] font-medium">正在推进</h2>
              <p className="mt-1 text-[11px] text-[var(--color-text-tertiary)]">进入一本书，继续章节阅读、总结和复习。</p>
            </div>
            <span className="rounded-full bg-[var(--color-background-secondary)] px-2.5 py-1 text-[11px] text-[var(--color-text-secondary)]">{bookshelfStats.readingBooks} 本阅读中</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {books.map((book) => <BookCard key={book.id} book={book} />)}
          </div>
        </section>
      )}

      {showAddBook ? <AddBookModal onClose={() => setShowAddBook(false)} onCreated={handleCreated} /> : null}
      {showWereadImport ? <WereadImportModal onClose={() => setShowWereadImport(false)} onImported={handleWereadImported} /> : null}
    </div>
  )
}
