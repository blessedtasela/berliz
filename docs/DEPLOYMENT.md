# Frontend Deployment — Berliz

## Hosting
- Netlify for frontend hosting
- Cloudflare for DNS & SSL

## Deployment Flow
- Push to `master`
- Netlify auto-builds
- CDN caches assets

## Build & prerendering
Netlify's build command is `npm run prerender` (see `netlify.toml`), not a
plain `ng build`. It runs the normal production browser build first, then
uses Angular Universal (`@nguniversal/express-engine`, added for this) to
statically render the 9 public marketing routes listed in
`prerender-routes.txt` (`/`, `/about`, `/services` + its 3 children,
`/contact`, `/trainers`, `/centers`, `/members`) into their own
`<route>/index.html`, so a crawler that doesn't run JS still sees the real
title/meta/OG/canonical/JSON-LD tags `SeoService` sets. Every other route —
the whole `/dashboard` subtree, `/login`, dynamic routes like
`/trainers/:id`, etc. — is deliberately left out of that list and still
serves the plain client-rendered shell.

Netlify's publish directory is `dist/berliz/browser` (Universal's scaffold
splits output into `browser/` and `server/`; only `browser/` is deployed —
the `server/` bundle and `server.ts` exist only to support the prerender
step locally/in CI and are never run as a live Node server). Netlify's
static file server already prefers an exact file/folder match over the `/*
-> /index.html` SPA redirect in `netlify.toml`, so the 9 prerendered routes
serve their static HTML while everything else keeps falling through to the
CSR shell unchanged — no redirect-rule changes were needed for this.

To prerender locally: `npm run prerender`, then check
`dist/berliz/browser/<route>/index.html` (raw file, not DevTools) for the
baked-in tags.

## Domain
https://berliz.fitness
