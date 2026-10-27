/**
 * A route like `find-centers/:id/:name` is one router segment with a slash in it, so its breadcrumb label came through
 * as the raw path ("find-centers/2/berliz-works"). Show the part a person would call the page: the last segment that is
 * not a bare id, with dashes turned back into spaces and each word capitalised ("Berliz Works").
 * A label with no slash is already written for people and is returned unchanged.
 */
export function humanizeBreadcrumbLabel(label: string | null | undefined): string {
  const text = label ?? '';
  if (!text.includes('/')) return text;
  const parts = text.split('/').map(p => p.trim()).filter(p => p && !/^\d+$/.test(p));
  const last = parts[parts.length - 1] ?? text;
  let decoded = last;
  try { decoded = decodeURIComponent(last); } catch { /* keep the raw segment */ }
  return decoded.replace(/[-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
