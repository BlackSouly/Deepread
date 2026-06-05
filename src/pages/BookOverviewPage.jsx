import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { IconArrowLeft } from '@tabler/icons-react'
import { storage } from '../services/storage.js'
import { Button } from '../components/common/Button.jsx'
import { BookHeroCard } from '../components/books/BookHeroCard.jsx'
import { BookStatsGrid } from '../components/books/BookStatsGrid.jsx'
import { ChapterList } from '../components/chapters/ChapterList.jsx'
import { ChapterEditorModal } from '../components/chapters/ChapterEditorModal.jsx'
import { ReadingHeatmap } from '../components/books/ReadingHeatmap.jsx'
import { countDueReviews } from '../utils/reviewQueue.js'

export function BookOverviewPage() {
  const { bookId } = useParams()
  const [book, setBook] = useState(() => storage.getBook(bookId))
  const [chapters, setChapters] = useState(() => storage.getChapters(bookId))
  const [editingChapter, setEditingChapter] = useState(null)
  const [showChapterEditor, setShowChapterEditor] = useState(false)

  if (!book) {
    return (
      <div className="rounded-xl border border-[var(--color-border-tertiary)] bg-white p-6">
        <h1 className="font-serif text-[20px] font-medium">未找到书籍</h1>
        <p className="mt-2 text-[13px] text-[var(--color-text-secondary)]">当前书籍不存在或已被删除。</p>
        <Link to="/" className="mt-4 inline-block">
          <Button variant="secondary"><IconArrowLeft size={16} />返回书架</Button>
        </Link>
      </div>
    )
  }

  const stats = storage.getReadingStats(bookId)
  const reviewCount = countDueReviews(storage.getReviewQueue(), (item) => item.bookId === bookId)

  function refreshChapters() {
    const nextChapters = storage.getChapters(bookId)
    setChapters(nextChapters)
    setBook(storage.saveBook({ ...book, totalChapters: nextChapters.length }))
  }

  function openAddChapter() {
    setEditingChapter(null)
    setShowChapterEditor(true)
  }

  function openEditChapter(chapter) {
    setEditingChapter(chapter)
    setShowChapterEditor(true)
  }

  function saveChapter(chapter) {
    storage.saveChapter({ ...chapter, bookId })
    setShowChapterEditor(false)
    setEditingChapter(null)
    refreshChapters()
  }

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      <BookHeroCard book={book} chapters={chapters} />
      <BookStatsGrid chapters={chapters} stats={stats} reviewCount={reviewCount} />
      <div className="grid gap-4 xl:grid-cols-[1fr_300px]">
        <ChapterList chapters={chapters} onAdd={openAddChapter} onEdit={openEditChapter} />
        <ReadingHeatmap logs={stats.logs} />
      </div>
      {showChapterEditor ? (
        <ChapterEditorModal
          chapter={editingChapter}
          nextOrder={chapters.length + 1}
          onClose={() => setShowChapterEditor(false)}
          onSave={saveChapter}
        />
      ) : null}
    </div>
  )
}
