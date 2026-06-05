import { useCallback, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { IconArrowLeft, IconBook2, IconChecklist, IconStars } from '@tabler/icons-react'
import { storage } from '../services/storage.js'
import { useAutoSave } from '../hooks/useAutoSave.js'
import { getEffectiveChapterRating, getNextReviewDate } from '../utils/reviewSchedule.js'
import { getReviewMode } from '../utils/reviewMode.js'
import { Button } from '../components/common/Button.jsx'
import { SaveStatus } from '../components/common/SaveStatus.jsx'
import { useToast } from '../components/common/ToastProvider.jsx'
import { FeynmanRecall } from '../components/reading/FeynmanRecall.jsx'
import { ToyotaSheet } from '../components/summary/ToyotaSheet.jsx'
import { MindmapPanel } from '../components/summary/MindmapPanel.jsx'
import { ChapterStarRatingSection } from '../components/summary/ChapterStarRatingSection.jsx'
import { KWLReflection } from '../components/summary/KWLReflection.jsx'

function createChapterRecord(bookId, chapterId) {
  return {
    bookId,
    chapterId,
    kwl: { k: [], w: [], l: [] },
    feynmanRecall: '',
    aiStandardAnswer: '',
    evaluation: { correct: '', missing: [], suggestion: '' },
    toyotaSheet: { background: '', problem: '', cause: '', solution: '', connection: '', connectionTags: [] },
    mindmapData: null,
    starRating: null,
    readingTime: 0,
    excerpts: [],
    feynmanThinking: { concepts: '', firstPrinciple: '', minUnit: '', deepConnection: '', oneLineConclusion: '' },
  }
}

export function ChapterSummaryPage() {
  const { bookId, chapterId } = useParams()
  const book = storage.getBook(bookId)
  const chapter = storage.getChapter(bookId, chapterId)
  const [record, setRecord] = useState(() => storage.getChapterRecord(bookId, chapterId) ?? createChapterRecord(bookId, chapterId))
  const { showToast } = useToast()
  const sectionRatings = useMemo(() => {
    if (!chapter) return []
    return Array.from({ length: chapter.sectionCount }, (_, index) => storage.getSectionRecord(bookId, chapterId, `section_${index + 1}`)?.starRating).filter(Boolean)
  }, [bookId, chapterId, chapter])

  const saveRecord = useCallback((nextRecord) => storage.saveChapterRecord(bookId, chapterId, nextRecord), [bookId, chapterId])
  const saveStatus = useAutoSave(record, saveRecord)

  if (!book || !chapter) {
    return <div className="rounded-xl bg-white p-6 text-[13px]">章节不存在。</div>
  }

  function updateChapterRating(starRating) {
    const nextRecord = { ...record, starRating }
    setRecord(nextRecord)
    storage.saveChapterRecord(bookId, chapterId, nextRecord)
    storage.saveChapter({ ...chapter, status: 'done', starRating, completedAt: new Date().toISOString() })
    const effective = getEffectiveChapterRating(starRating, sectionRatings)
    if (effective) {
      storage.updateReviewItem(`${bookId}:${chapterId}:chapter`, {
        bookId,
        chapterId,
        sectionId: null,
        title: chapter.title,
        source: `${book.title} · 第 ${chapter.order} 章`,
        starRating: effective,
        reviewCount: 0,
        nextReviewDate: getNextReviewDate(effective, 0),
        lastReviewDate: null,
        reviewMode: getReviewMode(effective, 0),
      })
      showToast(`已按有效星级生成复习计划：${effective} 星。`, 'success')
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <section className="overflow-hidden rounded-xl border border-[var(--color-border-tertiary)] bg-white shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--color-border-tertiary)] bg-[var(--color-background-secondary)] px-5 py-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--color-text-tertiary)]">
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 shadow-sm"><IconBook2 size={13} />{book.title}</span>
              <span>第 {chapter.order} 章总结</span>
            </div>
            <h1 className="mt-2 font-serif text-[22px] font-medium leading-tight">{chapter.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-[var(--color-text-secondary)]">
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 shadow-sm"><IconChecklist size={13} />已评小节 {sectionRatings.length}/{chapter.sectionCount}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 shadow-sm"><IconStars size={13} />{record.starRating ? `${record.starRating} 星` : '未评星'}</span>
              <span className="rounded-full bg-white px-2.5 py-1 shadow-sm">总结工作台</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SaveStatus status={saveStatus} />
            <Link to={`/book/${bookId}/chapter/${chapterId}`}>
              <Button variant="secondary"><IconArrowLeft size={16} />返回阅读</Button>
            </Link>
          </div>
        </div>
        <div className="grid gap-3 px-5 py-4 text-[12px] text-[var(--color-text-secondary)] md:grid-cols-3">
          <div className="rounded-lg border border-[var(--color-border-tertiary)] bg-white p-3">
            <div className="font-medium text-[var(--color-text-primary)]">1. 复述</div>
            <p className="mt-1">用自己的话讲完整章。</p>
          </div>
          <div className="rounded-lg border border-[var(--color-border-tertiary)] bg-white p-3">
            <div className="font-medium text-[var(--color-text-primary)]">2. 结构化</div>
            <p className="mt-1">沉淀一页纸与思维导图。</p>
          </div>
          <div className="rounded-lg border border-[var(--color-border-tertiary)] bg-white p-3">
            <div className="font-medium text-[var(--color-text-primary)]">3. 入队</div>
            <p className="mt-1">按掌握度生成复习计划。</p>
          </div>
        </div>
      </section>

      <FeynmanRecall
        title="我的整章费曼复述"
        aiContext={chapter.title}
        hint="整合所有小节后，用自己的话讲完整章。"
        value={record.feynmanRecall}
        onChange={(feynmanRecall) => setRecord({ ...record, feynmanRecall })}
        standardAnswer={record.aiStandardAnswer}
        onStandardAnswer={(aiStandardAnswer) => setRecord({ ...record, aiStandardAnswer })}
        evaluation={record.evaluation}
        onEvaluation={(evaluation) => setRecord({ ...record, evaluation })}
        starRating={record.starRating}
        onStarRating={updateChapterRating}
        starLabel="章节掌握"
      />

      <ToyotaSheet value={record.toyotaSheet} onChange={(toyotaSheet) => setRecord({ ...record, toyotaSheet })} chapterTitle={chapter.title} />
      <MindmapPanel value={record.mindmapData} onChange={(mindmapData) => setRecord({ ...record, mindmapData })} chapterTitle={chapter.title} />
      <ChapterStarRatingSection chapterRating={record.starRating} sectionRatings={sectionRatings} onChange={updateChapterRating} />
      <KWLReflection kwl={record.kwl} onChange={(kwl) => setRecord({ ...record, kwl })} />
    </div>
  )
}
