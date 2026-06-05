const day = 24 * 60 * 60 * 1000

const intervals = {
  1: [1, 3, 7],
  2: [3, 7, 14],
  3: [7, 21],
  4: [30],
}

export function getReviewIntervalDays(starRating, reviewCount = 0) {
  const schedule = intervals[starRating]
  if (!schedule) return null
  return schedule[Math.min(reviewCount, schedule.length - 1)]
}

export function getNextReviewDate(starRating, reviewCount = 0, from = new Date()) {
  const days = getReviewIntervalDays(starRating, reviewCount)
  if (days === null) return null
  return new Date(from.getTime() + days * day).toISOString()
}

export function getReviewRuleText(starRating, reviewCount = 0) {
  const days = getReviewIntervalDays(starRating, reviewCount)
  if (!days) return '选择星级后生成复习计划'
  return days === 30 ? '30 天后归档复查' : `${days} 天后复习`
}

export function getEffectiveChapterRating(chapterRating, sectionRatings) {
  const ratings = [chapterRating, ...sectionRatings].filter((rating) => Number.isInteger(rating))
  if (ratings.length === 0) return null
  return Math.min(...ratings)
}
