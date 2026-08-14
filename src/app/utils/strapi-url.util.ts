import { environment } from 'src/environments/environment';

/**
 * Single source of truth for resolving a Strapi media path to a full URL.
 *
 * Strapi upload responses (and anything the backend forwards from Strapi —
 * category/trainer/center photos, videos, documents) can return either a
 * relative path (`/uploads/hero_bjj_2adbd7b067.jpg`) or an already-complete
 * URL. A relative path bound directly into `[src]` resolves against the
 * CURRENT origin (the Angular dev server, e.g. localhost:4200) rather than
 * Strapi's origin (localhost:1337) — this is what was producing broken
 * `http://localhost:4200/uploads/...` requests. Route every Strapi media
 * path through this function instead of hand-rolling the same
 * `startsWith('http') ? url : base + url` check per component.
 *
 * Does NOT apply to user profile photos — those are stored as base64 and
 * never touch this resolver.
 */
export function resolveStrapiUrl(path: string | null | undefined): string {
  if (!path) {
    return '';
  }

  // Already absolute, a local blob: preview (pre-upload crop flows), or a
  // data: URI (base64) — pass through unchanged, nothing to resolve.
  if (/^(https?:|blob:|data:)/i.test(path)) {
    return path;
  }

  const base = environment.strapiUrl.replace(/\/$/, '');
  const relative = path.startsWith('/') ? path : `/${path}`;

  return `${base}${relative}`;
}
