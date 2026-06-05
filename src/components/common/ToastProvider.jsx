import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { IconAlertTriangle, IconCheck, IconInfoCircle, IconX } from '@tabler/icons-react'

const ToastContext = createContext(null)

const toneClass = {
  success: 'border-brand-200 bg-brand-50 text-brand-900',
  info: 'border-[#B5D4F4] bg-signal-blueLight text-signal-blue',
  warning: 'border-[#F5C4B3] bg-signal-orangeLight text-signal-orange',
  error: 'border-[#F5C4B3] bg-white text-signal-orange',
}

const icons = {
  success: IconCheck,
  info: IconInfoCircle,
  warning: IconAlertTriangle,
  error: IconAlertTriangle,
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback((message, tone = 'info') => {
    const id = crypto.randomUUID()
    setToasts((current) => [...current, { id, message, tone }])
    window.setTimeout(() => dismiss(id), 2800)
    return id
  }, [dismiss])

  const value = useMemo(() => ({ showToast, dismiss }), [showToast, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-5 top-16 z-[80] flex w-[320px] max-w-[calc(100vw-40px)] flex-col gap-2">
        {toasts.map((toast) => {
          const Icon = icons[toast.tone] ?? IconInfoCircle
          return (
            <div key={toast.id} className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-[12px] leading-5 shadow-card ${toneClass[toast.tone] ?? toneClass.info}`}>
              <Icon size={16} className="mt-0.5 shrink-0" />
              <span className="min-w-0 flex-1">{toast.message}</span>
              <button type="button" className="shrink-0 opacity-70 hover:opacity-100" onClick={() => dismiss(toast.id)} aria-label="关闭提示">
                <IconX size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    return { showToast: () => null, dismiss: () => {} }
  }
  return context
}
