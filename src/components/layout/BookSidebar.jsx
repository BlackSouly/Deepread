import { NavLink } from 'react-router-dom'
import { IconBooks, IconChecklist, IconFileText, IconLayoutDashboard, IconLibraryPlus, IconQuestionMark, IconRefresh } from '@tabler/icons-react'
import { storage } from '../../services/storage.js'
import { getNextChapter } from '../../utils/bookMetrics.js'
import { countDueReviews } from '../../utils/reviewQueue.js'

function SidebarLink({ to, icon, children, disabled = false, end = false }) {
  if (disabled) {
    return (
      <div className="flex items-center justify-between rounded-lg px-3 py-2 text-[12px] text-[var(--color-text-tertiary)]">
        <span className="flex items-center gap-2">{icon}{children}</span>
        <span className="rounded-full bg-[var(--color-background-tertiary)] px-2 py-0.5 text-[10px]">即将上线</span>
      </div>
    )
  }

  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-2 rounded-lg border-l-2 px-3 py-2 text-[12px] font-medium transition ${
          isActive
            ? 'border-brand-500 bg-brand-50 text-brand-900'
            : 'border-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-background-tertiary)]'
        }`
      }
    >
      {icon}
      {children}
    </NavLink>
  )
}

export function BookSidebar({ bookId }) {
  const chapters = bookId ? storage.getChapters(bookId) : []
  const currentChapter = getNextChapter(chapters)
  const reviewCount = countDueReviews(storage.getReviewQueue())

  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-56px)] w-[210px] shrink-0 border-r border-[var(--color-border-tertiary)] bg-white p-3 lg:block">
      <nav className="space-y-5">
        <section>
          <div className="mb-2 px-3 text-[10px] font-medium uppercase tracking-wide text-[var(--color-text-tertiary)]">当前阅读</div>
          <div className="space-y-1">
            <SidebarLink to={`/book/${bookId}`} end icon={<IconLayoutDashboard size={15} />}>书籍总览</SidebarLink>
            {currentChapter ? (
              <SidebarLink to={`/book/${bookId}/chapter/${currentChapter.id}`} icon={<IconFileText size={15} />}>章节阅读</SidebarLink>
            ) : null}
            {currentChapter ? (
              <SidebarLink to={`/book/${bookId}/chapter/${currentChapter.id}/summary`} icon={<IconChecklist size={15} />}>阅读总结</SidebarLink>
            ) : null}
          </div>
        </section>
        <section>
          <div className="mb-2 px-3 text-[10px] font-medium uppercase tracking-wide text-[var(--color-text-tertiary)]">学习系统</div>
          <div className="space-y-1">
            <SidebarLink to="/review" icon={<IconRefresh size={15} />}>
              <span className="flex flex-1 items-center justify-between">
                复习队列
                {reviewCount > 0 ? <span className="rounded-full bg-signal-orange px-1.5 py-0.5 text-[10px] text-white">{reviewCount}</span> : null}
              </span>
            </SidebarLink>
            <SidebarLink disabled icon={<IconQuestionMark size={15} />}>问题库</SidebarLink>
          </div>
        </section>
        <section>
          <div className="mb-2 px-3 text-[10px] font-medium uppercase tracking-wide text-[var(--color-text-tertiary)]">书架</div>
          <div className="space-y-1">
            <SidebarLink to="/" icon={<IconBooks size={15} />}>全部书籍</SidebarLink>
            <SidebarLink to="/library" icon={<IconLibraryPlus size={15} />}>添加新书</SidebarLink>
          </div>
        </section>
      </nav>
    </aside>
  )
}
