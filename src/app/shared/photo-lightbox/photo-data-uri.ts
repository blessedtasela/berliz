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
  // Defensive: some callers pass a loosely-typed field that can be an object at
  // runtime (e.g. a PhotoResponse) -- never let `.slice`/regex below throw.
  if (!base64 || typeof base64 !== 'string') return null;

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

/**
 * Memoized single-photo wrapper around `photoDataUri`. Recomputes the data-URI
 * string only when the underlying base64 payload actually changes; otherwise
 * returns the SAME string reference on every call.
 *
 * Bind templates to this, never to a raw `photoDataUri(...)` / `'data:...' + x`
 * call in a getter/method: those rebuild a multi-KB string every change-detection
 * pass, so `<img [src]>` is seen as "changed" every tick and the browser
 * re-decodes the image — dozens of times a second on a photo-heavy list, which
 * pegs the main thread and crashes the tab on lower-powered devices.
 *
 *   private _uri = memoizePhotoUri();
 *   get photoSrc() { return this._uri(this.photo) ?? 'assets/avatar.png'; }
 */
export function memoizePhotoUri(): (base64: string | null | undefined) => string | null {
  const UNSET = Symbol('unset');
  let lastKey: unknown = UNSET;
  let lastVal: string | null = null;
  return (base64) => {
    if (base64 !== lastKey) {
      lastKey = base64;
      lastVal = photoDataUri(base64 ?? null);
    }
    return lastVal;
  };
}

/**
 * Per-row variant for lists — `photoSrc(item)` called inside `*ngFor`. Keyed by
 * a stable id so each row's data-URI is built once and returned by reference
 * thereafter (a changed payload for the same id is recomputed).
 *
 *   private _rowUri = memoizePhotoUriByKey();
 *   photoSrc(m: Member) { return this._rowUri(m.id, m.profilePhoto) ?? 'assets/avatar.png'; }
 */
export function memoizePhotoUriByKey(): (key: string | number, base64: string | null | undefined) => string | null {
  const cache = new Map<string | number, { key: unknown; val: string | null }>();
  return (id, base64) => {
    const hit = cache.get(id);
    if (hit && hit.key === base64) return hit.val;
    const val = photoDataUri(base64 ?? null);
    cache.set(id, { key: base64, val });
    return val;
  };
}
