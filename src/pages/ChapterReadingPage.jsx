import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { IconArrowLeft, IconBook2, IconChecklist, IconListDetails } from '@tabler/icons-react'
import { storage } from '../services/storage.js'
import { useAutoSave } from '../hooks/useAutoSave.js'
import { useReadingTimer } from '../hooks/useReadingTimer.js'
import { getChapterProgress } from '../utils/progress.js'
import { getNextReviewDate } from '../utils/reviewSchedule.js'
import { getReviewMode } from '../utils/reviewMode.js'
import { Button } from '../components/common/Button.jsx'
import { SaveStatus } from '../components/common/SaveStatus.jsx'
import { useToast } from '../components/common/ToastProvider.jsx'
import { KWLPanel } from '../components/reading/KWLPanel.jsx'
import { FeynmanRecall } from '../components/reading/FeynmanRecall.jsx'
import { FeynmanThinkingPanel } from '../components/reading/FeynmanThinkingPanel.jsx'
import { ChapterSidePanel } from '../components/reading/ChapterSidePanel.jsx'
import { ImportanceControl } from '../components/reading/ImportanceControl.jsx'

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

function createSectionRecord(bookId, chapterId, sectionId, title) {
  return {
    bookId,
    chapterId,
    sectionId,
    title,
    feynmanRecall: '',
    aiStandardAnswer: '',
    evaluation: {},
    starRating: null,
    excerpts: [],
  }
}

export function ChapterReadingPage() {
  const { bookId, chapterId } = useParams()
  const book = storage.getBook(bookId)
  const initialChapter = storage.getChapter(bookId, chapterId)
  const [chapter, setChapter] = useState(initialChapter)
  const { showToast } = useToast()
  useReadingTimer(bookId, chapterId)

  useEffect(() => {
    if (chapter?.status === 'pending') {
      const nextChapter = storage.saveChapter({ ...chapter, status: 'reading' })
      setChapter(nextChapter)
    }
  }, [chapter])

  const [record, setRecord] = useState(() => storage.getChapterRecord(bookId, chapterId) ?? createChapterRecord(bookId, chapterId))
  const sections = useMemo(() => {
    if (!chapter) return []
    return Array.from({ length: chapter.sectionCount }, (_, index) => ({
      id: `section_${index + 1}`,
      title: `小节 ${index + 1}`,
    }))
  }, [chapter])
  const [activeSectionId, setActiveSectionId] = useState(sections[0]?.id ?? 'section_1')
  const [sectionRecords, setSectionRecords] = useState(() =>
    sections.map((section) => storage.getSectionRecord(bookId, chapterId, section.id) ?? createSectionRecord(bookId, chapterId, section.id, section.title)),
  )

  const saveRecord = useCallback((nextRecord) => storage.saveChapterRecord(bookId, chapterId, nextRecord), [bookId, chapterId])
  const recordSaveStatus = useAutoSave(record, saveRecord)

  const sectionSaveStatus = useAutoSave(
    sectionRecords,
    useCallback((records) => {
      records.forEach((item) => storage.saveSectionRecord(bookId, chapterId, item.sectionId, item))
    }, [bookId, chapterId]),
  )

  if (!book || !chapter) {
    return <div className="rounded-xl bg-white p-6 text-[13px]">章节不存在。</div>
  }

  const activeSection = sectionRecords.find((section) => section.sectionId === activeSectionId) ?? sectionRecords[0]
  const progress = getChapterProgress(record, sectionRecords, chapter)
  const saveStatus = recordSaveStatus === 'error' || sectionSaveStatus === 'error'
    ? 'error'
    : recordSaveStatus === 'saving' || sectionSaveStatus === 'saving'
      ? 'saving'
      : recordSaveStatus === 'saved' || sectionSaveStatus === 'saved'
        ? 'saved'
        : 'idle'

  function updateActiveSection(patch) {
    setSectionRecords((current) =>
      current.map((section) => {
        if (section.sectionId !== activeSectionId) return section
        const nextSection = { ...section, ...patch }
        storage.saveSectionRecord(bookId, chapterId, section.sectionId, nextSection)
        return nextSection
      }),
    )
  }

  function createReviewForSection(rating) {
    if (!rating) return
    const nextReviewDate = getNextReviewDate(rating, 0)
    storage.updateReviewItem(`${bookId}:${chapterId}:${activeSectionId}`, {
      bookId,
      chapterId,
      sectionId: activeSectionId,
      title: activeSection.title,
      source: `${book.title} · 第 ${chapter.order} 章`,
      starRating: rating,
      reviewCount: 0,
      nextReviewDate,
      lastReviewDate: null,
      reviewMode: getReviewMode(rating, 0),
    })
    showToast('已加入复习队列。', 'success')
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <section className="overflow-hidden rounded-xl border border-[var(--color-border-tertiary)] bg-white shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--color-border-tertiary)] bg-[var(--color-background-secondary)] px-5 py-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--color-text-tertiary)]">
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 shadow-sm"><IconBook2 size={13} />{book.title}</span>
              <span>第 {chapter.order} 章</span>
            </div>
            <h1 className="mt-2 font-serif text-[22px] font-medium leading-tight">{chapter.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-[var(--color-text-secondary)]">
              <span className="rounded-full bg-white px-2.5 py-1 shadow-sm">小节 {chapter.sectionCount}</span>
              <span className="rounded-full bg-white px-2.5 py-1 shadow-sm">完成度 {progress.percent}%</span>
              <span className="rounded-full bg-white px-2.5 py-1 shadow-sm">{chapter.importance === 'key' ? '关键章节' : chapter.importance === 'ignored' ? '已忽略' : '普通章节'}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SaveStatus status={saveStatus} />
            <Link to={`/book/${bookId}`}><Button variant="secondary" size="sm"><IconArrowLeft size={15} />总览</Button></Link>
            <Link to={`/book/${bookId}/chapter/${chapterId}/summary`}><Button size="sm"><IconChecklist size={15} />总结</Button></Link>
          </div>
        </div>
        <div className="px-5 py-4">
          <ImportanceControl
            chapter={chapter}
            bookPurpose={book.purpose}
            onChange={(nextChapter) => {
              const saved = storage.saveChapter(nextChapter)
              setChapter(saved)
              showToast('章节重要性已更新。', 'success')
            }}
          />
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <main className="space-y-4">
          <KWLPanel value={record.kwl} onChange={(kwl) => setRecord({ ...record, kwl })} />

          <section className="rounded-xl border border-[var(--color-border-tertiary)] bg-white p-3 shadow-card">
            <div className="mb-2 flex items-center gap-2 px-1 text-[12px] font-medium text-[var(--color-text-primary)]">
              <IconListDetails size={15} />
              小节练习
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-thin">
              {sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  className={`whitespace-nowrap border-b-2 px-3 py-2 text-[12px] font-medium ${activeSectionId === section.id ? 'border-brand-500 text-brand-900' : 'border-transparent text-[var(--color-text-secondary)]'}`}
                  onClick={() => setActiveSectionId(section.id)}
                >
                  {section.title}
                </button>
              ))}
            </div>
          </section>

          {activeSection ? (
            <FeynmanRecall
              title={`我的费曼复述 · ${activeSection.title}`}
              aiContext={`${chapter.title} · ${activeSection.title}`}
              value={activeSection.feynmanRecall}
              onChange={(feynmanRecall) => updateActiveSection({ feynmanRecall })}
              standardAnswer={activeSection.aiStandardAnswer}
              onStandardAnswer={(aiStandardAnswer) => updateActiveSection({ aiStandardAnswer })}
              evaluation={activeSection.evaluation}
              onEvaluation={(evaluation) => updateActiveSection({ evaluation })}
              starRating={activeSection.starRating}
              onStarRating={(starRating) => {
                updateActiveSection({ starRating })
                createReviewForSection(starRating)
              }}
            />
          ) : null}

          {chapter.importance === 'key' ? (
            <FeynmanThinkingPanel value={record.feynmanThinking} onChange={(feynmanThinking) => setRecord({ ...record, feynmanThinking })} />
          ) : null}
        </main>

        <ChapterSidePanel
          excerpts={record.excerpts ?? []}
          onExcerptsChange={(excerpts) => setRecord({ ...record, excerpts })}
          progress={progress}
          isKeyChapter={chapter.importance === 'key'}
        />
      </div>
    </div>
  )
}
