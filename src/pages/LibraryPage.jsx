import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconLibraryPlus } from '@tabler/icons-react'
import { Button } from '../components/common/Button.jsx'
import { AddBookModal } from '../components/books/AddBookModal.jsx'

export function LibraryPage() {
  const navigate = useNavigate()
  const [showAddBook, setShowAddBook] = useState(false)

  return (
    <div className="mx-auto max-w-4xl rounded-xl border border-[var(--color-border-tertiary)] bg-white p-6 shadow-card">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-900">
          <IconLibraryPlus size={22} />
        </div>
        <div>
          <h1 className="font-serif text-[20px] font-medium">书架管理</h1>
          <p className="mt-2 text-[13px] leading-6 text-[var(--color-text-secondary)]">当前阶段支持添加新书并批量录入章节。封面上传、ISBN 自动抓取和批量管理将在后续扩展。</p>
          <Button className="mt-4" onClick={() => setShowAddBook(true)}>添加新书</Button>
        </div>
      </div>
      {showAddBook ? (
        <AddBookModal
          onClose={() => setShowAddBook(false)}
          onCreated={(bookId) => {
            setShowAddBook(false)
            navigate(`/book/${bookId}`)
          }}
        />
      ) : null}
    </div>
  )
}
