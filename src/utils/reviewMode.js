export function getReviewMode(starRating, reviewCount) {
  if (reviewCount > 0) return 'card'
  if (starRating <= 2) return 'chapter'
  return 'card'
}
