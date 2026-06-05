export function isReviewDue(item, now = new Date()) {
  return new Date(item.nextReviewDate) <= now
}

export function splitReviewQueue(queue, now = new Date()) {
  return {
    due: queue.filter((item) => isReviewDue(item, now)),
    upcoming: queue.filter((item) => !isReviewDue(item, now)),
  }
}

export function countDueReviews(queue, predicate = () => true, now = new Date()) {
  return queue.filter((item) => predicate(item) && isReviewDue(item, now)).length
}
