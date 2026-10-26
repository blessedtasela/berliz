/** A name as it appears in a profile URL: spaces become dashes, lowercased (what the `:name` route param is matched against). */
export function nameSlug(name: string | null | undefined): string {
  return (name ?? '').trim().replace(/ /g, '-').toLowerCase();
}

/** Number of single-character inserts, deletes or substitutions needed to turn `a` into `b`. */
export function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  let previous = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    previous = current;
  }
  return previous[b.length];
}

/**
 * The item whose slug is closest to a mistyped `slug` -- within `maxDistance` edits -- or null when nothing is
 * close enough to be a plausible typo. Ties go to the first item.
 */
export function closestBySlug<T>(slug: string, items: readonly T[], slugOf: (item: T) => string, maxDistance = 2): T | null {
  const wanted = slug.trim().toLowerCase();
  let best: T | null = null;
  let bestDistance = maxDistance + 1;
  for (const item of items) {
    const distance = editDistance(wanted, slugOf(item));
    if (distance < bestDistance) {
      best = item;
      bestDistance = distance;
    }
  }
  return best;
}
