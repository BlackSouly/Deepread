import { IconAlertTriangle, IconCheck, IconCloudUpload } from '@tabler/icons-react'

export function SaveStatus({ status }) {
  const config = {
    idle: { text: '未修改', icon: IconCheck, className: 'text-[var(--color-text-tertiary)]' },
    saving: { text: '保存中', icon: IconCloudUpload, className: 'text-signal-blue animate-pulse' },
    saved: { text: '已保存', icon: IconCheck, className: 'text-brand-900' },
    error: { text: '保存失败', icon: IconAlertTriangle, className: 'text-signal-orange' },
  }
  const current = config[status] ?? config.idle
  const Icon = current.icon

  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-1 text-[11px] ${current.className}`}>
      <Icon size={13} />
      {current.text}
    </span>
  )
}
