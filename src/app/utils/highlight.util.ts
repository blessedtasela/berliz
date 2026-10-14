import { escapeHtml } from 'src/validators/form-validators.module';

/**
 * HTML for `text` with every word of `query` wrapped in a <span class="…">, for use with [innerHTML].
 *
 * The text is matched RAW and each piece is escaped separately. (Escaping the whole string first and
 * then matching, as the callers used to, lets a query like "amp", "lt" or "quot" match inside an
 * entity such as `&amp;` and emit broken markup.) Every character that reaches the output has gone
 * through escapeHtml, so the result is safe to bind.
 */
export function highlightHtml(text: string, query: string | null | undefined, className: string): string {
  const source = text ?? '';
  const words = (query ?? '')
    .split(/\s+/)
    .filter(w => w.length > 0)
    .map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (words.length === 0) return escapeHtml(source);

  const regex = new RegExp(words.join('|'), 'gi');
  let out = '';
  let last = 0;
  for (const match of source.matchAll(regex)) {
    const index = match.index ?? 0;
    if (match[0].length === 0) continue;
    out += escapeHtml(source.slice(last, index));
    out += `<span class="${className}">${escapeHtml(match[0])}</span>`;
    last = index + match[0].length;
  }
  return out + escapeHtml(source.slice(last));
}
