const steps = [
  ['concepts', '提取核心概念', '本章最重要的 1~3 个概念'],
  ['firstPrinciple', '第一原理追问', '如果这个概念不存在，会怎样？写下你的推导。'],
  ['minUnit', '最小可解释单元', '用一句最简单的话定义这个概念。'],
  ['deepConnection', '深层知识联结', '它和你已知的某个知识为什么相似？共同机制是什么？'],
  ['oneLineConclusion', '一句话结论', '提炼后记入问题库的结论。'],
]

export function FeynmanThinkingPanel({ value, onChange }) {
  const data = value ?? {}
  return (
    <section className="rounded-xl border border-[#CECBF6] bg-white p-4 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[13px] font-medium text-signal-purple">费曼思考法 · 深度模块</h2>
        <span className="rounded-full bg-signal-purpleLight px-2.5 py-1 text-[11px] text-signal-purple">重点章节解锁</span>
      </div>
      <div className="space-y-3">
        {steps.map(([key, title, placeholder], index) => (
          <label key={key} className="grid gap-3 rounded-lg border border-[var(--color-border-tertiary)] p-3 md:grid-cols-[34px_190px_1fr]">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-signal-purple text-[12px] text-white">{index + 1}</span>
            <span>
              <span className="block text-[12px] font-medium">{title}</span>
              <span className="mt-1 block text-[11px] text-[var(--color-text-tertiary)]">{placeholder}</span>
            </span>
            <textarea
              className="min-h-20 rounded-lg border border-[var(--color-border-secondary)] px-3 py-2 text-[13px] leading-6 outline-none focus:border-[#CECBF6] focus:ring-2 focus:ring-signal-purpleLight"
              value={data[key] ?? ''}
              onChange={(event) => onChange({ ...data, [key]: event.target.value })}
            />
          </label>
        ))}
      </div>
    </section>
  )
}
