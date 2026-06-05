import { useEffect } from 'react'
import { storage } from '../services/storage.js'

export function useReadingTimer(bookId, chapterId) {
  useEffect(() => {
    if (!bookId || !chapterId) return undefined
    const startedAt = Date.now()

    return () => {
      const minutes = Math.max(1, Math.round((Date.now() - startedAt) / 60000))
      storage.logReadingTime(bookId, chapterId, minutes)
    }
  }, [bookId, chapterId])
}
