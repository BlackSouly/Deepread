export function KWLReflection({ kwl, onChange }) {
  const questions = kwl?.w ?? []
  const answers = kwl?.l ?? []

  function update(index, value) {
    const next = [...answers]
    next[index] = value
    onChange({ ...kwl, l: next })
  }

  return (
    <section className="rounded-xl border border-[var(--color-border-tertiary)] bg-white p-5 shadow-card">
      <h2 className="mb-4 text-[13px] font-medium">回填 KWL 的 L</h2>
      <div className="space-y-3">
        {questions.length === 0 ? <p className="text-[13px] text-[var(--color-text-secondary)]">阅读前还没有写下 W 问题。</p> : null}
        {questions.map((question, index) => (
          <label key={`${question}-${index}`} className="block rounded-lg border border-[var(--color-border-tertiary)] p-3">
            <span className="mb-2 block text-[12px] font-medium">W：{question}</span>
            <textarea className="min-h-20 w-full rounded-lg border border-[var(--color-border-secondary)] px-3 py-2 text-[13px]" value={answers[index] ?? ''} onChange={(event) => update(index, event.target.value)} placeholder="实际学到了什么，或写：待解答" />
          </label>
        ))}
      </div>
    </section>
  )
}
