# Third-party content & asset license inventory (GN-48)

This is the ticket's own deliverable ("keep a licence inventory in the project
docs"). It covers content/asset licensing specifically -- fonts, icons, images,
video -- not every npm package's software license (that's the normal
`package.json`/`package-lock.json` dependency tree, a different concern).

Verified Nov 18, 2026 by reading `package.json`, the resolved `node_modules`
packages, `angular.json`, `src/index.html`, and the actual files under
`src/assets/`. Re-verify this file whenever a new bundled image/video/font is
added, since nothing here is enforced automatically.

## Fonts

| Asset | License | Source |
|---|---|---|
| Inter (variable) | **SIL Open Font License 1.1 (OFL-1.1)** | `@fontsource-variable/inter` npm package, self-hosted. `angular.json`'s global styles bundle `node_modules/@fontsource-variable/inter/wght.css` directly -- confirmed no `<link>` to Google Fonts or any other font CDN anywhere in `src/index.html` or any stylesheet. |

**Status: clear.** This is also the GN-35 ("self-host fonts, no third-party
tracker/CDN leakage") verification: confirmed clean, nothing loads from a
third-party font or script CDN at runtime.

## Icons

| Asset | License | Source |
|---|---|---|
| Feather Icons (`<i-feather>`/`feather-icon`, used in 250+ templates) | **MIT** | `angular-feather` npm package |

**Status: clear** for the icon library itself.

**Gap -- no license on file:** `src/assets/icons/` also holds ~35 raster
(PNG/JPG) icon-style images that are **not** from any icon package --
`bodyBuilding.png`, `boxing.png`, `dumbbell.png`, `muscle.png`,
`pectoralis-major.jpg`, `workoutBells.png`, `yoga.png`, `zumba.png`, and the
rest of that set (full list in the Nov 18, 2026 audit notes below). No
credit/license file accompanies any of them anywhere in the repo.

Not a licensing concern: `src/assets/berliz-files/SVG/*.svg` (Berliz's own
logo marks) and `src/assets/icons/checksquare.svg` (one hand-made icon) --
first-party, nothing to license.

## Stock / marketing imagery -- the biggest gap

**No license or credit documentation exists anywhere in the repo for any
photographic image.** No `LICENSE`/`CREDITS`/`ATTRIBUTION` file, no code
comment, no prior docs entry. This is the real finding for GN-48, not a
formality -- these are used on public, commercial pages (landing, about,
disciplines) where a licensing problem is actually visible and actionable
against the business.

Everything under `src/assets/landing/` fits a stock-photo usage pattern by
naming convention alone: `hero-bjj.jpg`, `hero-crossfit.jpg`,
`hero-gym-centers.jpg`, `hero-marketplace.jpg`, `hero-weight-loss.jpg`, and
the rest of the per-category `hero-*.jpg` set, plus `gym-1.jpg`,
`gym-coach.jpg`, `gym-girl.jpg`, `combat-sport.jpg`, `muscle-group-1.jpg`,
`landing1.jpeg` through `landing12.jpeg`, `promo-1.jpg`,
`landing-page-hero.jpg`.

One file is near-certain unattributed stock with its original attribution
already stripped: **`src/assets/trainers/grayscale-photography-of-vehicle.jpg`**
-- that filename is the auto-generated alt-text pattern Pexels/Unsplash
download tools produce, and it's a car photo sitting in the `trainers`
folder with no in-app reference at all (confirmed: not used anywhere in
`src/app`), so it's dead weight shipping in the bundle with an unclear
origin on top of that.

`src/assets/trainers/t1.jpg` through `t18.jpg` are ambiguous -- could be
real trainer headshots (first-party, fine) or stock filler, no way to tell
from the repo alone.

Separately, **`src/assets/landing/landing11.jpeg` is 12.9 MB** -- regardless
of the licensing question, that's an enormous asset shipping to every
visitor; worth a GN-42-style compression pass on its own.

**Not in scope** (real content, not stock): everything under
`src/assets/testimonial/` (customer photos), the `WhatsApp Image
2023/2024/2025-...jpeg` files scattered under `trainers/`, `berliz-files/`,
and the repo root (trainer/user-submitted media, identifiable by their
WhatsApp-export filenames), and `src/assets/berliz-files/*` brand/marketing
collateral (first-party design files, mockups of Berliz's own product).

## Bundled video clips

| File | Used by | License on file |
|---|---|---|
| `src/assets/fire-loop.mp4` (635 KB) | Landing page hero background loop (`hero-section.component.ts`) | None found |
| `src/assets/videos/demo_ok.mp4` (1.86 MB) | Fallback video when a trainer has no real video uploaded (`my-trainer-video-album`, `my-trainer-feature-videos`) | None found |
| `src/assets/videos/burpee demo.mp4` (1.5 MB) | **Not referenced anywhere in the app** -- orphaned | None found |

**Status: gap**, same as the stock imagery -- these are bundled with the app
itself, not user-uploaded, and nothing documents where they came from or
what license covers them.

**Not in scope:** exercise demo videos, trainer feature videos, and center
video galleries are all uploaded by trainers/admins through Strapi
(confirmed via `StrapiService`/`ExerciseVideoRequest`'s own code comments --
"Strapi-hosted," "sent after the frontend has already uploaded the file to
Strapi directly"). That's user-generated content; licensing it is between
the uploader and Berliz's terms of service, not a bundled-asset question.

**"PF-44"** (named in the GN-48 ticket as the source of "licensed demo
clips") does not appear anywhere in either the frontend or backend
codebase -- searched both repos for the literal string, the only hit is the
ticket text itself in `docs/NOV13-HANDOVER-2026-11-13.md`. There's no
asset in the repo tagged or traceable to a ticket by that name. Whoever
scoped PF-44 should say which specific clip(s) it covers; nothing here
could be matched to it.

## Summary

| Category | Status |
|---|---|
| Fonts (Inter) | **Clear** -- OFL-1.1, self-hosted |
| Icon library (angular-feather) | **Clear** -- MIT |
| Raster icon-style images (`src/assets/icons/*.png`/`.jpg`) | **Gap** -- no license on file |
| Stock/landing/hero photography | **Gap** -- no license on file anywhere; biggest risk |
| Bundled video (`fire-loop.mp4`, `demo_ok.mp4`, `burpee demo.mp4`) | **Gap** -- no license on file |
| Third-party font/script CDN loads | **Clear** -- none found (GN-35 confirmed complete) |
| Brand logos, testimonial photos, trainer-submitted (WhatsApp-named) media | **Out of scope** -- first-party or user-submitted |
| Strapi-hosted trainer/exercise/center video | **Out of scope** -- user-uploaded |

**Not done this pass, by design:** replacing any flagged asset. The ticket's
own text also says "replace anything unclear," but swapping out stock
photography or bundled video is a content/design decision (what replaces
it, at what cost, in what style) that needs the owner's call, not something
to guess at. This document is the inventory half of GN-48; the replacement
half is still open.
