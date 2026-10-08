/**
 * Filtering and sorting for the trainer / center lists (public and signed-in). Pure functions, so the
 * rules are testable without a component. The list is already loaded in the browser, so this runs
 * client-side; "recommended" keeps the server's order (featured, then live-promotion providers first).
 */
export type ProviderSort = 'recommended' | 'price-asc' | 'price-desc' | 'reviews' | 'likes' | 'name';
export type ProviderMode = 'ALL' | 'IN_PERSON' | 'HYBRID' | 'ONLINE';

export interface ProviderFilterCriteria {
  mode: ProviderMode;
  /** Hourly rate ceiling; null = any. Providers with no rate set are hidden once a ceiling is chosen. */
  maxRate: number | null;
  withReviews: boolean;
  sort: ProviderSort;
}

export const DEFAULT_PROVIDER_CRITERIA: ProviderFilterCriteria = {
  mode: 'ALL',
  maxRate: null,
  withReviews: false,
  sort: 'recommended',
};

/** The fields of a trainer/center card the filters look at. */
export interface ProviderListing {
  name?: string | null;
  hourlyRate?: number | string | null;
  reviewCount?: number | null;
  likes?: number | null;
  serviceMode?: string | null;
}

export const RATE_CEILINGS = [25, 50, 75, 100, 150];

export const SORT_OPTIONS: { value: ProviderSort; label: string }[] = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'reviews', label: 'Most reviewed' },
  { value: 'likes', label: 'Most liked' },
  { value: 'name', label: 'Name A–Z' },
];

function rateOf(p: ProviderListing): number | null {
  if (p.hourlyRate === null || p.hourlyRate === undefined || p.hourlyRate === '') return null;
  const n = Number(p.hourlyRate);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * A hybrid trainer works in person AND online, so they stay in either of those filters; the Hybrid
 * filter itself shows only hybrid coaches.
 */
export function matchesMode(p: ProviderListing, mode: ProviderMode): boolean {
  if (mode === 'ALL') return true;
  const own = (p.serviceMode || 'IN_PERSON').toUpperCase();
  if (mode === 'HYBRID') return own === 'HYBRID';
  return own === mode || own === 'HYBRID';
}

export function activeFilterCount(c: ProviderFilterCriteria): number {
  return (c.mode !== 'ALL' ? 1 : 0) + (c.maxRate !== null ? 1 : 0) + (c.withReviews ? 1 : 0);
}

export function isDefaultCriteria(c: ProviderFilterCriteria): boolean {
  return activeFilterCount(c) === 0 && c.sort === 'recommended';
}

export function applyProviderFilters<T extends ProviderListing>(items: T[], c: ProviderFilterCriteria): T[] {
  let out = items.filter(p => {
    if (!matchesMode(p, c.mode)) return false;
    if (c.maxRate !== null) {
      const rate = rateOf(p);
      if (rate === null || rate > c.maxRate) return false;
    }
    if (c.withReviews && !(p.reviewCount && p.reviewCount > 0)) return false;
    return true;
  });

  if (c.sort === 'recommended') return out;

  // Array.prototype.sort is stable, so ties keep the server's order.
  out = [...out];
  switch (c.sort) {
    case 'price-asc':
      return out.sort((a, b) => (rateOf(a) ?? Infinity) - (rateOf(b) ?? Infinity));
    case 'price-desc':
      // unpriced providers stay last in both directions
      return out.sort((a, b) => (rateOf(b) ?? -Infinity) - (rateOf(a) ?? -Infinity));
    case 'reviews':
      return out.sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0));
    case 'likes':
      return out.sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));
    case 'name':
      return out.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
  }
  return out;
}

/** Location text a search should match: city-level place, every listed location and its venue. */
export function searchableLocation(p: {
  address?: string | null;
  locations?: { city?: string | null; stateProvince?: string | null; country?: string | null; venue?: string | null }[] | null;
}): string {
  const parts: (string | null | undefined)[] = [p.address];
  for (const l of p.locations ?? []) parts.push(l.city, l.stateProvince, l.country, l.venue);
  return parts.filter(Boolean).join(' ').toLowerCase();
}
