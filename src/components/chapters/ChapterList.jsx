import { IconPlus } from '@tabler/icons-react'
import { Button } from '../common/Button.jsx'
import { ChapterListItem } from './ChapterListItem.jsx'

export function ChapterList({ chapters, onAdd, onEdit }) {
  return (
    <section className="rounded-xl border border-[var(--color-border-tertiary)] bg-white p-5 shadow-card">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[13px] font-medium">章节列表</h2>
          <p className="mt-1 text-[11px] text-[var(--color-text-tertiary)]">可随时追加或编辑章节结构</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-[var(--color-text-tertiary)]">{chapters.length} 章</span>
          <Button size="sm" variant="secondary" onClick={onAdd}><IconPlus size={14} />添加章节</Button>
        </div>
      </div>
      <div>
        {chapters.map((chapter) => <ChapterListItem key={chapter.id} chapter={chapter} onEdit={onEdit} />)}
      </div>
    </section>
  )
}
