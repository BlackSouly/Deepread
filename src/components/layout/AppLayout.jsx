import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { storage } from '../../services/storage.js'
import { countDueReviews } from '../../utils/reviewQueue.js'
import { TopNav } from './TopNav.jsx'
import { BookSidebar } from './BookSidebar.jsx'

export function AppLayout() {
  const location = useLocation()
  const showBookSidebar = location.pathname.startsWith('/book/')
  const bookId = location.pathname.match(/^\/book\/([^/]+)/)?.[1]
  const [reviewCount, setReviewCount] = useState(() => countDueReviews(storage.getReviewQueue()))

  useEffect(() => {
    function updateReviewCount() {
      setReviewCount(countDueReviews(storage.getReviewQueue()))
    }

    updateReviewCount()
    window.addEventListener('deepread-storage-change', updateReviewCount)
    return () => window.removeEventListener('deepread-storage-change', updateReviewCount)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-[var(--color-background-primary)]">
      <TopNav reviewCount={reviewCount} />
      <div className="flex">
        {showBookSidebar ? <BookSidebar bookId={bookId} /> : null}
        <main className="min-w-0 flex-1 p-5">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
