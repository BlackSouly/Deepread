const KEYS = {
  schemaVersion: 'deepread.schemaVersion',
  books: 'deepread.books',
  chapters: 'deepread.chapters',
  chapterRecords: 'deepread.chapterRecords',
  sectionRecords: 'deepread.sectionRecords',
  reviewQueue: 'deepread.reviewQueue',
  readingLogs: 'deepread.readingLogs',
}

export const STORAGE_SCHEMA_VERSION = '1'

function readCollection(key) {
  const raw = window.localStorage.getItem(key)
  if (raw === null) return []
  const parsed = JSON.parse(raw)
  if (!Array.isArray(parsed)) {
    throw new Error(`Storage key ${key} must contain an array`)
  }
  return parsed
}

function writeCollection(key, value) {
  if (!Array.isArray(value)) {
    throw new Error(`Storage key ${key} only accepts arrays`)
  }
  window.localStorage.setItem(key, JSON.stringify(value))
  window.dispatchEvent(new CustomEvent('deepread-storage-change', { detail: { key } }))
}

function nowIso() {
  return new Date().toISOString()
}

function upsertById(items, item) {
  const index = items.findIndex((entry) => entry.id === item.id)
  if (index === -1) return [...items, item]
  return items.map((entry) => (entry.id === item.id ? item : entry))
}

export function createId(prefix) {
  return `${prefix}_${crypto.randomUUID()}`
}

export const storage = {
  getBooks() {
    return readCollection(KEYS.books).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  },

  getBook(bookId) {
    return readCollection(KEYS.books).find((book) => book.id === bookId) ?? null
  },

  saveBook(book) {
    const books = readCollection(KEYS.books)
    const timestamp = nowIso()
    const nextBook = {
      ...book,
      id: book.id ?? createId('book'),
      createdAt: book.createdAt ?? timestamp,
      updatedAt: timestamp,
    }
    writeCollection(KEYS.books, upsertById(books, nextBook))
    return nextBook
  },

  deleteBook(bookId) {
    writeCollection(
      KEYS.books,
      readCollection(KEYS.books).filter((book) => book.id !== bookId),
    )
    writeCollection(
      KEYS.chapters,
      readCollection(KEYS.chapters).filter((chapter) => chapter.bookId !== bookId),
    )
    writeCollection(
      KEYS.chapterRecords,
      readCollection(KEYS.chapterRecords).filter((record) => record.bookId !== bookId),
    )
    writeCollection(
      KEYS.sectionRecords,
      readCollection(KEYS.sectionRecords).filter((record) => record.bookId !== bookId),
    )
    writeCollection(
      KEYS.reviewQueue,
      readCollection(KEYS.reviewQueue).filter((item) => item.bookId !== bookId),
    )
    writeCollection(
      KEYS.readingLogs,
      readCollection(KEYS.readingLogs).filter((log) => log.bookId !== bookId),
    )
  },

  getChapters(bookId) {
    return readCollection(KEYS.chapters)
      .filter((chapter) => chapter.bookId === bookId)
      .sort((a, b) => a.order - b.order)
  },

  getChapter(bookId, chapterId) {
    return readCollection(KEYS.chapters).find((chapter) => chapter.bookId === bookId && chapter.id === chapterId) ?? null
  },

  saveChapter(chapter) {
    const chapters = readCollection(KEYS.chapters)
    const nextChapter = {
      ...chapter,
      id: chapter.id ?? createId('chapter'),
    }
    writeCollection(KEYS.chapters, upsertById(chapters, nextChapter))
    return nextChapter
  },

  getChapterRecord(bookId, chapterId) {
    return (
      readCollection(KEYS.chapterRecords).find((record) => record.bookId === bookId && record.chapterId === chapterId) ??
      null
    )
  },

  saveChapterRecord(bookId, chapterId, record) {
    const records = readCollection(KEYS.chapterRecords)
    const nextRecord = {
      bookId,
      chapterId,
      ...record,
      id: record.id ?? `${bookId}:${chapterId}`,
      updatedAt: nowIso(),
    }
    writeCollection(KEYS.chapterRecords, upsertById(records, nextRecord))
    return nextRecord
  },

  getSectionRecord(bookId, chapterId, sectionId) {
    return (
      readCollection(KEYS.sectionRecords).find(
        (record) => record.bookId === bookId && record.chapterId === chapterId && record.sectionId === sectionId,
      ) ?? null
    )
  },

  saveSectionRecord(bookId, chapterId, sectionId, record) {
    const records = readCollection(KEYS.sectionRecords)
    const nextRecord = {
      bookId,
      chapterId,
      sectionId,
      ...record,
      id: record.id ?? `${bookId}:${chapterId}:${sectionId}`,
      updatedAt: nowIso(),
    }
    writeCollection(KEYS.sectionRecords, upsertById(records, nextRecord))
    return nextRecord
  },

  getReviewQueue() {
    return readCollection(KEYS.reviewQueue).sort((a, b) => new Date(a.nextReviewDate) - new Date(b.nextReviewDate))
  },

  updateReviewItem(itemId, data) {
    const queue = readCollection(KEYS.reviewQueue)
    const existing = queue.find((item) => item.id === itemId)
    const nextItem = {
      ...(existing ?? { id: itemId }),
      ...data,
      updatedAt: nowIso(),
    }
    writeCollection(KEYS.reviewQueue, upsertById(queue, nextItem))
    return nextItem
  },

  logReadingTime(bookId, chapterId, minutes) {
    if (minutes <= 0) return null
    const logs = readCollection(KEYS.readingLogs)
    const log = {
      id: createId('reading'),
      bookId,
      chapterId,
      minutes,
      createdAt: nowIso(),
    }
    writeCollection(KEYS.readingLogs, [...logs, log])
    return log
  },

  getReadingStats(bookId) {
    const logs = readCollection(KEYS.readingLogs).filter((log) => log.bookId === bookId)
    const totalMinutes = logs.reduce((sum, log) => sum + log.minutes, 0)
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - 7)
    const weekMinutes = logs
      .filter((log) => new Date(log.createdAt) >= weekStart)
      .reduce((sum, log) => sum + log.minutes, 0)
    return { logs, totalMinutes, weekMinutes }
  },

  replaceAll(nextData) {
    Object.entries(KEYS).forEach(([name, key]) => {
      if (name === 'schemaVersion') return
      if (nextData[name]) writeCollection(key, nextData[name])
    })
    window.localStorage.setItem(KEYS.schemaVersion, STORAGE_SCHEMA_VERSION)
  },

  getSchemaVersion() {
    return window.localStorage.getItem(KEYS.schemaVersion)
  },

  hasValidSchema() {
    if (window.localStorage.getItem(KEYS.schemaVersion) !== STORAGE_SCHEMA_VERSION) return false
    try {
      return Object.entries(KEYS).every(([name, key]) => {
        if (name === 'schemaVersion') return true
        const raw = window.localStorage.getItem(key)
        if (raw === null) return false
        return Array.isArray(JSON.parse(raw))
      })
    } catch {
      return false
    }
  },
}
