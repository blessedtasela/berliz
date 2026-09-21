# Berliz — Feature Reference

The living inventory of everything Berliz does. Update this file in the **same change**
that ships a feature — add the row under the right domain, and log it under
[Changelog](#changelog) with the date and PR.

- **Status legend:** ✅ live · 🚧 in progress · 📋 planned
- Convention: describe the *user-visible capability*, not the implementation. One line per
  capability; link the domain heading to deeper docs when they exist.

---

## 1. Accounts & identity

| Feature | Status | Notes |
|---|---|---|
| Email/password signup, activation email, password reset | ✅ | |
| Social login — Google, Facebook | ✅ | `/auth/google`, `/auth/facebook` |
| Passkey / WebAuthn login | ✅ | Passwordless; passkeys managed in Settings |
| Roles — client, trainer, center/partner, member, admin | ✅ | Drives dashboard, discovery, permissions |
| Public profile page (`/user/:username`) | ✅ | Visibility toggle: private vs public; admin can view-through with a banner |
| Profile photo with in-app cropper | ✅ | |
| Account settings (merged Profile + Settings) | ✅ | Includes "what's new" badges, passkey management, sidebar display prefs |
| Value-first onboarding checklist | ✅ | Dismissible, role-aware first-run checklist at the top of the dashboard home (log a workout / connect / find a provider — or profile/post/connect for providers); progress is data-derived where possible, dismissal + click-steps persist in `localStorage`. No paywall in the path |
| Block / unblock users | ✅ | Two-directional enforcement across messaging, mentions, comments |
| Report content (posts, comments) | ✅ | Feeds admin content-report queue |

## 2. Social — feed, posts, connections

| Feature | Status | Notes |
|---|---|---|
| Connections (request / accept / remove) | ✅ | Gates the feed audience |
| Timeline / feed of connections' posts | ✅ | `dashboard-timeline` |
| Create post — text, image/video, activity type badge | ✅ | Types: GENERAL, WORKOUT, SESSION, TESTIMONIAL, REVIEW, PROGRESS, MILESTONE |
| Post like + like count | ✅ | Toggle like; denormalized counter |
| See who liked a post | ✅ | Tap the "N likes" text → block-filtered liker list (`GET /post/{id}/likes`) |
| Comments on posts | ✅ | Lazy-loaded thread, paginated "load earlier" |
| `@username` mentions in comments (autocomplete + linkify) | ✅ | Notifies the mentioned user |
| Edit / delete own comment; post author can delete any comment on their post | ✅ | |
| Comment failed-load state with Retry | ✅ | Was silently showing "no comments yet" on any fetch error |
| Comment likes + who-liked | ✅ | Heart toggles; "N likes" opens the liker list (`PUT /comment/like/{id}`, `GET /comment/{id}/likes`) |
| Comment visibility & blocking | ✅ | `getComments` hides the thread when blocked by the post author; blocked users' comments filtered |
| Threaded comment replies (nested, arbitrary depth) | ✅ | Recursive `CommentNodeComponent`; per-comment Reply box, "View N replies" lazy-load + paging; deleting a comment removes its subtree |
| `@username` autocomplete (shared) | ✅ | `MentionInputComponent` — one input+dropdown reused by the root box, every edit field, and every reply box |
| Draggable media + comments sheet (half / full, swipe to dismiss) | ✅ | `PostDetailSheetComponent` — media pinned top, post text + full comment thread scroll below; opens at half height, drag the grabber up to full or flick down to dismiss; honours `prefers-reduced-motion`. Replaced the old `post-media-viewer` lightbox for post images on feed + both profile pages |
| Profile avatars link to that user's profile | ✅ | `ClickablePhotoDirective` now leaves images inside a link/button alone; comment authors, connections, member cards, and the likers list navigate to the profile. Top-bar avatar still opens the account menu; profile-header avatars still enlarge |

## 3. Messaging

| Feature | Status | Notes |
|---|---|---|
| 1:1 direct messages | ✅ | STOMP/WebSocket live delivery |
| Typing indicators | ✅ | Shared 2s debounce in the composer |
| Edit / delete (unsend) messages | ✅ | |
| Reply-with-quote | ✅ | |
| Image / file attachments (25 MB cap) | ✅ | Uploads via backend → Strapi |
| Pop-out message window | ✅ | `messagePopupEnabled` user setting |
| Read receipts / conversation read state | ✅ | |

## 4. Training & tracking

| Feature | Status | Notes |
|---|---|---|
| Workout templates (browse + create) | ✅ | Surfaced on public profiles |
| Workout logging (sessions, sets, exercises) | ✅ | `workout_log` tables |
| Share a workout log to the feed | ✅ | |
| Runs — schedule, log, group runs | ✅ | `run` tables; group runs with scheduling/logging |
| Run leaderboard (connection-scoped) | ✅ | "Leaderboard" tab on `/dashboard/runs` — you + your connections ranked by distance / best pace / session count over a week / 30 days / year, with a verified-run count. Plain totals, no GPS traces. `GET /run/leaderboard` |
| Tasks & To-do lists | ✅ | Personal + admin-assignable |
| Progress entries (measurements/metrics over time) | ✅ | |
| Progress sharing | ✅ | `progress_share` |
| Exercise library + gear/equipment ("Exercises & Gear") | ✅ | Videos, detail fields, trending |
| Exercise suggestions (user-submitted → admin review) | ✅ | |
| Muscle-group taxonomy | ✅ | |
| Fitness achievements | ✅ | `FitnessAchievement` |
| Peer sessions (propose / schedule training with a connection) | ✅ | "My Sessions" |
| "Your time in Berliz" recap | ✅ | Dashboard card + modal (30d / 90d / year / all-time) — active days, sessions, km, best streak, PRs, rank moves, top partners; one-tap "Share as post". Always free. `GET /recap/me` |
| Verified activity | ✅ | A connected trainer/center confirms a logged workout/run; a "Verified" tick shows on the history list. `POST/DELETE /workoutLog/{id}/verify`, `/run/log/{id}/verify` |

## 5. Discovery & marketplace

| Feature | Status | Notes |
|---|---|---|
| Find trainers — active trainers, profiles, pricing, benefits, reviews | ✅ | Public trainer pages `/trainers/:name` |
| Find centers/gyms — active centers, equipment, reviews | ✅ | |
| Categories & martial-arts classification | ✅ | |
| Member directory | ✅ | `/dashboard/member-directory` |
| "Find a Provider" flow | ✅ | |
| Bookings | ✅ | `/dashboard/my-bookings` |
| Client intake forms | ✅ | |
| Testimonials & reviews (trainer/center) | ✅ | |
| Trainer location + service mode (in-person / online / hybrid) | ✅ | |
| Transparent pricing + Book CTA everywhere | ✅ | Provider pages state "full price — no 'from', no hidden fees"; a "Book a session" action appears on a trainer's/center's feed posts and on their profile header (`BookProviderButtonComponent`), not just the dedicated provider page |

## 6. Payments & subscriptions

| Feature | Status | Notes |
|---|---|---|
| Subscription plans (3-tier), role-targeted | ✅ | See [[project_payment_subscription_model]] |
| Stripe Checkout (one-time + recurring) | ✅ | Plan pick → hosted Stripe Checkout → `checkout.session.completed` webhook records the `Payment` + activates the sub, capturing the Stripe subscription/customer id |
| Stripe recurring lifecycle | ✅ | Webhook handles `invoice.paid` (record renewal, extend `endDate`), `invoice.payment_failed` (→ PAST_DUE + grace), `customer.subscription.deleted` (→ CANCELLED); nightly sweep expires auto-renew-off past `endDate` and past-due beyond the 5-day grace |
| Stripe refunds | ✅ | Admin "Refund via Stripe" on a payment row → `POST /payment/stripe/refund/{id}` reverses the charge and stamps the row |
| Bypass / promo codes | ✅ | |
| Pre-renewal reminder + one-tap cancel | ✅ | Daily sweep emails + bells a member ~2 days before renewal (once/period); "Cancel auto-renew" / "Resume auto-renew" in the My Subscriptions menu — cancel keeps access until `endDate` and also sets Stripe `cancel_at_period_end`. `POST /subscription/cancel` \| `/resume` |
| Stripe Connect payouts (to trainers/partners) | ✅ | Express onboarding link + `Transfer.create` to the provider's connected account |
| Bills / orders / store / products | ✅ | Commerce primitives present |

## 7. Notifications

| Feature | Status | Notes |
|---|---|---|
| Notification bell + dropdown, DB-backed | ✅ | |
| Live desktop push while tab open | ✅ | Per-user STOMP queue |
| Categories — messages, comments, mentions, posts & feed activity | ✅ | |
| Newsletter subscribe / status | ✅ | |

## 8. Planned — competitive differentiators

Greenlit for the roadmap (from [`COMPETITIVE-ANALYSIS.md`](./COMPETITIVE-ANALYSIS.md)).
Each moves to 🚧 then ✅ with its own row above as it ships.

| # | Feature | 📋 | Backend? |
|---|---|---|---|
| D1 | Training streaks + weekly consistency ring (dashboard) | ✅ | ✚ |
| D2 | "Year/Season in Berliz" recap — auto-generated, shareable, **permanently free** | ✅ | ✚ |
| D3 | Belt / rank progression tracker (per discipline; trainer/center promotes; milestone post) | ✅ | ✚ |
| D4 | Accountability partners + "nudge when a streak slips" | ✅ | ✚ |
| D5 | Multi-reactions (👍💪🔥👏❤️) on posts & comments | ✅ | ✚ |
| D6 | Friend-scoped segments & leaderboards for runs and classes | ✅ (scoped) | ✚ |
| D7 | Challenges — open / connections-only, progress board + completion badge | ✅ | ✚ |
| D8 | PR detection → one-tap MILESTONE post | ✅ | ✚ |
| D9 | Verified activity badge (wearable-imported or trainer-confirmed) | ✅ | ✚ |
| D10 | Transparent trainer/center pricing + book CTA on every relevant surface | ✅ | ✚ |
| D11 | Pre-renewal reminder + ≤2-tap cancel | ✅ | ✚ | |
| D12 | Value-first onboarding (one real action before any paywall) | ✅ | — |
| D13 | Dark mode (app-wide) | ⏸ deferred | — | ~150 components with hard-coded light classes; needs its own dedicated theming pass, not a batch |
| D14 | "Do this workout" — clone a linked workout from a feed post | ✅ | ✚ |
| D15 | Saved / bookmarked posts & workouts | ✅ | ✚ |

## 9. Platform / admin

| Feature | Status | Notes |
|---|---|---|
| Full admin suite | ✅ | Users, trainers, centers, categories, tags, equipment, FAQs, testimonials, newsletters, bookings, payments, subscriptions, tasks, to-do lists, partners, muscle-groups, exercises, problem reports, content reports |
| Analytics dashboard | ✅ | `Analytics` |
| Berliz feedback + problem reports | ✅ | |
| Help center / FAQs | ✅ | Public + per-user |
| Hub, News & updates | ✅ | |
| Global search (multi-entity) | ✅ | Top-bar |
| Partner one-pager, brand assets | ✅ | |
| Build-time prerendering of public marketing routes (SEO) | ✅ | `/`, `/about`, `/services` + its 3 children, `/contact`, `/trainers`, `/centers`, `/members` are statically rendered at build time (Angular Universal) so crawlers that don't run JS see real title/meta/OG/canonical/JSON-LD instead of an empty shell. Dashboard and every other route stay client-rendered only — see `docs/DEPLOYMENT.md` |

## 10. Growth & marketing

New domain — `Promotion`/`SessionCredit`/`Referral`, not to be confused with the admin
subscription **bypass/discount codes** in [§6](#6-payments--subscriptions), which are a
separate, older mechanism (comps a full subscription; these grant a session-level reward
instead).

| Feature | Status | Notes |
|---|---|---|
| Provider self-serve promotions | ✅ | A trainer/center creates offers on their own profile (`/dashboard/my-promotions`): % off, $ off, free session, or custom; audience (new members / everyone); optional date window + redemption cap; pause/resume. Backend: `Promotion` (trainer_fk/center_fk set), `PromotionServiceImplement`, `/promotion/*` |
| Public offer badges on trainer/center profiles | ✅ | Live promotions render as a badge/callout on both the public (`/trainers/:name`, `/centers/:name`) and dashboard (`/dashboard/find-trainers/:name`, `/dashboard/find-centers/:id/:name`) profile pages — `PromoBadgeListComponent`, reused across all four templates |
| "Deals" feed | ✅ | `/dashboard/deals` — every currently-live promotion platform-wide (provider offers + Berliz campaigns). Signed-in only; the underlying `/promotion/feed` endpoint is public (also feeds each provider's own profile badge) but this route requires auth. Links out to each provider's dashboard profile page |
| Platform growth campaigns (admin) | ✅ | Same `Promotion` entity with no trainer/center owner — e.g. "first N sign-ups get a free session." Managed at `/dashboard/hub/campaigns` (admin only). A live `free_session` + `new_members` campaign is auto-granted as a `SessionCredit` to every account the moment it activates (email confirmation for form signup; immediately for Google/Facebook signup, which has no separate activation step) |
| Session credits ("My Rewards") | ✅ | `/dashboard/my-rewards` — free-session/discount credits earned from a platform campaign or a referral, shown to redeem manually with the provider (no per-session Stripe charge exists yet to auto-apply a discount against — see [§6](#6-payments--subscriptions)). Backend: `SessionCredit`, `/session-credit/mine` |
| Referral program | ✅ | Every user gets a shareable link (`/sign-up?ref=<userId>`) from the My Rewards page. A referred account signing up via the **full form signup** tracks a pending `Referral`; once that account activates, both sides get a free-session `SessionCredit`. Backend: `Referral`, `ReferralServiceImplement`, `/referral/mine` |
| "Promo Partner" visibility incentive | ✅ | Deliberately built as a zero-cost-to-run incentive rather than a new flag/field: a trainer/center with at least one live promotion already gets the public badge (above) for free — that visibility *is* the incentive for participating. A dedicated search-ranking boost or commission-rate discount for campaign participants is a recommended next step, not built |
| Referral attribution for social/quick signup | 📋 | Only the full `/sign-up` form (`SignupRequest.referredBy`) carries a `?ref=` id through today. Google/Facebook login and `/quick-sign-up` use separate endpoints with no field for it yet — a new social/quick-signup account can't currently be attributed to a referrer |
| Admin campaign discovery via Hub tiles | 📋 | `/dashboard/hub/campaigns` and `/dashboard/campaigns` both work by direct navigation (and are wired into `dashboard-feature.module.ts` the same way every other admin section is), but the Hub's tile grid is driven by backend-supplied entity counts (`hub-grid.component.ts`'s `items` input) — no `campaigns` count key exists yet, so no Hub tile surfaces it. Small backend addition, not started |
| Social-share unlock, referral leaderboard, corporate/gym co-marketing partnerships | 📋 | Raised as growth ideas, not built — no data model or UI exists for any of these yet |

---

## Changelog

Newest first. Each entry: what shipped, which surfaces, PR/commit.

### Unreleased — Growth & marketing: promotions, campaigns, referrals

- **New domain, full-stack, in response to a product request to give Berliz real marketing/growth
  tooling ahead of launch.** New tables `promotion`, `session_credit`, `referral`
  (`V45__create_promotion_credit_referral_tables.sql`); new entities/DTOs/mapper/repos/
  service+impl/REST for all three (`PromotionRest`, `SessionCreditRest`, `ReferralRest`),
  following the existing `Connection`/`PeerSession` self-contained-entity pattern.
- **Provider self-serve promotions** — trainer/center create offers on their own profile
  (`/dashboard/my-promotions`); shown publicly as a badge on all four trainer/center detail
  templates via one shared `PromoBadgeListComponent`.
- **"Deals" feed** (`/dashboard/deals`, signed-in only) — every live promotion platform-wide.
- **Platform growth campaigns** (admin, `/dashboard/hub/campaigns`) reuse the same
  `Promotion` entity with no trainer/center owner. A live `free_session` + `new_members`
  campaign auto-grants a `SessionCredit` to every account on activation — wired into both
  `UserServiceImplement.activateAccount` (form signup) and `SocialAuthServiceImplement`'s
  new-account branch (Google/Facebook, which activates immediately).
- **Referral program** — `/dashboard/my-rewards` surfaces a shareable `?ref=<userId>` link;
  `SignupRequest.referredBy` tracks it as a pending `Referral` at signup, completed (both
  sides rewarded a free-session credit) on account activation. Not yet wired into social or
  quick-signup — see the Growth & marketing table for the exact gap.
- **"Promo Partner" incentive** deliberately kept to what's free to run: the public badge a
  live promotion already earns a trainer/center *is* the incentive — no new visibility
  mechanism was built for this pass.
- Also fixed in passing: `src/app/models/promotion.model.ts` (the pre-existing landing-page
  marketing-banner model, unrelated `Promotions` interface) was almost clobbered by a
  same-named-file collision while building this — new types live in `promo-offer.model.ts`
  instead; the original file was restored untouched.

### Unreleased — Frontend security hardening
_Branch: `feat/security-hardening`_

- **Fixed a real stored-XSS.** `highlight()` in the todo-list item and notification-item
  components returned unescaped user text bound via `[innerHTML]` — a todo task title or
  notification text containing markup rendered as live HTML for any viewer. New shared
  `escapeHtml()` (`src/validators/form-validators.module.ts`) fixes both, matching the
  escape-before-`innerHTML` pattern `comment-node.component.ts` already used correctly.
  Regression tests added proving the exploit string is neutralized and real search-match
  highlighting still works.
- **Closed file-upload validation gaps.** Message attachments (blocklist of
  executable/script extensions), center photo album (previously zero validation — now
  type+size checked), center video album (added type check alongside its existing size
  check), user avatar (previously zero validation before the cropper — now type+size
  checked), and the trainer-photo/partner-file modals (their `fileValidator` was size-only
  despite an image/pdf `accept` hint — now actually type-checked) all reuse or extend the
  existing `imageValidator`/new `typedFileValidator` pattern.
- **Added missing input length caps.** The shared comment/reply box (`mention-input`) had
  zero validation; the dashboard post-composer textarea and the contact-us message field
  had no ceiling. All three now cap length client-side (server-side columns are unbounded
  TEXT with no `@Size` validation — flagged, not a frontend fix).
- **Added security headers** (`netlify.toml`): `X-Content-Type-Options`, `Referrer-Policy`,
  `Strict-Transport-Security`, `Permissions-Policy`, and a `Content-Security-Policy-Report-Only`
  built from the live site's actual script/frame/connect origins (Google/Facebook SDKs,
  Cloudflare Insights, the Railway API + WSS, Strapi media) rather than guessed — ships
  Report-Only first since a wrong enforcing CSP could silently break OAuth login.
- **`npm audit fix`** (non-breaking only): production-scope vulnerabilities 39 → 30
  (`lodash`, `path-to-regexp`, `brace-expansion`, `browserslist`, `nanoid` patched). Remaining
  findings need a major Angular version bump or a migration off `@nguniversal` — out of
  scope for this pass, documented as accepted risk (practical exploitability is low since
  prerendering never runs a live Node/Express server in production).
- Audited but N/A or out of scope for this repo: DB-level concerns (no direct DB access from
  the frontend), password hashing/rate-limiting/parameterized queries (backend-only), bot
  protection (needs a chosen CAPTCHA provider + backend verification — not implemented),
  httpOnly-cookie token migration (bigger cross-repo change, flagged not done).

### Unreleased — Prerendering for public routes
_Branch: `feat/prerender-public-routes`_

- **Build-time prerendering (Angular Universal) for the 9 public marketing routes.**
  `ng add @nguniversal/express-engine` scaffolded `server.ts` / `main.server.ts` /
  `app.server.module.ts` and the `server`/`prerender` architect targets; `angular.json`'s
  `prerender` target points at `prerender-routes.txt` (exactly the 9 `sitemap.xml` routes,
  no dynamic `:id` routes). Fixed real crashes/hangs surfaced by rendering outside a
  browser: `AuthService`/`InactivityService`/`ScrollRestorationService`/
  `NavigationBarComponent` guarded `window`/`document`/`localStorage` access with
  `isPlatformBrowser`; the newsletter `MatDialog` popup (`AppComponent.maybeShowNewsletter`)
  skipped entirely off-browser since its focus-trap throws against the server's synthetic
  DOM; `rxStompServiceFactory` only calls `.activate()` in the browser (opening a live
  WebSocket and reading `localStorage` server-side crashed `/services`/`/centers`, whose
  components inject `RxStompService` for live updates); and the landing page's
  `HeroSectionComponent`/`TestimonialComponent` only start their carousel `setInterval`s in
  the browser (an uncleared interval kept the render's zone permanently "unstable," hanging
  `/` — which redirects to `/home` — forever). Netlify's build command is now
  `npm run prerender` and publish dir `dist/berliz/browser` — see `docs/DEPLOYMENT.md`.
  Dashboard and every other route are unaffected (still plain CSR, additive change only).

### Unreleased — 2026-09 bug-fix backlog (product feedback)
_Committed directly to `master`, one batch per commit — see commit messages for detail._

- **Trainer/center professional display name.** `PublicUserProfileResponse` /
  `PublicDirectoryEntryResponse` gained a resolved `displayName` (trainer/center's own
  `name` field, not their personal firstname/lastname) so a trainer or center that coaches
  under a different name shows correctly everywhere another user sees them: profile header,
  member directory, connection search, @mention suggestions. Frontend: `berliz@5854496e`.
  Backend: `com.berliz@3f04cb1`.
- **Booking/peer-session date & time pickers.** New shared `app-date-strip` (was hard-capped
  at 21 days with no way past it — now has a "More" control plus a "Pick" custom-date escape
  hatch) and `app-time-picker` (replaces native `<input type="time">`, which silently ignores
  `placeholder` and overlapped neighbouring fields in the Propose Session modal). Wired into
  Booking and Propose Session. `berliz@8666fe69`.
- **In-app nav "Reset position" actually moves the button.** `CdkDrag` only reads
  `[cdkDragFreeDragPosition]` for its initial position; Settings' reset now calls
  `setFreeDragPosition()` on the drag directive by hand. `berliz@2a25861b`.
- **Fixed a false "trainer not available" rejection.** Picking a real calendar slot
  round-tripped an instant through the browser's timezone and back through the server's
  `ZoneId.systemDefault()` — two unrelated zones re-interpreting the same wall-clock slot,
  which could shift it outside the provider's availability window. The client now sends the
  slot's raw local date/time alongside the instant; the server resolves `scheduledAt` from
  those directly, in the same zone basis the slot was generated in. `berliz@6ab1cd16` /
  `com.berliz@b92222a` (+ regression tests).
- **Reopen / delete / message a cancelled booking.** Providers previously had zero actions
  on a cancelled booking — Reopen re-runs the same review-the-client modal as a fresh
  request, Message jumps to that client's thread, Delete (confirm-gated) clears it for good.
  New `DELETE /booking/{id}` (provider-only, cancelled bookings only, blocked if a Payout
  already references it). `berliz@89966853` / `com.berliz` (delete endpoint + tests).
- **Review-booking modal's "View profile" no longer leaves the dashboard.** It built a link
  to the public `/user/:username` page — which takes an already-signed-in trainer out of the
  app entirely — instead of the protected `/dashboard/user/:username` route that exists for
  exactly this. `berliz@e7acf58a`.
- **Fixed the private/public account wording mismatch in Settings.** The visibility section
  was statically headed "Public profile" even for a private (default) account, whose label
  right below it read "Keep my profile private" — heading and content disagreeing at a
  glance. Heading is now the neutral "Profile visibility"; the label now states the current
  setting directly rather than reading as an instruction. `berliz@ea65f9ca`.
- **Fixed expired/invalid JWTs never triggering the frontend's auto-refresh.** `JWTFilter`
  had no try/catch around token parsing, so any JJWT failure escaped to Spring Boot's
  generic `/error` fallback with a message that never varied by cause — the frontend's
  refresh-on-401 logic specifically looked for "jwt expired" in that message, so an
  ordinary expired access token (the most common cause of a 401) never triggered a
  refresh; the app would just keep 401ing every request until a manual reload/re-login.
  Backend now reports the real reason against the real path; frontend now attempts a
  refresh on any 401 instead of pattern-matching. `berliz@3c9542df` / `com.berliz@e9560a6`
  (5 new tests).
- **Fixed false "User not found" when an unrelated profile extra fails to load.**
  `getPublicProfile` shared one try/catch around its whole body, so an exception building
  ANY optional extra (templates, testimonials, timeline posts, resolving a professional
  name) silently became a 404 — indistinguishable from the user genuinely not existing,
  confusing since their name still showed fine in the member directory (a separate query).
  Each block now degrades on its own instead of taking the whole profile down.
  `com.berliz@e9560a6` (regression test).
- **Messaging UI: Instagram-style list, wider bubbles.** The full Messages page's
  conversation list used a hard `divide-y` line between every row; dropped it to match
  the popup's own divider-free list. Message bubble max-width bumped 75% → 85%.
  `berliz@5b04c3b6`.
- **"Who liked this trainer/center" list.** The Likes stat tile on all four trainer/center
  detail views (public + dashboard-native) is now clickable, opening the same likers
  modal used for post/comment likes. New `GET /trainer/{id}/likes` / `/center/{id}/likes`.
  `berliz@bff86e37` / `com.berliz@5234484` (+ tests).
- **Stripe payment redirect stays in the protected app.** `/payment/success` and
  `/payment/cancel` aren't under `/dashboard`, so the route-driven chrome switch put
  them on the public marketing navbar — jarring mid-checkout, since reaching either
  page requires already being signed in. `berliz@5619eaf9` (+ test).
- **Fixed selecting a free ($0) plan doing nothing.** Every plan, including free ones,
  went to `PENDING_PAYMENT` awaiting a Stripe Checkout session — but Checkout can't
  meaningfully complete a $0 charge. A free plan now activates immediately.
  `berliz@bdf0e68f` / `com.berliz@9e9ef81` (+ test).
- **Renew modal explains what renewing does while still active.** Shows an inline
  banner ("adds on top of that date, doesn't replace it") plus a live "New access
  until" preview, computed the same way the backend actually extends the date.
  `berliz@df64d3fc` (+ tests).
- **Fixed the bio field silently requiring 900 characters.** A prior commit updating
  the bio min-length hint text to "10 characters" only changed the display copy —
  the real `Validators.minLength(900)` on the profile-edit page was never touched,
  so it stayed impossible to satisfy. Fixed to match, and aligned the separate bio
  field on the full profile-settings form (was `minLength(8)`) to the same standard.
  Also: today's-todo's task field no longer requires 20 characters minimum, and both
  it and its due-date field show a specific inline error instead of only a vague
  "Missing required fields" banner. `berliz@00972467` (+ test).
- **In-app nav control: long-press-to-hide + edge-docking.** Two new per-device
  gestures on the floating back/forward pill, on top of the existing Settings toggle
  (style `button`/`swipe`/`off`, already there before this entry). Long-press the pill
  and a red "✕" target fades in above it; drag the pill onto it and release to hide the
  control entirely (same effect as switching to `off`, reversible from Settings) — a
  `dragOccurred` flag on the press/drag handlers keeps the native `mouseup`/`touchend`
  reset from racing CDK's own `cdkDragEnded` reset when a drag actually happened.
  Separately, dragging the pill to either screen edge collapses it to a small peek tab
  instead (`NavControlsService.docked`/`dockY`, persisted); tap the tab to bring the
  full pill back at its last free position. Covers the "some users want it, some find
  it in the way" spectrum: full control, edge-parked, or fully off. `berliz@e67406f8`
  (+ tests).
- **Fixed "null null" showing up as a name on incomplete profiles.** 17 call sites
  across 10 backend mapper/service classes (comments, posts, messages, connections,
  peer sessions, trainer/center likers, feedback, blocks, content reports) built a
  displayed name via plain `firstname + " " + lastname` concatenation — Java prints
  the literal word "null" for whichever half is null (an OAuth signup that never
  collected a last name, an admin-created account, etc.), which is exactly what
  showed up as a comment author's name. New `DisplayNameUtil.fullName()` is the one
  shared null-safe join every call site now uses. `com.berliz@fdf1cee` (+ test).

### Unreleased — "Post interaction & UX" work
_Branch: `claude/xenodochial-kirch-459f51` → follow-on branch_

- **Stripe recurring-subscription lifecycle, refunds, past-due.** `Subscription` now keeps
  `stripe_subscription_id` / `stripe_customer_id` / `past_due_since` (V41); `Payment` keeps
  `stripe_invoice_id` / `stripe_refund_id` / `refunded_at`. The webhook grew from
  `checkout.session.completed`-only to also handle `invoice.paid` /
  `invoice.payment_succeeded` (record the renewal `Payment`, push `endDate` out a month,
  clear the past-due + reminder stamps, dedupe on invoice id, skip the first
  `subscription_create` invoice), `invoice.payment_failed` (→ `PAST_DUE` + `pastDueSince`,
  notify), and `customer.subscription.deleted` (→ `CANCELLED`). D11 cancel/resume now also
  drives Stripe `cancel_at_period_end`. New `POST /payment/stripe/refund/{paymentId}`
  (admin-only) reverses a charge and stamps the row — surfaced as a "Refund via Stripe"
  action in the admin payments list. `SubscriptionRenewalReminderScheduler` gained the first
  end-user-`Subscription` expiry sweep (auto-renew-off past `endDate`; `PAST_DUE` past a
  5-day grace → inactive). Backend on `com.berliz@560942d`.

- **D11 — Pre-renewal reminder + easy cancel.** `Subscription` gains `auto_renew` /
  `cancelled_at` / `renewal_reminder_sent_at` (V40). `POST /subscription/cancel` turns off
  auto-renew for the caller's active subscription (idempotent) and keeps `status` active so
  access runs to `endDate` — the existing expiry sweep flips it then; `POST /subscription/resume`
  undoes it; `renewSubscription` clears both stamps for the next cycle. New
  `SubscriptionRenewalReminderScheduler` (daily `@Scheduled`, same model as
  `TrainerSubscriptionScheduler`) sends a one-time bell + email ~2 days before renewal. FE:
  "Cancel auto-renew" / "Resume auto-renew" in the My Subscriptions row menu (cancel behind a
  one-tap confirm), plus a "Won't renew · access until …" badge on the active card. Backend
  on `com.berliz@3cc0c91`.

- **D6 (scoped) — connection-scoped run leaderboard.** `GET /run/leaderboard?period=week|
  month|year&metric=distance|pace|sessions` ranks the current user + their accepted
  connections from logged runs in the window — totals only, no GPS traces or route-segment
  matching (the full D6 segment-matching stays out of scope). Each row carries the run
  count, total minutes, and a verified-run count (D9). FE: a new "Leaderboard" tab on
  `/dashboard/runs` (`RunLeaderboardComponent`) with period + metric switchers, medal-tinted
  ranks, avatars linking to profiles, and a "you're #N" line. Backend on `com.berliz@9140a9e`.

- **D12 — Value-first onboarding.** New `OnboardingChecklistComponent` at the top of the
  dashboard home: a dismissible, role-aware first-run checklist. Members get "log your first
  workout / connect with someone / find a trainer or gym"; trainers & centers get "complete
  your profile / share your first post / connect with a member". "Logged a workout" and "has
  a connection" are derived from real data; link-only steps and the dismissal persist in
  `localStorage`. The card auto-hides once every step is done. Frontend-only.

- **D2 — "Your time in Berliz" recap.** `GET /recap/me?period=month|quarter|year|all` —
  recomputed on read from the user's own logs, never gated: active days, workout/run counts,
  total minutes + km, longest in-window streak, personal-best lines, rank moves, top training
  partners (workout-log collaborators + confirmed peer sessions), new connections, a headline
  and a ready-to-post `shareText`. FE: `RecapCardComponent` on the dashboard (trailing-year
  teaser) opens `RecapModalComponent` with a 30d / 90d / year / all-time switcher and a
  one-tap "Share as post" that drops the summary onto the timeline as a `MILESTONE`. Backend
  on `com.berliz@f0b893e`.

- **D10 — Transparent pricing + Book CTA everywhere.** Provider pages already show the full
  monthly rate per mode; added a "no 'from', no hidden fees" line to the trainer pricing card
  and both dashboard provider pages. `PostResponse` now carries `authorRole` +
  `authorTrainerId` / `authorCenterId` (resolved once per distinct provider author on the
  feed / timeline endpoints). New shared `BookProviderButtonComponent` (login-gated via the
  existing `BookingDialogService`) renders a "Book a session" action on a trainer's or
  center's feed posts, on the dashboard user-profile header, and on the public profile
  header. Backend on `com.berliz@de41f88`.

- **D9 — Verified activity badge.** A logged workout or run can be confirmed by a trainer
  or center the athlete is an accepted connection of. `verified` / `verified_by_fk` /
  `verified_at` on `workout_log` + `run_log` (V39), surfaced on `WorkoutLogResponse` /
  `RunLogResponse`. `POST/DELETE /workoutLog/{id}/verify` and `/run/log/{id}/verify`
  (trainer/center + connected + not self; verifying notifies the owner via
  `/topic/activityVerified`). `GET /workoutLog/getUserLogs/{userId}` +
  `GET /run/log/user/{userId}` let a connection list another user's own logs. FE: a shared
  `VerifiedBadgeComponent` tick on the workout-history and runs-history lists; a "Verify
  activity" card on `dashboard-user-profile` (trainer/center viewing a connected member)
  listing recent sessions with a one-tap Verify / ✓ Verified toggle. Backend on
  `com.berliz@419664c`.

- **D7 — Challenges.** `challenge` + `challenge_participant` (V38). A challenge has a metric
  (SESSIONS / DISTANCE_KM / ACTIVE_DAYS) + goal over a date window and a scope (OPEN /
  CONNECTIONS). Progress is recomputed on read from each participant's workout/run logs in
  the window (no scheduler). `POST/GET /challenge`, `GET /challenge/{id}` (leaderboard),
  `POST /challenge/{id}/join`, `DELETE /challenge/{id}/leave`. FE: `ChallengesCardComponent`
  on the dashboard — joined challenges with a progress bar, open ones to join,
  `CreateChallengeModalComponent` + `ChallengeDetailModalComponent` (leaderboard).
  Backend on `com.berliz@8814c24`.

- **D4 — Accountability partners + streak-slip nudges.** `accountability_partner(user,
  partner)` + `accountability_nudge` for rate-limiting (V37). No scheduler — "lapsing" is
  recomputed on read via `StreakService.daysSinceLastActivity`. `PUT /accountability/partners`
  (accepted connections, max 3), `GET /accountability/partners` (per-partner days-since +
  lapsing + nudgedRecently), `POST /accountability/nudge/{id}` (notification, ~1/day/pair).
  FE: `AccountabilityCardComponent` on the dashboard beside the streak ring — lapsing
  partners get a one-tap Nudge; "Manage" opens `ManagePartnersModalComponent` to pick from
  connections. Backend on `com.berliz@9f67b43`.

- **D3 — Belt / rank progression tracker.** `rank_award(user, discipline, rank, note,
  awarded_by, awarded_at)` (V36). `POST /rank/award` (trainer / center only) records the
  promotion, notifies the member, and drops a `MILESTONE` post on their timeline;
  `GET /rank/user/{id}` / `/rank/me` return disciplines with current rank + since + history.
  FE: `RanksCardComponent` (🥋, current rank per discipline, expandable history) on the
  dashboard and public profiles; an "Award a rank" button + `AwardRankModalComponent` for a
  trainer/center viewing a member. Backend on `com.berliz@c77a371`.

- **D15 — Bookmarks.** `saved_item(user, type, id)` (V35) + `SavedService` FE state holding
  a `"POST:12"` set: `POST /saved`, `DELETE /saved/{type}/{id}`, `GET /saved/refs`
  (lightweight), `GET /saved` (hydrated, drops dead/blocked refs). A bookmark toggle on every
  post card (feed + both profiles); a "Saved" entry in the account dropdown opens
  `SavedItemsModalComponent` listing saved posts + workouts, each removable in place and
  workouts cloneable. Backend on `com.berliz@13e373f`.

- **D14 — Link a workout template to a post → one-tap clone.** `Post` gains an optional
  `workout_fk` (V34); `PostRequest.workoutId` on create/update, `PostResponse.workoutId` +
  `workoutName` on read. The feed composer shows a template picker when the WORKOUT chip is
  active; a WORKOUT post with a link renders an orange strip with "Add to my workouts" that
  clones it via `POST /workout/cloneTemplate/{id}`. Backend on `com.berliz@0e8643e`.

- **D8 — Personal-best detection → milestone post.** On a fresh workout/run log the
  backend returns `personalBests[]` — run: longest distance / longest time / fastest pace;
  workout: heaviest set / longest session — comparing against the user's own history (never
  blocks the save; a first-ever log yields nothing). The log modals then pop
  `PrCelebrationModalComponent` ("🏆 New personal best!") with a pre-filled, editable draft
  that one tap posts as a `MILESTONE`. Backend on `com.berliz@f4b54f4`.

- **D1 — Training consistency streak.** `GET /streak/me` returns the current streak, the
  all-time best, whether today counts yet, and Monday–Sunday of the current week with a
  per-day active flag (an active day = ≥1 logged workout or logged run). New
  `ConsistencyRingComponent` on the dashboard home: 🔥 + streak number, this week as
  filled/empty day dots, and the best/total line. Backend on `com.berliz@e09bcef`.

- **D5 — Multi-reactions on posts and comments.** A like now carries a type:
  👍 Like (default) / 💪 Strong / 🔥 Fire / 👏 Clap / ❤️ Love. Backend: `reaction` column on
  `post_like` / `comment_like` (V33), `ReactionType` enum, `?reaction=` on the like endpoints,
  `myReaction` on `PostResponse`/`CommentResponse`, `reaction` on `LikerResponse`. Frontend:
  new shared `ReactionButtonComponent` — plain click toggles 👍, hover (desktop) / long-press
  (touch) opens the emoji picker; a "N reactions" affordance opens the list. Wired on the feed,
  the dashboard profile, and comment threads; the "Reactions" modal shows each person's emoji.
  (The bare public `/user/:username` page keeps its read-only reaction count.)

- **Comment thread: failed load no longer looks empty.** Distinct loading / error+Retry /
  empty / list states in `PostCommentsComponent`; re-fetches when the bound post is swapped
  while the panel is open. (WS1)
- **Top-bar avatar opens the account menu, not a photo lightbox.** The global
  `ClickablePhotoDirective` was hijacking the click; the top-bar + dropdown avatars now
  carry `noZoom`. (WS8a)
- **Comment likes + "who liked" (posts & comments).** Backend: `comment_like` table,
  `PUT /comment/like/{id}`, `GET /comment/{id}/likes`, `GET /post/{id}/likes`, block-aware
  comment reads. Frontend: heart toggle per comment (optimistic), a "N likes" affordance on
  post cards and comments opening `LikersModalComponent` (avatar + name + @handle, links to
  profile). (WS2–WS6a)
- **Threaded comment replies (nested).** Recursive `CommentNodeComponent` — Reply box per
  comment, "View N replies" lazy-loads via `GET /comment/{id}/replies` with paging, replies
  can be replied to (unbounded depth, indent capped). `@mention` autocomplete extracted into
  a shared `MentionInputComponent` used by the root box, edit fields, and reply boxes.
  `post-comments.component` slimmed to just list + paging + compose. (WS6b)
- **Media + comments bottom sheet replaces the post-image lightbox.** New
  `PostDetailSheetComponent`: tap a post image on the feed, the dashboard profile, or the
  public profile → a bottom sheet opens at ~half height with the media on top and the full
  comment thread below; drag the grabber to snap full / flick down to dismiss; Esc + backdrop
  close; `prefers-reduced-motion` opens straight at full. `post-media-viewer.component` deleted.
  Non-post images still use the plain `PhotoLightboxService`. (WS7)
- **Avatars navigate instead of zooming.** `ClickablePhotoDirective` now ignores any image
  inside a link/button (that ancestor's action owns the click) and only makes *bare* images
  zoomable. Removed the explicit `lightbox.open(...)` handlers that were blocking navigation
  on comment-author, connections, and member-directory avatars; wrapped the connection
  request-row avatars in a profile link. (WS8b)
- 🚧 **Comment likes** — like/unlike + count, backend `CommentLike` entity + `PUT /comment/like/{id}`.
- 🚧 **Threaded replies** — nested to arbitrary depth; `GET /comment/{id}/replies`; delete
  cascades the subtree; reply notifies the parent comment's author.
- 🚧 **Who liked** — `GET /post/{id}/likes` and `GET /comment/{id}/likes`; tap any like count
  to see the list (block-filtered).
- 🚧 **Comment visibility & blocking** — `getComments` now hides threads/authors in a block
  relationship with the viewer (previously no block check at all).
- 🚧 **Media + comments bottom sheet** — Instagram/TikTok-style, snap points half/full,
  swipe-to-dismiss; replaces the post-image lightbox on feed, dashboard profile, and public
  profile. `post-media-viewer` folded in and removed.
- 🚧 **Avatar clicks go to the profile** everywhere except the top-bar avatar.
- 🚧 **Top-bar avatar opens the account menu**, never a photo viewer.

### Earlier (from git history)
- Image/file attachments in messaging
- Passkey (WebAuthn) login + passkey management in settings; nav-control styles; "what's new" badges
- Group runs scheduling/logging; admin exercise-suggestions review
- Reply-with-quote and message edit/delete
- Workout logging + log sharing
- Peer sessions
- Blocking + content reports
