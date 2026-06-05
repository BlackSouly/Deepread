import { storage } from './storage.js'

const bookId = 'book_deep_work'
const chapterIds = ['chapter_1', 'chapter_2', 'chapter_3', 'chapter_4']

export function initializeSeedData() {
  if (typeof window === 'undefined') return
  if (storage.hasValidSchema()) return

  const now = new Date()
  const day = 24 * 60 * 60 * 1000

  storage.replaceAll({
    books: [
      {
        id: bookId,
        title: '深度工作',
        author: 'Cal Newport',
        type: '工具书',
        purpose: '建立稳定的专注阅读和输出系统，把零散知识转化为可复述、可复习的理解。',
        coverImage: '',
        isbn: '',
        totalChapters: chapterIds.length,
        createdAt: new Date(now.getTime() - 12 * day).toISOString(),
        updatedAt: now.toISOString(),
      },
    ],
    chapters: [
      {
        id: chapterIds[0],
        bookId,
        order: 1,
        title: '深度工作是一种稀缺能力',
        sectionCount: 3,
        importance: 'key',
        importanceSource: 'manual',
        aiSuggestionReason: '',
        status: 'done',
        starRating: 3,
        completedAt: new Date(now.getTime() - 4 * day).toISOString(),
      },
      {
        id: chapterIds[1],
        bookId,
        order: 2,
        title: '拥抱无聊',
        sectionCount: 3,
        importance: 'normal',
        importanceSource: 'ai',
        aiSuggestionReason: '这一章直接关联阅读目的中的专注训练，建议重点关注。',
        status: 'reading',
        starRating: null,
        completedAt: null,
      },
      {
        id: chapterIds[2],
        bookId,
        order: 3,
        title: '像经商一样执行',
        sectionCount: 2,
        importance: 'normal',
        importanceSource: 'manual',
        aiSuggestionReason: '',
        status: 'pending',
        starRating: null,
        completedAt: null,
      },
      {
        id: chapterIds[3],
        bookId,
        order: 4,
        title: '减少肤浅工作',
        sectionCount: 2,
        importance: 'ignored',
        importanceSource: 'manual',
        aiSuggestionReason: '',
        status: 'pending',
        starRating: null,
        completedAt: null,
      },
    ],
    chapterRecords: [
      {
        id: `${bookId}:${chapterIds[0]}`,
        bookId,
        chapterId: chapterIds[0],
        kwl: {
          k: ['专注力会被频繁切换任务削弱'],
          w: ['为什么深度工作在现代职业中更有价值？'],
          l: ['稀缺能力在复杂工作中会放大个人产出差异'],
        },
        feynmanRecall: '',
        aiStandardAnswer: '',
        evaluation: { correct: '', missing: [], suggestion: '' },
        toyotaSheet: {
          background: '',
          problem: '',
          cause: '',
          solution: '',
          connection: '',
          connectionTags: [],
        },
        mindmapData: null,
        starRating: 3,
        readingTime: 46,
        excerpts: [
          {
            id: 'excerpt_1',
            content: '高质量工作产出 = 时间 x 专注强度。',
            source: 'p. 38',
          },
        ],
        feynmanThinking: {
          concepts: '',
          firstPrinciple: '',
          minUnit: '',
          deepConnection: '',
          oneLineConclusion: '',
        },
        updatedAt: now.toISOString(),
      },
    ],
    sectionRecords: [],
    reviewQueue: [
      {
        id: 'review_1',
        bookId,
        chapterId: chapterIds[0],
        sectionId: null,
        title: '深度工作是一种稀缺能力',
        source: '深度工作 · 第 1 章',
        starRating: 3,
        reviewCount: 0,
        nextReviewDate: new Date(now.getTime() - day).toISOString(),
        lastReviewDate: null,
        reviewMode: 'card',
      },
    ],
    readingLogs: [
      {
        id: 'reading_1',
        bookId,
        chapterId: chapterIds[0],
        minutes: 24,
        createdAt: new Date(now.getTime() - 4 * day).toISOString(),
      },
      {
        id: 'reading_2',
        bookId,
        chapterId: chapterIds[0],
        minutes: 22,
        createdAt: new Date(now.getTime() - 3 * day).toISOString(),
      },
    ],
  })
}
