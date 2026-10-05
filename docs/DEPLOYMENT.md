# Frontend Deployment — Berliz

## Hosting
- Netlify for frontend hosting
- Cloudflare for DNS & SSL

## Deployment Flow
- Push to `master`
- Netlify auto-builds
- CDN caches assets

## Build & prerendering
Netlify's build command is `npm run prerender` (see `netlify.toml`), which runs
**two** Angular builds and a verification step:

1. `ng build --prerender=false --output-path=dist/csr-shell` — a plain client-side
   build whose `index.html` has an empty `<app-root>`.
2. `ng build` — the production build with Angular's built-in prerendering (the
   `application` builder's `prerender` option in `angular.json`, replacing the retired
   `@nguniversal/builders`). It statically renders the 10 public marketing routes in
   `prerender-routes.txt` (`/`, `/about`, `/services` + its 3 children, `/contact`,
   `/trainers`, `/centers`, `/members`) into their own `<route>/index.html`, so a crawler
   that doesn't run JS still sees the real title/meta/OG/canonical/JSON-LD tags
   `SeoService` sets. `discoverRoutes` is off, so only the listed routes are rendered.
3. `node scripts/finalize-prerender.mjs` — copies build 1's `index.html` to
   `dist/berliz/browser/index.csr.html` and **fails the build** if that shell references
   any asset that isn't in the final output (the two builds are expected to produce
   identical hashed bundle names).

Why the second build: this builder has no separate client-side shell —
`dist/berliz/browser/index.html` *is* the prerendered landing page. Netlify's catch-all
(`/* -> /index.csr.html` in `netlify.toml`) must serve a generic shell for every route
that is NOT prerendered (the whole `/dashboard` subtree, `/login`, dynamic routes like
`/trainers/:id`); falling back to `index.html` would give those URLs the landing page's
raw title/canonical/JSON-LD.

Netlify's publish directory is `dist/berliz/browser`. The server bundle exists only during
the build and is never run as a live Node server — there is no Express app,
`server.ts` or `@nguniversal/*` runtime, so request-time SSR advisories don't apply.
`src/main.server.ts` (the server entry) must **default-export** `AppServerModule`, and it
turns `setInterval` into a no-op: a periodic timer is never "done", so one left running
(the STOMP websocket heartbeat, counter animations, hero slideshows) makes Angular's
render wait for stability forever and the build hangs. That only affects the build-time
snapshot — the browser bundle never loads that file.

To prerender locally: `npm run prerender` (~3.5 min), then check
`dist/berliz/browser/<route>/index.html` (raw file, not DevTools) for the baked-in tags,
and that `index.csr.html` has an empty `<app-root></app-root>`.

## Domain
https://berliz.fitness
