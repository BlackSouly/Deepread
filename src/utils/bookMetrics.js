export function isRequiredChapter(chapter) {
  return chapter.importance !== 'ignored'
}

export function getBookProgress(chapters) {
  return getBookChapterStats(chapters).progress
}

export function getBookStatus(chapters) {
  const stats = getBookChapterStats(chapters)
  if (stats.requiredTotal === 0) return '未开始'
  if (stats.requiredDone === stats.requiredTotal) return '已完成'
  if (stats.requiredDone > 0 || stats.requiredReading > 0) return '阅读中'
  return '未开始'
}

export function getNextChapter(chapters) {
  const requiredChapters = chapters.filter(isRequiredChapter)
  return requiredChapters.find((chapter) => chapter.status === 'reading') ?? requiredChapters.find((chapter) => chapter.status !== 'done') ?? null
}

export function getBookChapterStats(chapters) {
  const requiredChapters = chapters.filter(isRequiredChapter)
  const requiredTotal = requiredChapters.length
  const requiredDone = requiredChapters.filter((chapter) => chapter.status === 'done').length
  const requiredReading = requiredChapters.filter((chapter) => chapter.status === 'reading').length
  const keyChapters = chapters.filter((chapter) => chapter.importance === 'key')
  const keyDone = keyChapters.filter((chapter) => chapter.status === 'done').length
  const ignoredTotal = chapters.length - requiredTotal

  return {
    total: chapters.length,
    requiredTotal,
    requiredDone,
    requiredReading,
    ignoredTotal,
    keyTotal: keyChapters.length,
    keyDone,
    progress: requiredTotal === 0 ? 0 : Math.round((requiredDone / requiredTotal) * 100),
  }
}

export function formatMinutes(minutes) {
  if (minutes < 60) return `${minutes} 分钟`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest === 0 ? `${hours} 小时` : `${hours} 小时 ${rest} 分钟`
}
