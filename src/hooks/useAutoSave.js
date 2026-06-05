import { useEffect, useRef, useState } from 'react'
import { useToast } from '../components/common/ToastProvider.jsx'

export function useAutoSave(value, save, delay = 500) {
  const firstRun = useRef(true)
  const [status, setStatus] = useState('idle')
  const { showToast } = useToast()

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false
      return undefined
    }

    setStatus('saving')
    const timer = window.setTimeout(() => {
      Promise.resolve()
        .then(() => save(value))
        .then(() => {
          setStatus('saved')
        })
        .catch(() => {
          setStatus('error')
          showToast('自动保存失败，请检查浏览器存储空间。', 'error')
        })
    }, delay)

    return () => window.clearTimeout(timer)
  }, [value, save, delay, showToast])

  return status
}
