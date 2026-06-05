import { useState } from 'react'
import { ExcerptPanel } from './ExcerptPanel.jsx'
import { ProgressPanel } from './ProgressPanel.jsx'

export function ChapterSidePanel({ excerpts, onExcerptsChange, progress, isKeyChapter }) {
  const [tab, setTab] = useState('excerpts')
  return (
    <aside className="rounded-xl border border-[var(--color-border-tertiary)] bg-white p-4 shadow-card xl:sticky xl:top-20 xl:self-start">
      <div className="mb-4 inline-flex rounded-full bg-[var(--color-background-tertiary)] p-1">
        <button className={`rounded-full px-3 py-1.5 text-[12px] ${tab === 'excerpts' ? 'bg-white shadow-sm' : 'text-[var(--color-text-secondary)]'}`} onClick={() => setTab('excerpts')}>摘录</button>
        <button className={`rounded-full px-3 py-1.5 text-[12px] ${tab === 'progress' ? 'bg-white shadow-sm' : 'text-[var(--color-text-secondary)]'}`} onClick={() => setTab('progress')}>本章进度</button>
      </div>
      {tab === 'excerpts' ? <ExcerptPanel excerpts={excerpts} onChange={onExcerptsChange} /> : <ProgressPanel progress={progress} isKeyChapter={isKeyChapter} />}
    </aside>
  )
}
