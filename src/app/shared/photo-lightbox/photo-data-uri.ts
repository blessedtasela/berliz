/**
 * Berliz stores profile/entity photos as bare base64 (no data-URI prefix, no
 * recorded MIME type). The app has historically prefixed them with
 * `data:image/*;base64,` — but `image/*` is NOT a valid data-URI media type.
 * Chromium sniffs the bytes and renders it anyway; Safari and Firefox are
 * stricter and reject it outright, which is why "some profile pictures don't
 * show" for some people while working for others.
 *
 * This sniffs the leading base64 characters (which encode the file's magic
 * bytes) and returns a data URI with a real, concrete type. Falls back to
 * `image/jpeg` — the common case, and every engine will still render a PNG or
 * WebP payload that's merely mislabelled jpeg, whereas none reliably render
 * `image/*`.
 */
export function photoDataUri(base64: string | null | undefined): string | null {
  if (!base64) return null;

  // Already a full URI (data:, http(s):, blob:) — pass through untouched.
  if (/^(data:|https?:|blob:)/i.test(base64)) return base64;

  const head = base64.slice(0, 16);
  let mime = 'image/jpeg';
  if (head.startsWith('iVBORw0KGgo')) mime = 'image/png';
  else if (head.startsWith('R0lGOD')) mime = 'image/gif';
  else if (head.startsWith('UklGR')) mime = 'image/webp';
  else if (head.startsWith('PHN2Zy') || head.startsWith('PD94bWw')) mime = 'image/svg+xml';
  else if (head.startsWith('/9j/')) mime = 'image/jpeg';

  return `data:${mime};base64,${base64}`;
}
