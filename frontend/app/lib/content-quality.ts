// Quarantine recognizable generation notes instead of publishing them as a review.
// Saved source content remains available to editors for correction.
export function hasGenerationNotes(content?: string): boolean {
  return !!content && /<\/?(?:think|analysis)>|(?:^|\n)\s*(?:#{1,6}\s*)?(?:thinking through the buyer profile|analysis of the buyer profile|internal reasoning|chain of thought)\b/i.test(content);
}

export function publishableDescription(content?: string): string | undefined {
  return hasGenerationNotes(content) ? undefined : content;
}

export function verifiedRating(rating?: { average?: number; count?: number }): number | undefined {
  if (!rating || !Number.isFinite(rating.average) || rating.average! < 1 || rating.average! > 5
    || !Number.isInteger(rating.count) || rating.count! <= 0) return undefined;
  return rating.average;
}
