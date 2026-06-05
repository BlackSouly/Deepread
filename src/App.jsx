import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout.jsx'
import { BookshelfPage } from './pages/BookshelfPage.jsx'
import { BookOverviewPage } from './pages/BookOverviewPage.jsx'
import { ChapterReadingPage } from './pages/ChapterReadingPage.jsx'
import { ChapterSummaryPage } from './pages/ChapterSummaryPage.jsx'
import { ReviewQueuePage } from './pages/ReviewQueuePage.jsx'
import { LibraryPage } from './pages/LibraryPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<BookshelfPage />} />
        <Route path="book/:bookId" element={<BookOverviewPage />} />
        <Route path="book/:bookId/chapter/:chapterId" element={<ChapterReadingPage />} />
        <Route path="book/:bookId/chapter/:chapterId/summary" element={<ChapterSummaryPage />} />
        <Route path="review" element={<ReviewQueuePage />} />
        <Route path="library" element={<LibraryPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
