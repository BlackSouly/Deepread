import { useState } from 'react'
import { IconPlus, IconSparkles, IconX } from '@tabler/icons-react'
import { aiService } from '../../services/ai.js'
import { Button } from '../common/Button.jsx'
import { useToast } from '../common/ToastProvider.jsx'

function Cell({ label, value, onChange, tall = false }) {
  return (
    <label className={`block rounded-xl border border-[var(--color-border-tertiary)] bg-white p-4 ${tall ? 'md:col-span-2' : ''}`}>
      <span className="mb-2 block text-[12px] font-medium">{label}</span>
      <textarea className="min-h-28 w-full resize-y rounded-lg border border-[var(--color-border-secondary)] px-3 py-2 text-[13px] leading-6" value={value ?? ''} onChange={(event) => onChange(event.target.value)} placeholder="点击填写..." />
    </label>
  )
}

export function ToyotaSheet({ value, onChange, chapterTitle }) {
  const [tag, setTag] = useState('')
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()
  const sheet = value ?? { background: '', problem: '', cause: '', solution: '', connection: '', connectionTags: [] }

  function update(key, nextValue) {
    onChange({ ...sheet, [key]: nextValue })
  }

  async function fillBackground() {
    try {
      setLoading(true)
      const background = await aiService.generateToyotaBackground(chapterTitle)
      onChange({ ...sheet, background })
      showToast('丰田一页纸背景已预填。', 'success')
    } catch {
      showToast('背景生成失败，请稍后重试。', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="rounded-xl border border-[var(--color-border-tertiary)] bg-white p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[13px] font-medium">丰田一页纸总结</h2>
        <Button size="sm" variant="secondary" onClick={fillBackground} disabled={loading}>
          <IconSparkles size={14} />
          {loading ? '生成中' : 'AI 预填背景'}
        </Button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Cell label="背景" value={sheet.background} onChange={(value) => update('background', value)} />
        <Cell label="核心问题" value={sheet.problem} onChange={(value) => update('problem', value)} />
        <Cell label="原因分析" value={sheet.cause} onChange={(value) => update('cause', value)} />
        <Cell label="对策与启示" value={sheet.solution} onChange={(value) => update('solution', value)} />
        <div className="rounded-xl border border-[var(--color-border-tertiary)] bg-white p-4 md:col-span-2">
          <div className="mb-3 text-[12px] font-medium">与已有知识的联结</div>
          <div className="mb-3 flex flex-wrap gap-2">
            {(sheet.connectionTags ?? []).map((item) => (
              <span key={item} className="inline-flex items-center gap-1 rounded-full bg-signal-blueLight px-2.5 py-1 text-[11px] text-signal-blue">
                {item}
                <button type="button" onClick={() => update('connectionTags', sheet.connectionTags.filter((entry) => entry !== item))}><IconX size={12} /></button>
              </span>
            ))}
            <span className="inline-flex items-center gap-1">
              <input className="h-7 w-28 rounded-full border border-[var(--color-border-secondary)] px-3 text-[11px]" value={tag} onChange={(event) => setTag(event.target.value)} placeholder="领域标签" />
              <button type="button" className="text-signal-blue" onClick={() => { if (tag.trim()) { update('connectionTags', [...(sheet.connectionTags ?? []), tag.trim()]); setTag('') } }}><IconPlus size={15} /></button>
            </span>
          </div>
          <textarea className="min-h-28 w-full resize-y rounded-lg border border-[var(--color-border-secondary)] px-3 py-2 text-[13px] leading-6" value={sheet.connection ?? ''} onChange={(event) => update('connection', event.target.value)} placeholder="描述联结点，例如：与巴甫洛夫条件反射的共同点在于..." />
        </div>
      </div>
    </section>
  )
}
