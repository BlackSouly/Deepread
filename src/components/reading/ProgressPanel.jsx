import { IconCircleCheck, IconCircleDashed } from '@tabler/icons-react'

function ProgressRow({ label, done, detail }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--color-border-tertiary)] px-3 py-2">
      <span className="flex items-center gap-2 text-[12px]">
        {done ? <IconCircleCheck size={16} className="text-brand-500" /> : <IconCircleDashed size={16} className="text-[var(--color-text-tertiary)]" />}
        {label}
      </span>
      <span className="text-[11px] text-[var(--color-text-tertiary)]">{detail}</span>
    </div>
  )
}

export function ProgressPanel({ progress, isKeyChapter }) {
  return (
    <div className="space-y-2">
      <ProgressRow label="KWL 前置问题" done={progress.kwlReady} detail={progress.kwlReady ? '完成' : '未开始'} />
      <ProgressRow label="小节费曼复述" done={progress.sectionDone === progress.sectionTotal} detail={`${progress.sectionDone}/${progress.sectionTotal}`} />
      <ProgressRow label="章节费曼复述" done={progress.chapterRecallDone} detail={progress.chapterRecallDone ? '完成' : '未开始'} />
      {isKeyChapter ? <ProgressRow label="费曼思考法" done={progress.thinkingDone === 5} detail={`${progress.thinkingDone}/5`} /> : null}
      <ProgressRow label="丰田一页纸" done={progress.toyotaDone} detail={progress.toyotaDone ? '完成' : '未开始'} />
      <ProgressRow label="思维导图" done={progress.mindmapDone} detail={progress.mindmapDone ? '完成' : '未开始'} />
    </div>
  )
}
