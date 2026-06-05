export function getChapterProgress(record, sectionRecords, chapter) {
  const kwlReady = (record.kwl?.k?.length ?? 0) + (record.kwl?.w?.length ?? 0) > 0
  const sectionDone = sectionRecords.filter((section) => section.feynmanRecall?.trim()).length
  const thinking = record.feynmanThinking ?? {}
  const thinkingDone = Object.values(thinking).filter((value) => String(value ?? '').trim()).length

  return {
    kwlReady,
    sectionDone,
    sectionTotal: chapter.sectionCount,
    chapterRecallDone: Boolean(record.feynmanRecall?.trim()),
    thinkingDone,
    thinkingTotal: chapter.importance === 'key' ? 5 : 0,
    toyotaDone: Boolean(record.toyotaSheet?.problem || record.toyotaSheet?.cause || record.toyotaSheet?.solution),
    mindmapDone: Boolean(record.mindmapData),
  }
}
