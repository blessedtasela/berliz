# Frontend Tech Stack — Berliz

A reference for every technology in this codebase and why it's here. Grouped by purpose, not alphabetically — read top to bottom for the shape of the app, or jump to a section for one library.

## Core framework

| Technology | Purpose |
|---|---|
| **Angular 16** (`@angular/core`, `common`, `forms`, `router`, `platform-browser`, `compiler`) | Application framework — component-based SPA, routing, forms, change detection |
| **Angular CDK** (`@angular/cdk`) | Unstyled behavioral primitives (overlay, a11y, layout) that Angular Material and some custom components build on |
| **Angular Material** (`@angular/material`) | Dialog/modal infrastructure (`MatDialog`) and a handful of Material components — most of the app's visual design is custom Tailwind, not Material's theme |
| **TypeScript 5.1** | Language — static typing across the whole app |
| **RxJS 7** | Reactive streams — HTTP responses, NgRx effects, and most async state flow through Observables |

## State management

| Technology | Purpose |
|---|---|
| **NgRx** (`store`, `effects`, `entity`, `store-devtools`) | Centralized application state. The app went through a full migration from a legacy per-feature "state service" pattern (see `src/legacy/state-service/` — kept only as historical reference, being phased out) to NgRx as the single source of truth: actions → reducers → effects (side effects/API calls) → selectors (components read state) |

## Styling

| Technology | Purpose |
|---|---|
| **Tailwind CSS 3** | Utility-first styling — the primary design system across the app |
| **PostCSS / Autoprefixer** | Tailwind's build pipeline, vendor-prefixing |
| **tailwindcss-textshadow** | Tailwind plugin adding text-shadow utilities |

## Real-time

| Technology | Purpose |
|---|---|
| **@stomp/rx-stomp** | STOMP-over-WebSocket client, paired with the backend's Spring WebSocket/STOMP broker — used for live features (notifications, messaging-style updates) without polling |

## Media handling

| Technology | Purpose |
|---|---|
| **ngx-image-cropper** | In-browser photo cropping before upload (trainer/center photo albums) |
| **@ffmpeg/core / @ffmpeg/ffmpeg / @ffmpeg/util** | WebAssembly ffmpeg build — client-side video trimming/re-encoding (see `VideoCropperService`) so large raw clips aren't uploaded unprocessed |
| **ngx-file-drop** | Drag-and-drop file input UI |
| **ngx-extended-pdf-viewer** | In-app PDF viewing (trainer certifications, resumes uploaded via the partner application flow) |

## Forms & input validation

| Technology | Purpose |
|---|---|
| **Angular Reactive Forms** (`@angular/forms`) | All form handling — validators, form groups, dynamic form state |
| **ngx-mask** | Input masking (phone numbers, formatted fields) |
| **intl-tel-input / libphonenumber-js / google-libphonenumber** | International phone number input UI and validation — three related libraries covering the input widget and the underlying parsing/validation logic |
| **country-state-city** | Country/state/city cascading dropdown data, used in location fields |
| **postcode-validator** | Postal/ZIP code format validation per country |

## UI components

| Technology | Purpose |
|---|---|
| **@ng-select/ng-select** | Searchable/multi-select dropdown component, used wherever a plain `<select>` isn't enough |
| **@syncfusion/ej2-angular-inputs** | Additional input components from Syncfusion's suite |
| **angular-feather** | Feather icon set as Angular components |
| **maticon** | Material Design icon font |
| **angular-popper** | Popper.js-based tooltips/popovers |
| **xng-breadcrumb** | Route-driven breadcrumb navigation (see the `breadcrumb` data property set on most routes in `app-routing.module.ts`) |
| **ngx-ui-loader** | Global loading spinner/overlay, triggered around async operations |
| **hammerjs** | Touch gesture support (swipe/pan), used by some Material components |
| **chart.js / ng2-charts** | Charts for analytics/dashboard views |

## Data & auth

| Technology | Purpose |
|---|---|
| **HttpClient** (`@angular/common/http`) | All backend API calls, wired through `AuthInterceptor` (attaches JWT, handles silent token refresh on 401, queues concurrent requests during a refresh) |
| **jwt-decode** | Client-side JWT payload decoding (reading claims without a network call — not used for trust, the backend is always the source of truth on validity) |
| **ngx-indexed-db** | Browser IndexedDB wrapper for local persistence beyond what `localStorage` comfortably handles |

## Third-party integrations

| Technology | Purpose |
|---|---|
| **Google Identity Services** (loaded at runtime, no npm package) | "Sign in with Google" — see `SocialAuthService.renderGoogleButton()` |
| **Facebook JS SDK** (loaded at runtime, no npm package) | Facebook Login — see `SocialAuthService.loginWithFacebook()` |
| **Stripe Checkout** (no client SDK used) | Payments — the backend creates a Checkout Session and returns a hosted URL; the frontend just redirects, no `stripe-js` needed |
| **@angular/fire / firebase** | Present in `package.json` but not yet configured (`environment.ts` still has placeholder Firebase keys) — reserved for a planned use, not active |

## Infrastructure (not npm packages, but part of the stack)

| Technology | Purpose |
|---|---|
| **Netlify** | Static hosting and CI — builds and deploys on every push to `master` per `netlify.toml` |
| **Cloudflare** | DNS, SSL/TLS, and edge caching for `berliz.fitness` — including `media.berliz.fitness`, a dedicated cached subdomain in front of Strapi's media uploads (`/uploads/*`, 24h edge TTL) to keep repeat image/video views off Railway's billed egress |
| **Strapi** (external service, not in this repo) | Headless CMS — stores and serves media (photos, videos, documents). The frontend only ever *reads* from it directly (`resolveStrapiUrl`); uploads route through the backend's `/strapi/upload`, which holds the Strapi API token server-side |

## Testing

| Technology | Purpose |
|---|---|
| **Karma + Jasmine** | Unit test runner and framework (Angular CLI default) |

## Build tooling

| Technology | Purpose |
|---|---|
| **Angular CLI 16** | Build, serve, test, and scaffolding tooling |
| **zone.js** | Angular's change-detection trigger mechanism (patches async APIs so Angular knows when to re-render) |
