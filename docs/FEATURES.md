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
| Email/password signup, activation email, password reset | ✅ | Signup asks only for the essentials (name, DOB, gender, email, password) — profile photo and the location/phone block are optional and deferred to the onboarding checklist's "Complete your profile" step. After signup (form or quick-signup) the user lands on `/login/activate-account` with their email pre-filled and a "we've sent a code to …" message, not a bare login page |
| Social login — Google, Facebook | ✅ | `/auth/google`, `/auth/facebook` |
| Passkey / WebAuthn login | ✅ | Passwordless; passkeys managed in Settings |
| Roles — client, trainer, center/partner, member, admin | ✅ | Drives dashboard, discovery, permissions |
| Public profile page (`/user/:username`) | ✅ | Visibility toggle: private vs public; admin can view-through with a banner |
| Profile photo with in-app cropper | ✅ | |
| Account settings (merged Profile + Settings) | ✅ | Includes "what's new" badges, passkey management, sidebar display prefs |
| Gender field — inclusive options | ✅ | Male / Female / Non-binary / Prefer not to say, driven by one shared `GENDER_OPTIONS` constant across every picker (signup, signup modal, Settings, both admin edit-user modals) instead of each hardcoding its own binary radio pair. Backend stores `User.gender` as free text with no enum constraint, so this was purely a frontend change |
| Value-first onboarding checklist | ✅ | Dismissible, role-aware first-run checklist at the top of the dashboard home (complete your profile / log a workout / connect / find a provider — or profile/post/connect for providers; "Complete your profile" is how regular users add the photo and location that signup no longer requires); progress is data-derived where possible, dismissal + click-steps persist in `localStorage`. No paywall in the path |
| Block / unblock users | ✅ | Two-directional enforcement across messaging, mentions, comments |
| Report content (posts, comments) | ✅ | Feeds admin content-report queue |

## 2. Social — feed, posts, connections

| Feature | Status | Notes |
|---|---|---|
| Connections (request / accept / remove) | ✅ | Gates the feed audience |
| Timeline / feed of connections' posts | ✅ | `dashboard-timeline` |
| Create post — text, photo or video, activity type badge | ✅ | Types: GENERAL, WORKOUT, SESSION, TESTIMONIAL, REVIEW, PROGRESS, MILESTONE. **A post carries one photo OR one video** (MP4 / WebM / MOV, up to 50MB, uploaded like any other media); the composer disables the other picker once one is attached, and the server rejects both together and clears the old media when an edit swaps it. Videos play inline in the feed, on both profile pages and on the Saved page, and in the media + comments sheet. *This row used to say image/video, but posts were photo-only on every layer until now.* |
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
| Fitness achievements | ✅ | `/dashboard/achievements` (sidebar: "Achievements") — a private list of your medals, certifications and milestones: name, date, optional details, optional certificate file (uploaded like any other media). Add, edit, delete (with an inline confirm). Strictly per-user: the API (`/achievement/add|update|delete|mine`) reads someone else's id as not found. Not shown on public profiles (no visibility rule decided yet). **Previously listed ✅ but nothing existed** — only an entity with an empty repository/service/REST interface. |
| Peer sessions (propose / schedule training with a connection) | ✅ | "My Sessions" |
| "Your time in Berliz" recap | ✅ | Real deep-linkable route (`/dashboard/recap?period=`, replacing the old dialog-only entry point) — 30d / 90d / year / all-time, active days, sessions, km, best streak, PRs, rank moves, top partners; one-tap "Share as post" (now surfaces the actual backend rejection reason instead of a generic "could not share" on failure). Always free. `GET /recap/me` |
| Workout Room hub (`/dashboard/workout-room`) | ✅ | One landing page, "Workout Room" in the sidebar, that links out to every training tool (Workouts, workout history, Exercises, Runs, My Progress, Tasks, To-do, Messages, and — providers only — Client Intakes) plus a glance at your 4 most recent logged sessions and a "Browse templates" prompt. Pure aggregation over the existing `WorkoutService` endpoints, no backend. Header shows a **workout streak** badge (consecutive days with a logged session; today *or* yesterday counts as current so it isn't shown broken before you've logged today) and a longest-streak line. Streak is computed client-side from the user's own logs — separate from the dashboard's server-side consistency ring (D1), so the two numbers can differ |
| Verified activity | ✅ | A connected trainer/center confirms a logged workout/run; a "Verified" tick shows on the history list. `POST/DELETE /workoutLog/{id}/verify`, `/run/log/{id}/verify` |

## 5. Discovery & marketplace

| Feature | Status | Notes |
|---|---|---|
| Find trainers — active trainers, profiles, pricing, benefits, reviews | ✅ | Public trainer pages `/trainers/:name` |
| Find centers/gyms — active centers, equipment, reviews | ✅ | |
| Categories & martial-arts classification | ✅ | |
| Member directory | ✅ | `/dashboard/member-directory` |
| "Find a Provider" flow | ✅ | |
| Bookings | ✅ | `/dashboard/my-bookings`; each provider can set their own booking notice (lead time) AND their own session length (slot duration, 5-480 min, default 60) in My Availability Editor — `/availability/leadTime` \| `/slotDuration`. A client can also send an "urgent request" outside normal hours (flagged on the provider's list); a provider can approve-and-reschedule a pending request to a new time in one step, or book+confirm directly for one of their own clients |
| Client intake forms | ✅ | |
| Testimonials & reviews (trainer/center) | ✅ | |
| Trainer location + service mode (in-person / online / hybrid) | ✅ | |
| Choose where to train: trainer's listed locations (+ optional per-location fee) and optional client-chosen custom location (+ fee) | ✅ | Trainers only; client picks at booking and sees the fee before sending. Location text + fee are snapshotted on the booking |
| Transparent pricing + Book CTA everywhere | ✅ | Provider pages state "full price — no 'from', no hidden fees"; a "Book a session" action appears on a trainer's/center's feed posts and on their profile header (`BookProviderButtonComponent`), not just the dedicated provider page |

## 6. Payments & subscriptions

| Feature | Status | Notes |
|---|---|---|
| Subscription plans (3-tier), role-targeted | ✅ | See [[project_payment_subscription_model]] |
| Stripe Checkout (one-time + recurring) | ✅ | Plan pick → hosted Stripe Checkout → `checkout.session.completed` webhook records the `Payment` + activates the sub, capturing the Stripe subscription/customer id |
| Stripe recurring lifecycle | ✅ | Webhook handles `invoice.paid` (record renewal, extend `endDate`), `invoice.payment_failed` (→ PAST_DUE + grace), `customer.subscription.deleted` (→ CANCELLED); nightly sweep expires auto-renew-off past `endDate` and past-due beyond the 5-day grace |
| Stripe refunds | ✅ | Admin "Refund via Stripe" on a payment row → `POST /payment/stripe/refund/{id}` reverses the charge and stamps the row |
| Pay for a single booked session | ✅ | Provider confirms → booking priced (hourly rate × minutes, less promo/credit, plus location fee) → client taps **Pay $X** in My Bookings → hosted Stripe Checkout → webhook marks it Paid. Cancelling a paid session auto-refunds. Payout is only created for a paid session |
| Bypass / promo codes | ✅ | Admin creates discount codes at `/dashboard/hub/promo-codes` (percent or fixed amount; scope = everyone / one role / one plan; expiry, redemption cap, once per user; pause/resume). On **My Subscriptions → Plans** a user enters a code, sees the discounted price per plan, and checkout sends `discountCode`; the backend re-validates it and applies a one-time Stripe `Coupon` (never discounts below the minimum charge). Redemption is recorded when the Stripe webhook confirms payment. Backend: `DiscountCode`/`DiscountCodeRedemption` (V63), `DiscountCodeService`, `/discountCode/*`. Codes that grant free access (no Stripe) are still the older redeem-a-code box |
| Pre-renewal reminder + one-tap cancel | ✅ | Daily sweep emails + bells a member ~2 days before renewal (once/period); "Cancel auto-renew" / "Resume auto-renew" in the My Subscriptions menu — cancel keeps access until `endDate` and also sets Stripe `cancel_at_period_end`. `POST /subscription/cancel` \| `/resume` |
| Stripe Connect payouts (to trainers/partners) | ✅ | One Express account per provider, reused on every later call. The Earnings tab shows a "Set up payouts" / "Finish setting up payouts" / "Payouts ready" banner from `GET /payment/stripe/connect/status`; its button opens a Stripe link from `POST /payment/stripe/connect/onboarding-link` (setup while unfinished, the Express dashboard once done). Stripe sends the provider back to `/dashboard/my-bookings?payoutSetup=return` (or `=refresh` if the link expired, which opens a fresh one for the same account). `Transfer.create` pays out to that account |
| Bills / orders / store / products | ✅ | Commerce primitives present |

## 7. Notifications

| Feature | Status | Notes |
|---|---|---|
| Notification bell + dropdown, DB-backed | ✅ | |
| Live desktop push while tab open | ✅ | Per-user STOMP queue |
| Categories — messages, comments, mentions, posts & feed activity | ✅ | |
| Notification deep-linking | ✅ | Every notification carries an `entityType`/`entityId` pair; clicking it in the bell/My Notifications routes straight to the thing it's about (a conversation, a booking, a post's comment thread, ...) instead of just showing text — `notification-entity-link.util.ts` |
| Email notifications, per-category opt-out/opt-in, with the same deep link | ✅ | Messages/bookings/account-&-partnership default ON; likes-&-comments on your own posts ("social") defaults OFF since it's by far the highest-frequency category — all four toggle independently in Settings ("Email notifications" card, with Allow-all/Stop-all shortcuts). One choke point, `NotificationListener`, decides per notification whether to also email it; the email's button reuses the exact same `entityType`/`entityId` deep link the in-app notification carries (`EmailDeepLinkUtil`, mirroring the frontend's own routing table) so it lands on the actual conversation/booking/post, not just the dashboard home. Likes on a post or comment didn't notify anyone at all before this — `PostServiceImplement`/`CommentServiceImplement` now publish a notification (in-app + push + email) the same way comments already did |
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
| D13 | Dark mode (app-wide) | ✅ | — | Real infrastructure: Tailwind `darkMode: 'class'`, a `ThemeService` (Light/Dark/System, per-device like the other display prefs) — now also exposing an `isDark$` `BehaviorSubject` (mirroring `NavControlsService`'s reactive pattern) so components that can't rely on Tailwind's `dark:` classes (Chart.js canvases, configured via JS options objects) can react live to a theme toggle instead of only reading the plain `isDark` getter once at creation time — a toggle in Settings ("Appearance" card). Converted so far: the dashboard shell (`sidebar` layout wrapper + `TopBar`), the full Settings page, a batch of high-traffic surfaces — Dashboard home's own inline markup, the whole Messages surface (conversation list, bubbles, composer, floating popup), Bookings (list + the shared `booking-card` used by both client and provider views), My FAQs, Connections, the Timeline/feed page (compose box, tab toggle, post cards) plus the shared `refresh-button` used across most dashboard pages , the shared `post-comments`/`comment-node`/`reaction-button`/`mention-input` components used by every comment thread (Timeline, dashboard user profiles, public profile once signed in — those four already carry their own pre-existing `dark` `@Input` for the *separate*, always-dark public-profile/media-sheet rendering; the `ThemeService`-driven `dark:` classes were layered on only in their `!dark` branches, so always-dark call sites like `post-detail-sheet`'s `[dark]="true"` are untouched) — and now all ~14 Dashboard-home widget cards (Overview, Now active, Users, Notifications, Suggested, Trending exercises, Quick links, Timeline preview, Tasks/Workouts/Todos, and the login/activity/app/subscription analytics charts), the shared `user-hover-card` popover used throughout the admin tables, and the remaining four Dashboard-home widgets (`accountability-card`, `challenges-card`, `consistency-ring`, `onboarding-checklist`) that complete that page's coverage — `recap-card` is left alone on purpose, its permanently-dark gradient card was already fixed-dark by design. Now working through **`/dashboard/admin/*`** (the biggest remaining bucket, ~156 templates across ~28 CRUD sections) — 28 sections fully converted so far (trainers, centers, users, tags, muscle-groups, categories, exercises, faqs, bookings, equipment, problem-reports, content-reports, berliz-feedback, exercise-suggestions, availability, payments, subscriptions, members, clients, partners, trainer-pricing, center-pricing, testimonials, tasks, sub-tasks, todo-lists, contact-us, newsletters) — **the entire `/dashboard/admin/*` CRUD sweep is now complete.** Plus the shared `admin-search` bar used by every admin list. See the Changelog below for the full per-pass breakdown. Also added a global CSS rule (`html.dark .mat-dialog-container`) since Angular Material's dialog panel is a hardcoded-light surface from the imported `indigo-pink` prebuilt theme that never responds to Tailwind `dark:` classes on its own — every admin add/edit/detail modal renders directly against that panel with no background of its own, so this one override unlocks dark mode for every current and future Material dialog app-wide, not just these sections. Chart canvases (Chart.js) still render with their existing light-only grid/tick colors — retuning every chart's internal color for dark-mode contrast is its own pass, not bundled into this one. The public marketing site (`topbar` layout) is untouched on purpose — it's permanently dark by brand design already, same as the mobile app's own legal/marketing screens. Now moving through the rest of the dashboard's non-admin surfaces: the full **My To-do List** feature (header/list/item/section/form/metrics/heatmap/timeline/analytic-chart, plus the `getColor()` heatmap-intensity helper in its `.ts`, which returns Tailwind classes dynamically and needed its own `dark:` variants since Tailwind can't infer them from a runtime string), and the `src/app/user/*` profile surfaces — avatar, bio editor, profile identity/stats, account info, progress-sharing settings, photo cropper, danger zone, the full profile-settings form (personal info, gender pills, country/state/city pickers), and the My Progress check-in tracker (`user-progress`, not `user-profile-settings.component.html`, which was already converted in an earlier phase's Settings-page pass). Also added a global CSS override for `.berliz-select` (the shared `ng-select` styling for every country/state/city picker app-wide), mirroring the existing `.mat-dialog-container` fix — like that dialog panel, `ng-select`'s internals are plain CSS with hardcoded light colors, invisible to Tailwind's `dark:` variant scanner, so every picker on `location-form` and `partner/trainer-data` benefits from this fix too even though those components haven't been touched yet. and the full **Runs** feature (discover/my-runs/history/leaderboard tabs, create/log/invite modals — status pills for pending/accepted/invited/cancelled, history stat cards, the leaderboard's rank-medal colors). Note: a concurrent session independently finished dark mode for My Notifications and most of Messages/Connections/Hub around the same time, so those no longer need a pass here. and the full **My Subscriptions** feature (analytics cards, active/due/expired rows, per-row action + bulk-action dropdowns, the detail modal, the plans/checkout grid with its redeem-a-code box, and the subscription timeline). and, once the earlier collision risk cleared, the re-pass on **Bookings** — restoring the `dark:` classes on `booking-card` that a later, unrelated "send intake form" merge had silently stripped (both `booking-card` and `booking-details-modal` compute their status pill's classes in a `.ts` getter, so both getters needed their `dark:` variants added directly, same pattern as the earlier heatmap/bio-editor fixes), plus the rest of the module: bookings-empty, manage-bookings' tab toggle, the review-booking modal, the provider earnings view (with its own `statusClasses()` getter), and the weekly-availability + booking-notice editor. and the **Promotions** feature (Deals feed, My Promotions, My Rewards' redeem/history/leaderboard cards, the promotion form modal, and the admin growth-campaigns screen — the referral card and `promo-badge-list`'s gradient badges are left alone on purpose, permanently-colored by design like `recap-card`). and **My Tasks** (tabbed tasks/workouts shell, exercise-based task cards with priority/status pills, expandable sub-step checklists, and the assign-task modal with its priority-pill selector and dynamic exercise-step form array). and **Peer Sessions** (client/personal/collaborations tab shell, pending/confirmed/past session cards, group-run collaboration cards with invite/join/awaiting-creator states, and the propose-session modal). and a bundle of smaller single/few-file surfaces: **Client Intake** (the form itself — its non-dismissible amber legal-disclosure banner is left permanently-colored on purpose, matching the public terms page — plus the My Client Intakes list), **My Testimonials**, **My Equipment**, **Liked Trainers**, **My Drafts**, and the **Payment** success/cancel pages. and the full **Workouts** feature (My Workouts/Templates tabs, the drag-and-drop workout builder with its exercise library and reorderable exercise rows, workout detail's exercise-by-exercise breakdown, workout history's stats/personal-records/timeline, My Assigned Workouts, and the assign/log/share/exercise-progress modals). Several workouts components compute their status/difficulty pill classes in a `.ts` getter (`statusClass()` in both `my-workouts` and `my-assigned-workouts`, `difficultyClass()` in `workout-detail`, `deltaClass()` in `exercise-progress-modal`) — all got `dark:` variants added directly, same pattern as earlier passes. and the full **My Trainer** feature (15 files: the trainer-review client-testimonials list with its before/after body-angle photo grid, the activate/renew subscription modal, trainer benefits/pricing/testimonials/shared-progress/centers/clients/likes cards, and the larger trainer-introduction/subscriptions/main/feature-videos/photo-album/video-album surfaces — including the video/photo cropper and trim sub-modals, upload-progress bars, and per-slot upload/crop/trim status badges). and the rest of the dashboard chrome under **`navbar/`**: the breadcrumb trail, the notification-bell dropdown, the profile menu (+ its photo-cropper sub-modal), and the unified global-search bar and its results panel. `side-bar`/`side-bar-open`/`side-bar-close` (the left nav rail) were left alone on purpose — they're a permanently-dark rail by design (hardcoded `bg-gray-950`/`text-white`, no light variant at all, same pattern as `recap-card`), not a light surface waiting for `dark:` classes. `sidebar-navigation` and the 18 `search-*` result components plus `navbar/search/` are dead code (only ever referenced by that same dead `sidebar-navigation`, superseded app-wide by `global-search`) — left untouched, same as other unfinished/unreachable stubs. and the full **Partnership** (`partner/`) feature (17 files: the partner-null/partner-application onboarding cards, the center profile — data form, introduction, pricing, equipment, locations, photo/video albums, announcements, affiliated trainers, member reviews, likes — and the trainer side's own profile/pricing/data form with its country/state/city availability picker). `partner-main`/`partner-route`/`partner` were left untouched — pure structural passthroughs (a stub, a `<router-outlet>`, and a conditional-component switch) with no color classes of their own to convert. and the remaining native (non-admin) `dashboard/` surfaces (10 files): the exercise library + equipment catalogue (tabs, filters, category chips, and the center-only "My equipment" management grid), the standalone exercise-detail page, the profile/settings tab toggle, Find a Provider (trainers/centers/services search), and the three dashboard-native provider-profile pages (trainer detail, center detail, category/service detail) plus the dashboard-native user-profile-and-timeline page — all extending the same data/logic as their public counterparts but with the light dashboard theme instead of the public always-dark one. Also the equipment-form and today's-todo `MatDialog` modals. Left untouched: `dashboard-route` (pure `<router-outlet>`), and — confirmed genuinely dead/unreachable via `grep` (no route, no selector usage, no `dialog.open()` call) — `search-todo`, `todo-form`, and `edit-todo`. The six `dashboard/user/*` files (activate-account, reset-password, and their modals) are out of scope entirely — despite the folder name, they're mounted at root `login/*` routes, not under `/dashboard`, so they're part of the permanently-dark public site. and a triaged sweep of the `shared/` directory (21 dashboard-scoped files converted; several genuinely out-of-scope or dead ones deliberately skipped after checking actual usage rather than assuming): the partnership application dialogs (`center-form-modal`, `trainer-form-modal`, `partner-form` — the last is dual-use between dashboard and public, its `motivationClasses()`/`socialFieldClasses()`/`charCountClass()` `.ts` getters needed `dark:` variants added directly, same pattern as earlier phases), the universal `prompt-modal` confirm/alert dialog (69 call sites app-wide), `renew-subscription-modal`, `todo-details-modal`, `update-email-modal`, `update-partner-file-modal`, `update-trainer-photo-modal`, `view-certificate-modal`, `view-cv-modal`, the real `search-panel` (used by My Notifications and My To-do List, not the same-named but unused `shared/search/search-panel` test stub), `skeleton-loader`, `recap/recap-page`, and `ranks-card` (a dual-use component with its own pre-existing `dark` `@Input` for public-profile parity — same pattern as `post-comments`/`reaction-button` etc. — got `dark:` variants added to its `!dark` branch only). Left deliberately unconverted: `newsletter-popup` and `partner-form-modal` (confirmed via their `.ts` gating logic / consumers to be public-topbar-only); `validation-message` and `location-form` (only ever consumed by the public signup page); `post-detail-sheet` (confirmed permanently-dark by design — hardcoded `bg-zinc-950` etc., already passes `[dark]="true"` to its own children, no `dark:` classes needed); and five components under `shared/search/` (`date-range-drawer`, `filter-chips`, `filter-summary`, `search-bar`, and a `search-panel` whose own selector is literally `app-search-panel-test`) confirmed dead code — declared in a module that gets imported around the app, but never actually placed in any template. and the last two genuine misses found by a fresh full-app re-survey: **Saved** (`saved-page`, the bookmarked posts/workout-templates page) and the **Give Feedback** modal (`footer/berliz-feedback-modal` — lives under `footer/` but is a normal dashboard `MatDialog` opened from the profile menu, not part of the permanently-dark public footer it's filed next to), plus a handful of stray unconverted lines the re-survey caught inside already-mostly-done files (`connections-main`'s search icon/loaders/"You" badge, `dashboard-timeline`'s inactive comment-toggle text color). And, closing out the effort: `date-strip` and `time-picker` turned out not to need the `[dark]`-input retrofit after all — their actual consumer, the public `booking-page`, was already independently converted with plain theme-toggle-aware `dark:` classes (not the permanently-dark-by-hardcoded-color pattern the rest of the public `topbar` layout uses), so both components just needed the same plain `dark:` treatment as everything else, no forced-dark branch required. `nav-history-controls` (the global draggable back/forward pill, mounted outside the layout switch so it renders everywhere) was checked and left alone on purpose — its own doc comment specifies it's "deliberately never a loud color" so it never obscures whatever's underneath it, a permanently-white/translucent design choice by explicit intent, same as `recap-card`. **With this, every dashboard-scoped template the survey could find is now converted.** The re-survey also turned up several already-dead, never-instantiated stub components (`user/{user-info,user-main,user-profile-card,user-security,user-settings}`, `my-subscriptions/my-subscriptions` (distinct from the real `-main`), and six more `shared/*-modal` name-collision duplicates of components that actually live under `dashboard/user/*`/`admin/users/*`) — flagged for a future cleanup pass, not touched here since deleting dead code is a separate concern from dark-mode conversion. Finally, the Chart.js canvas retuning pass explicitly deferred all the way back at the admin-sweep phase: all 5 chart components app-wide (`dashboard-login-chart`, `dashboard-activity-chart`, `dashboard-subscription-analytics`, `dashboard-app-analytics`, `my-todo-list-analytic-chart` — confirmed exhaustive; no `ng2-charts`/`BaseChartDirective`/`ngx-charts` usage exists anywhere, every chart is a raw `new Chart(...)` against a template canvas) had their hardcoded light-only `ticks.color`/`grid.color` swapped for `ThemeService`-driven getters, and each now subscribes to the new `isDark$` to live-update an already-rendered chart's colors on toggle rather than requiring a page reload. The login chart's near-black `rgba(17,24,39,0.75)` "Mobile"/"iOS" legend-swatch color (which read fine on a light card but nearly vanished on a dark one) was swapped for a theme-neutral mid-gray. Tooltip colors (already dark-styled, `#111827` background matching the app's own `bg-gray-900` dark surface almost exactly) needed no change. The permanently-dark-by-design public site remains the only other item genuinely out of scope. |
| D14 | "Do this workout" — clone a linked workout from a feed post | ✅ | ✚ |
| D15 | Saved / bookmarked posts & workouts | ✅ | ✚ |

## 9. Platform / admin

| Feature | Status | Notes |
|---|---|---|
| Full admin suite | ✅ | Users, trainers, centers, categories, tags, equipment, FAQs, testimonials, newsletters, bookings, payments, subscriptions, tasks, to-do lists, partners, muscle-groups, exercises, problem reports, content reports |
| Analytics dashboard | ✅ | `Analytics` |
| Berliz feedback + problem reports | ✅ | |
| Server-side role & ownership authorization | ✅ | Every admin-only backend operation and every "only the owner (or an admin)" operation is now enforced twice: by the existing in-method check *and* by Spring method security (`@PreAuthorize`) before the method runs. Roles now map to real authorities (`ROLE_ADMIN`, `ROLE_TRAINER`, …) — previously every signed-in user carried an empty authority list, so declarative checks could never pass. Ownership rules (who may edit a booking, task, review, post, comment, message, …) live in one small bean per domain under `com.berliz.security`. No user-visible change in what is allowed; it stops a future endpoint from forgetting its guard |
| Help center / FAQs | ✅ | Public + per-user. Deep-linkable to a specific FAQ (`/dashboard/my-faqs?faqId=`) — expands and scrolls to it, used by global search and the notification entity-link resolver |
| Hub, News & updates | ✅ | |
| Global search (multi-entity) | ✅ | Top-bar. Public: trainers, centers, services, exercises, testimonials, equipment, workout templates, FAQs, members, posts (own + connections' feed). Admin-only: users, tasks, payments, subscriptions, partners, contact-us, newsletters, tags, muscle groups. Client-side filtering over data each entity's own NgRx slice (or, for posts, a locally-cached one-time fetch — the only entity with no store slice) already loads; deep-links to the specific item where a route/anchor exists (exercises, workout templates, FAQs, members, posts, testimonials), otherwise to that entity's list page |
| Partner one-pager, brand assets | ✅ | |
| Build-time prerendering of public marketing routes (SEO) | ✅ | `/`, `/about`, `/services` + its 3 children, `/contact`, `/trainers`, `/centers`, `/members` are statically rendered at build time (Angular's `application` builder `prerender` option, which replaced the retired `@nguniversal/builders`; `index.html` is the prerendered landing page and the SPA fallback is `index.csr.html`) so crawlers that don't run JS see real title/meta/OG/canonical/JSON-LD instead of an empty shell. Dashboard and every other route stay client-rendered only — see `docs/DEPLOYMENT.md` |

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
| Platform growth campaigns (admin) | ✅ | Same `Promotion` entity with no trainer/center owner — e.g. "first N sign-ups get a free session." Managed at `/dashboard/hub/campaigns` (admin only) and surfaced as a real Hub tile (`DashboardServiceImplement` now includes a `campaigns` count, `hub-grid.component.ts` groups it under Content & programs). A live `free_session` + `new_members` campaign is auto-granted as a `SessionCredit` to every account the moment it activates (email confirmation for form signup; immediately for Google/Facebook/quick signup, none of which have a separate activation step) |
| Session credits ("My Rewards") | ✅ | `/dashboard/my-rewards` — free-session/discount credits earned from a platform campaign or a referral. Redemption is enforced at booking time (see below), not just shown; actually honoring the discount in real money still happens manually since there's no per-session Stripe charge yet to auto-apply it against — see [§6](#6-payments--subscriptions). Backend: `SessionCredit`, `/session-credit/mine` |
| Reward redemption at booking time | ✅ | The booking form lets a client attach one of their own available `SessionCredit`s or the provider's own live `Promotion` to the request. A credit flips `available` → `applied` (and a capped promotion's `usageCount` increments) the moment the booking is *created* — not deferred to confirmation — so the same reward can't be attached to two pending bookings at once; both revert automatically if the booking is cancelled before being honored. The applied reward shows as a label on the booking card for the provider to see and honor. `Booking.sessionCredit`/`Booking.promotion` (V47) |
| Referral program | ✅ | Every user gets a shareable link (`/sign-up?ref=<userId>`) from the My Rewards page. `?ref=` is honored across every account-creation path -- full form signup, quick sign-up (`/quick-sign-up?ref=`), and Google/Facebook on either `/login` or `/quick-sign-up` (`?ref=` forwarded as `referredBy` to `/auth/google`\|`/auth/facebook`) -- tracking a pending `Referral`; once the account is active (immediately for social, on email confirmation otherwise), both sides get a free-session `SessionCredit`. Backend: `Referral`, `ReferralServiceImplement`, `/referral/mine` |
| "Promo Partner" incentive | ✅ | Three layers: (1) the public profile badge every live promotion already earns for free; (2) a search-ranking boost — `getActiveTrainers`/`getActiveCenters` sort a provider with a live promotion first (stable sort, no schema change); (3) a real payout benefit — `PayoutServiceImplement` charges 10% commission instead of the standard 15% for a completed booking whose provider currently has a live promotion |
| Subscription-tier perks (search boost, Featured badge, capacity) | ✅ | A trainer/center on the platform's *top paid Plan tier* (§6) gets three additive perks, resolved via the new shared `SubscriptionTierService` (`Subscription.planTier.sortOrder` vs. the role's max active tier): (1) sorts ahead of everyone else in `getActiveTrainers`/`getActiveCenters` — even ahead of the free Promo Partner live-promotion boost above; (2) a `featured` flag on the trainer/center response DTO, rendered as a gold "Featured" badge on search-result cards, the dashboard find-a-provider grid, category-trainer cards, and both profile heroes; (3) guaranteed placement at the top of the public Deals feed for that provider's live promotions (`PromotionResponse.featured`). Every paid tier (not just the top one) also raises a provider's own asset-capacity cap — feature videos for trainers (base 4 + 2/tier), introductions for centers (base 3 + 1/tier). `my-subscriptions-plans` lists the concrete per-tier perks instead of relying on the admin-authored `accessScope` text to describe them |
| Referral leaderboard | ✅ | "My Rewards" shows the top 10 referrers by completed-referral count, name resolved the same way as everywhere else (trainer/center professional name where applicable). `GET /referral/leaderboard` |
| Social-share unlock | ✅ | "Share for a bonus free session" on My Rewards -- native share sheet where available (falls back to copy-link), grants a one-time `share_bonus` `SessionCredit` on first share. Trust-based (confirms a share was triggered, doesn't verify a post was actually made), same trust level as the rest of session-credit redemption today |
| Corporate/gym co-marketing partner codes | ✅ | Any promotion (provider or platform) can carry a private `code` -- set it and it's hidden from the public badge/Deals feed/auto-signup-grant entirely, reachable only by redeeming the exact code (`POST /promotion/redeem/{code}`, "Have a code?" on My Rewards). A platform campaign's code grants an immediate `SessionCredit`, once per user; a provider's coded promo is just surfaced for the caller to see -- the discount is honored manually when booking, same as any other provider promo |

---

## Changelog

Newest first. Each entry: what shipped, which surfaces, PR/commit.

### Unreleased — Video posts

Posts could only ever carry a photo (the §2 row claimed image/video, but neither the backend nor any client supported video). Now: `post.video_url` / `video_strapi_id` (migration V64), `PostRequest.video`, `PostResponse.videoUrl`, with the one-media-per-post rule enforced server-side (`PostVideoUnitTest`). Web: an "Add video" picker in the composer (type + 50MB check before uploading, draft restore), inline `<video>` playback on the feed, both profile pages and the Saved page, and the existing media sheet now opens on `videoUrl`. Mobile has the same (see the mobile changelog).

### Unreleased — Fitness achievements, for real

§4 listed "Fitness achievements ✅", but the backend had only the `FitnessAchievement` entity — its repository, service and REST interface were empty stubs — and no screen existed on either platform. Built end to end: backend `/achievement` API (validated, per-user; the table already existed so no migration; `FitnessAchievementServiceImplementUnitTest`), a web **My Achievements** page, and the mobile screen. Deliberately not done: showing achievements on public profiles, which needs a visibility decision (the Settings profile-visibility toggle is the obvious home).

### Unreleased — Fix: trainer Feature Videos could not be saved

The Feature Videos editor sent the uploaded file under `videoRequest`, but `TrainerFeatureVideoRequest` reads it from `video`; the unknown key is ignored, so the backend saw no video and rejected every save as invalid data. The component now sends `video`. A spec asserts the payload shape. (Found while porting the screen to mobile, where it is built against the backend's field name.)

### Unreleased — Locations dropdown on the signed-in provider profiles

The "Available in" dropdown from the training-locations work only existed on the *public* trainer page;
the dashboard-native profiles (`/dashboard/find-trainers/:name`, `/dashboard/find-centers/:id/:name`)
still showed a bare "+2" with nothing to open. New shared `app-locations-menu` (light/dark dashboard
theme) used by both: the tile always says "N locations" and "+N more"; clicking lists every place with
venue, address, per-location fee and a Maps link (trainers also get the "place of your choice" row);
a single location opens too (its venue/fee aren't on the tile). Centers' "Address" tile becomes a
"Locations" tile listing every branch. Find a Provider trainer cards now read "+N more". Closes on
outside click / Escape.

### Unreleased — Providers can finally set up payouts (Stripe Connect)

The backend had a Connect onboarding endpoint but **no client ever called it**, so nobody could actually get paid — and calling it twice would have been worse than never: every call created a *new* Stripe account and overwrote the stored id, orphaning the first.

- **Backend:** `createConnectOnboardingLink` now keeps one account per provider and reuses it (fresh onboarding link while unfinished, Express dashboard once complete); it only replaces an account Stripe says no longer exists, and refuses a user with no partner record. New `GET /payment/stripe/connect/status` returns `configured / connected / ready`. `StripeConnectOnboardingTest` covers all of it (Stripe SDK mocked).
- **Web:** the provider Earnings tab gets the setup banner and button described in §6. The return/refresh URLs are passed explicitly because the backend's defaults (`/payment/connect/return|refresh`) are not routes in this app.
- **Mobile:** the same banner on the Earnings screen.

### Unreleased — Backend authorization layer, Order/Bill/Tag/Dashboard cleanup, config out of code

Backend-only (`com.berliz`); no UI changes. Follows a full audit of the Spring Boot services.

- **Declarative authorization (`@PreAuthorize`)** on ~150 service methods, as a second layer on top of the existing
  manual guards (none removed). Admin-only methods use `hasRole('ADMIN')`; owner-or-admin methods call a per-domain
  bean (`taskAuthz`, `bookingAuthz`, `centerAuthz`, `orderAuthz`, …, 19 in all) that re-fetches the entity and mirrors
  the exact rule — including the odd ones (comments/posts are author-only with *no* admin override; a review is owned by
  the reviewer, not the center/trainer; deleting a comment is allowed for the comment's author *or* the post's author).
  Missing/unknown ids are allowed through so the method's own 400/404 still fires. **Root cause fixed along the way:**
  `ClientUserDetailsService` returned an empty authority list for every user, which made method security unusable.
- **Left on manual guards only** (not an oversight): super-admin-email deletes (`deleteCenter`, `deleteTrainer`,
  `deletePartner`, `deleteCenterPricing`), review status/disable/delete (checked by email, not id), run-event creator
  checks, and `requireAccess` on workout logs (owner/admin/collaborator semantics).
- **Orders & bills** moved to typed DTOs + typed exceptions like every other domain. Fixed while rebuilding:
  creating/editing an order **overwrote the catalog Product's price and quantity** while computing the line subtotal;
  `GET /order/getByUser/{id}` had **no ownership check** (any signed-in user could read anyone's orders); non-admin
  `getAllOrders` looked an order up by user id; `updateOrder` reset the order's created-date on every edit. New
  `GET /order/getMyOrders`. Two half-broken PDF-bill flows are now one: `GET /order/generateBill/{orderId}` creates (or
  regenerates) the bill, and `/bill/*` is an admin-only read/delete surface. Bills write to a configurable directory and
  load the logo from the classpath instead of a hardcoded Windows path.
- **Tags**: `/tag/*` and `/category/tag/*` now share one implementation (the category copy created tags with no
  status/date). Both stay live — different clients call each.
- **Dashboard**: `/dashboard/*` rebuilt on typed DTOs; dead driver/store fields removed; hardcoded CORS dropped; per-tile
  failure isolation (from the live Hub-blank fix) kept and extended to `/dashboard/berliz`. `/dashboard/berliz` now also
  counts center/trainer reviews, bookings, exercises, muscle groups and posts.
- **Wire formats the clients depend on are pinned.** Two of these rewrites briefly changed response shapes the web and
  mobile apps read directly — the dashboard endpoints (bare object, kebab-case keys, only the tiles a role has) and
  `GET /tag/get` / `/tag/getActiveTags` (bare array). Both were caught within the same day and restored;
  `DashboardResponseWireFormatTest` now locks the dashboard contract. Rule of thumb: check how the frontend's service
  reads a response before wrapping or re-keying it.
- **Removed**: the unused `PUT /notification/read/{id}` (the app only calls `markAsRead`) and nine dead stub
  entities/repos/services (`Delivery`, `FitnessAchievement`, `Forest`, `NotificationAdmin`, `Review`, `Run`,
  `RunDetails`, `ScheduleRun`, `Social`) that nothing referenced.
- **Config, not code**: `BERLIZ_SUPER_ADMIN_EMAIL` (default unchanged) and `BILL_OUTPUT_DIR` (default
  `bills/order-bill`) replace constants that were hardcoded in source.

### Unreleased — Trainers and centers set their own rate and cancellation policy; payouts for sessions paid late

Found while checking the booking-payment work: **nothing in the app let a trainer or center set an hourly
rate**, so in-app payment only worked for providers whose rate had been entered by hand in the database.
Fixed, and the cancellation numbers are now each provider's own choice instead of fixed constants.

- **Rate + cancellation policy in the trainer and center editors** (new shared `app-provider-pricing-fields`):
  session rate per hour (blank/0 = not priced in the app), free-cancellation window (none / 6 / 12 / 24 / 48 / 72 h),
  and the refund share when a client cancels later (full / 75 / 50 / 25 / none). A plain-English summary under the
  fields shows exactly what a client will be told. The server validates: rate 0-10,000 (0 clears it), window 0-168 h,
  share 0-100%.
- **Pinned per booking.** The provider's policy is copied onto the booking when it is first confirmed, so editing
  your policy never changes the terms of a session someone already booked. Unset = the platform default (24 h, 50%).
  A 0-hour window means no free cancellation: everything before the start is a late cancel.
- **Clients see the terms up front and at cancel time.** The estimated-total box on the booking form now ends with
  the provider's cancellation policy, and the cancel prompt quotes the exact window and percentage from the booking.
- **Finished-but-unpaid sessions.** Completing (or no-showing) a session the client never paid for tells them to pay
  straight away and reminds them once, a day later. They are never auto-cancelled (the session already happened).
- **Fixed: a late payment left the provider unpaid.** The payout was only ever created at completion, so a client
  paying *after* completion (or after a no-show) was recorded as paid but no payout was created. Paying now creates it.
- Migration V61. Not yet: a provider can't set different policies for different services; the policy isn't shown on the
  public profile, only while booking.

### Unreleased — Angular 16 → 19 upgrade, and a much shorter signup

- **Angular 16 → 19** (hops 17, 18, 19; the remaining high-severity npm advisories were all Angular 16
  itself, and the updater can't skip a major). NgRx 17, ng-select 12, ngx-mask 17, TypeScript 5.4;
  `ngx-extended-pdf-viewer` moved to 25.6.4 so its peer range covers the remaining hops to 21;
  `ngx-image-cropper` deliberately stays on 7.2.1 so photo-cropping behaviour doesn't change. No
  user-visible feature change.
- **Prerender moved off `@nguniversal`.** `@nguniversal/builders` has no Angular 17+ release, so the
  browser/server/prerender targets became the `application` builder with its native `prerender` option
  (same 10 public routes). `npm run prerender` also builds a no-prerender shell that
  `scripts/finalize-prerender.mjs` publishes as `index.csr.html`, which `netlify.toml` now serves for
  every non-prerendered route — otherwise dashboard URLs would get the home page's title/canonical/JSON-LD.
  See `docs/DEPLOYMENT.md`.
- **Signup cut from 13 required fields to the essentials.** A user reported feeling overwhelmed. Photo and
  the location sub-form (country/state/city/postal/address/phone) are now optional and are asked for later
  by the onboarding checklist's new "Complete your profile" step (now shown to regular users, not only
  trainers/centers).
- **Post-signup landing fixed.** Accounts need email activation before login works, but signup and
  quick-signup dropped the user on a bare `/login` with a toast that scrolled away, which looked broken.
  Both now go to `/login/activate-account` with the email pre-filled and a "we've sent a code to …" line.
- Fixed a production-build break: `SignupComponent` referenced `genders` without defining it.

### Unreleased — Booking payment policy: unpaid reminders + auto-cancel, late-cancel and no-show rules, extensions, price estimate

Closes the gaps left by per-session checkout. The numbers below are constants in one place each
(`BookingPricing`, `CancellationPolicy`) so they are easy to change.

- **Unpaid sessions are chased, then freed.** A confirmed session with nothing paid gets a pay-by
  deadline: 24h after confirmation, but never later than 2h before it starts and never sooner than
  2h after confirming. One reminder (bell + email) goes out 6h before the deadline (or halfway through
  a shorter window); after the deadline the session is **auto-cancelled**, rewards are given back, and
  both client and provider are told. A 15-minute scheduler (`BookingPaymentScheduler`) does both. The
  card shows "Pay by … or it's cancelled". Sessions already waiting when this shipped get a fresh 24h.
  A session that already has money in (an unpaid extension balance) is reminded but never auto-cancelled.
- **Late-cancel policy.** A client can now cancel a *confirmed* session (before, only pending). 24h+ ahead:
  full refund. Inside 24h: half is refunded and the other half is kept and paid to the provider (minus
  Berliz's 15%). Once it has started: nothing refunded. A provider or admin cancelling always refunds in
  full. The cancel prompt spells out the exact refund before the client confirms. An unpaid session that is
  cancelled late costs nothing — we never charge beyond what was paid.
- **No-show.** New `no_show` status. The provider can mark a confirmed session once its start time has
  passed (a "No-show" button on the card, with a confirm); the client's payment is kept and the provider is
  paid. Shown in its own "No-show" group for both sides.
- **Extending / shortening a paid session.** Rescheduling a paid session to a longer length flips it back to
  unpaid for *only the difference* ("Pay extra $50.00", "Balance due"); shortening refunds the difference
  automatically. `booking.amount_paid` tracks the net paid; `payment.refunded_amount` makes partial refunds
  exact (a full refund is still issued without an amount so Stripe reverses it exactly).
- **Estimated total while booking.** New `app-booking-price-estimate` in the booking dialog and booking page:
  session price (rate × minutes), the chosen location's fee, and the effect of a selected reward or owned
  package, with "You pay only after the provider confirms". Same arithmetic as the server; hidden for a
  provider with no rate set.
- **Smaller fixes.** The "client paid" notification now reaches centers, not just trainers. A payment that
  lands after the session was cancelled is refunded automatically instead of kept. A cancelled session whose
  money went back can't be reopened (client books again). The client cancel no longer asks twice. The
  `navigation` icon used by the location picker and trainer dropdown wasn't registered — now it is.
- Migration V60.
- Not yet (the fixed 24h/50% became per-provider settings in the entry above): no automatic
  "complete" or no-show detection; the extension balance has no deadline of its own; amounts show with "$"
  whatever the Stripe currency is.

### Unreleased — Per-session checkout: clients pay for a confirmed booking through Stripe

Until now only plans and packages went through Stripe; a single booked session was just a
request. Now it is paid in-app, **after** the provider confirms (so nothing is charged for a
request that gets declined).

- **Pricing** (`BookingPricing`, backend): when a provider confirms (or books for a client, which
  confirms immediately) the booking gets `amount_due` and `payment_status`. Amount = the provider's
  `hourlyRate` × booked minutes ÷ 60, minus the provider's own promotion, minus a Berliz session
  credit, **plus the location fee** (which is always payable). A package-redeemed session charges only
  the location fee. A provider with no hourly rate is left unpriced and behaves as before. Amounts
  under $0.50 count as nothing to pay (Stripe's minimum). The price is fixed at confirmation; the
  client never sends an amount.
- **Pay** (`POST /payment/stripe/booking-checkout/{id}`): only the booking's own client (or admin), only
  while confirmed/completed and UNPAID. The webhook marks the booking PAID, links the `Payment` to it
  (`payment.booking_fk`), and notifies both sides. A second checkout completing for an already-paid
  booking is refunded automatically instead of kept.
- **Cancel** a paid session (provider, or admin) → the payment is refunded in full automatically; if
  Stripe fails the booking stays Paid and an admin can still use "Refund via Stripe". A refunded
  booking shows Refunded. Declining/cancelling an unpaid one needs no refund.
- **Payouts** (`PayoutServiceImplement`): no payout for a booking that is still UNPAID or REFUNDED
  (Berliz holds no money for it). Gross now includes the location fee, and a provider's *own*
  promotion reduces their gross, while a Berliz-funded session credit does not.
- **UI**: My Bookings shows **Pay $X** on a confirmed unpaid session (card and details modal), plus
  Paid / Payment due / Refunded pills, and the provider sees "Awaiting payment" / "Paid". The provider's
  cancel confirmation warns that a paid client will be refunded. `/payment/success` and `/payment/cancel`
  now cover bookings as well as subscriptions.
- Migration V59 (`booking.amount_due`, `booking.payment_status`, `payment.booking_fk`).
- Rescheduling-and-confirming also (re)prices the booking, so the new length is what gets charged.
- The gaps this entry first listed (no reminder/auto-cancel, no up-front estimate, no late-cancel or
  no-show policy, extending a paid session, centers not told) are closed by the entry above it.

### Unreleased — Training locations with fees, and client-chosen custom locations

A trainer can now list several places they train, put an optional fee on each, and let clients
name their own location (with its own optional fee). Clients choose at booking time.

- **Trainer side** (`partner/trainer-data`): each "Available in" row gets an optional venue
  (gym/address) and an optional extra fee; a new "Let clients choose their own location" toggle
  with its own fee. Blank/zero fee = none; negative is rejected (form + backend).
- **Client side**: new shared `app-booking-location-picker` in the booking dialog and the
  `/trainers/:name/book` page. Lists each location with its fee ("No extra fee" when none), plus
  "Somewhere else — my own location" when allowed. Optional; a trainer offering no choice shows
  nothing. A picked-but-empty custom address blocks submit with a message.
- **Booking**: the location label + fee are *snapshotted* on the booking (`location_label`,
  `location_fee`, `location_custom`) rather than referenced, because a trainer's location rows
  are recreated on every profile save and a past booking's price mustn't move if fees change
  later. Shown on the booking card, details modal and the trainer's review modal.
- **Backend** (migration V58): `trainer_location.venue/fee`, `trainer.custom_location_allowed/
  custom_location_fee`, `booking.location_*`. `BookingServiceImplement.applyLocation` is used by
  create, urgent and provider-books-for-client; rejects a custom location when not allowed, a stale
  location id, both at once, and any location on a center booking. Existing clients that send no
  location are unaffected.
- **Trainer profile "Available in"** (`trainers-details-hero`): the tile now reads "Surrey +2 more —
  Tap to see all 3 locations"; the dropdown is wider, wraps long text, scrolls if long, shows each
  location's gym/address and fee, a "place of your choice" row when allowed, and the Maps link now
  includes the venue. On phones the tile spans the full row so the list has room.
- **Provider "book for a client"**: a trainer now picks the session's location there too (their own
  `getTrainer()` record feeds the picker; centers see no picker).
- **Booking drafts** remember the location choice and restore it on resume.
- Not yet: the fee is displayed, not charged (client payment checkout is still unwired).
- Also fixed three specs that were already failing on master (missing `HttpClient`/router/dialog
  providers): `BookingFormComponent`, `MyAvailabilityEditorComponent`, `ProviderBookingsMainComponent`.

### Unreleased — Fix: trainer/center locations dropdown wouldn't close

On the signed-in trainer and center profiles the "Available in" menu (`app-locations-menu`)
could stay open, or close the instant it opened. Two causes: the profile pages built the
menu's `items`/`footer` from getters returning a brand-new array on every change-detection
pass, so the rows were torn down and re-created each tick; and the click-outside check used
`target.contains`, which is false once the chevron icon under the tap has been swapped. Items
are now cached per trainer/center, rows use `trackBy`, and "inside" is decided from the
event's composed path. Regression tests in `locations-menu.component.spec.ts` (chevron tap,
second tap closes, getter-built host).

### Unreleased — Promo codes in Stripe checkout, undone extensions, "failed to load" on ~45 more pages

- **Promo codes inside Stripe checkout.** See the "Bypass / promo codes" row in §6. Preview endpoint
  (`POST /discountCode/preview`) lets the plans page show the discounted price before paying;
  `DiscountPricing.amountOff` caps the discount so Stripe's minimum charge is always left.
  `StripeLiveSmokeTest` includes a real test-mode coupon round trip.
- **Extension balance now has a deadline.** An extended session's extra balance gets its own pay-by
  time (`BookingPricing`); if it lapses, `cancelUnpaidBookings` *reverts the extension* instead of
  cancelling the whole session: duration goes back to the paid length (`paid_duration_minutes`, V62),
  amount due = amount paid, status Paid, and client + provider are notified. The booking card says
  "Pay the extra by …".
- **Live Stripe check.** `StripeLiveSmokeTest` (opt-in: set `STRIPE_TEST_KEY=sk_test_…`, then
  `.\mvnw.cmd -o test -Dtest=StripeLiveSmokeTest`) runs 6 tests against the real Stripe test API:
  checkout session creation, full and partial refunds in cents, late-cancel 50%, extension balance,
  promo coupon. It does not cover typing a card into hosted checkout or live webhook delivery.
- **`app-load-error` rolled out.** New `watchLoadError` helper (`shared/load-error/load-error-tracker`)
  tracks a slice's *failure action* (not the shared `error` field) so a failed load shows a
  retryable error instead of an empty list. Now on: My Bookings, provider bookings, availability
  editor, earnings, My Subscriptions (main + plans), client intakes, notifications page, To-do list,
  shared progress, progress-sharing settings, testimonials, trainers search, centers, and the admin
  lists for users, partners, clients, members, categories, tags, exercises, muscle groups,
  newsletters, contact-us, payments, trainers, centers, tasks, subscriptions, testimonials. Each has
  tests for error, retry and recovery. Also covered: admin FAQs, admin to-do lists, and the dashboard login-activity chart (a failed load no longer reads as "No logins recorded").

### Unreleased — One shared "failed to load" state (`app-load-error`), on the Hub and Overview

Follow-up to the entry below. New standalone `LoadErrorComponent` (`shared/load-error`) is the
single "this failed to load, here's why, try again" state — a centered block for a page's main
area, or a slim `compact` banner above existing content — deliberately distinct from an empty
state, always with a Retry. `HubMainComponent` now uses it instead of its own inline markup,
and the Dashboard Overview (`dashboard-main`) now shows it as a banner when
`/dashboard/details` fails: that single call feeds the Overview's action cards, analytics and
login chart as well as the Hub, so before this a failure left a whole page of widgets
silently empty. 4 component tests + 3 `dashboard-main` tests.

Deliberately *not* done: a global toast on every `*Failure` action. Many components already
toast their own failures, so it would double-notify, and background loads would spam. The
remaining ~24 slices still need `app-load-error` wired into whichever page owns them — now
a one-element change per page rather than bespoke markup.

### Unreleased — Use-case audit: failed loads were silent; Hub now shows an error + Retry

Audit finding, prompted by the Hub/Dashboard-Overview blank-page incident: the app has no
global handler for failed data loads (`auth.interceptor` only special-cases 401/403 and
otherwise just re-throws), so a failed NgRx load is only visible if the *component* reads its
slice's error. 32 state slices expose an `error` selector but only 8 component files read any
`select*Error` — and none of the four `/dashboard/details` consumers did, so a 500 there
rendered as a blank, indistinguishable from "nothing to show". The Hub made it worse: its
empty state ("No hub data available") also showed while the request was still loading, and
on failure.

Fixed for the Hub (the surface that actually failed in production): `HubMainComponent` now
reads the slice's `loading`/`error`, shows a spinner while in flight, a "Couldn't load your
Hub" error with a **Try again** button on failure, and only shows the plain empty state when
there is genuinely nothing and no error. Also stopped its three store subscriptions leaking
past destroy, and replaced its empty-`provideMockStore()` spec with proper state + 5 tests.

**Not fixed — flagged for follow-up:** the same silent-failure pattern very likely exists in
most of the other ~24 slices whose components never read the error (the Dashboard Overview
widgets share the same slice and still don't surface it). The right durable fix is probably
one shared pattern (an error-state component or a global load-failure toast) rather than
patching each page by hand.

### Unreleased — Overflow/clipping pass: long unbroken user text

Static audit of the whole frontend for the usual horizontal-overflow causes: raw `<table>`s
without a scroll wrapper, fixed-width `MatDialog`s/modals without a viewport cap,
`w-screen`/`100vw` usage, and `flex-1` wrappers missing `min-w-0` around `truncate` text. All
four were already clean (every dialog sets `maxWidth: 95vw`, every fixed-width modal body has
`max-w-[95vw]`, every `flex-1` text wrapper has `min-w-0`). The one real gap: 14 templates
rendering user-written text — timeline/saved/profile post content, bios, trainer/center
introductions, album comments, FAQ/help answers, drafts, the admin content-report preview —
used `whitespace-pre-line` (keeps the author's newlines) with no `break-words`, so a single
long unbroken string (a pasted URL, a very long username) pushed past the card edge instead of
wrapping. Added `break-words` to every one of them. Honest limit: this was a code audit, not a
visual sweep across devices — that needs a signed-in browser session at several viewport
widths, which wasn't available here.

### Unreleased — Gender-inclusive picker across every form

Every gender picker in the app (signup, signup modal, My Profile settings, the admin
and dashboard edit-user modals) was a hardcoded binary Male/Female radio pair,
duplicated five times with slightly different markup each time. New shared
`GENDER_OPTIONS` constant (`shared/constants/gender-options.ts`) adds Non-binary and
Prefer not to say, and every picker now renders from that one list via `*ngFor` instead
of its own hardcoded pair — so wording or adding an option only ever needs to change in
one place going forward. Backend stores `User.gender` as unconstrained free text (and
`ClientServiceImplement`'s body-fat formula already had a sensible non-binary fallback
coefficient), so no backend change was needed. Also fixed a real overflow risk the new,
longer "Prefer not to say" label would have hit in `user-profile-settings-form` — its
pill row had no `flex-wrap`.

### Unreleased — Urgent booking requests, and providers booking/rescheduling directly

- **Client-facing "urgent request."** When the calendar genuinely has no slot that works, a
  "Need it sooner? Send an urgent request" link opens a small date/time/duration form with a
  required note. `POST /booking/addUrgent` creates a `pending` booking flagged `isUrgent`,
  deliberately skipping the normal lead-time/availability gate (that's the point) while still
  rejecting a genuine double-booking conflict. Best-effort also starts/continues a direct
  message to the provider with the same context (trainers only — center messaging isn't
  supported yet by `MessageService`); a failure there never blocks the request itself.
- **Provider "approve or reschedule with one click."** The existing pending-request review
  modal gained a "Reschedule" option next to Confirm/Decline — picking a new date/time there
  calls the new `PUT /booking/reschedule/{id}`, which moves the booking and confirms it in one
  step (only checks for a conflict, not lead-time/availability — the provider is deliberately
  choosing to accommodate it). An "Urgent" badge marks flagged requests on the booking list and
  inside the review modal.
- **"Book for a client" (provider-initiated, already confirmed).** A new button on the
  Bookings page opens a client picker (`GET /booking/myClients`, the distinct clients from
  booking history — mirrors the client-side `myTrainers` list from the other direction) +
  date/time/duration/notes form. `POST /booking/addForClient` creates the booking straight to
  `confirmed` — the provider creating it is itself the approval — again skipping
  lead-time/availability but still rejecting a real conflict.
- Backend: `berliz` / `com.berliz` (migration V56, `booking.is_urgent`). 9 new unit tests
  covering the skipped-checks behavior, conflict rejection, reschedule's self-exclusion from
  its own conflict check, and the client-aggregation query.

### Unreleased — Fix: Hub and Dashboard Overview going blank in production

`GET /dashboard/details` backs both the Berliz Hub and the Dashboard Overview widget
from one shared NgRx slice — ran ~25 count queries in a single try/catch, so any one
failing query (a stale index, an edge-case null, a newly-added counter) threw the whole
method into a 500, blanking both surfaces for every user with no visible error (the
frontend's `loadDashboard$` effect swallows the failure silently). A new `safeCount()`
helper now isolates each count in its own try/catch — a bad one reads 0 for that one
tile instead of taking down the whole response. Found by investigating a live user
report of both surfaces appearing empty.

### Unreleased — Customizable slot length, a false "no slots today", and two post-viewing bugs

- **Booking slot length is now per-provider, not a hardcoded 60 minutes.** Added
  `slot_duration_minutes` to Trainer/Center (nullable, same override-or-platform-default
  pattern as `lead_time_minutes`) with its own `resolveSlotDurationMinutes` source of truth,
  `GET`/`PUT /availability/slotDuration`, and a "Session length" control in My Availability
  Editor next to the existing "Booking notice" one. `getAvailableSlots` now slices each day
  using the provider's own duration; a client's slot pick already flowed its duration straight
  into booking creation, so no other frontend change was needed for it to take effect. `berliz`
  / `com.berliz@fda3f5e` (migration renumbered to V55 after a concurrent V54 collision).
- **Fixed a false "no slots today."** The slot picker re-derived its lead-time cutoff against a
  fresh `Date.now()` on every render, on top of the backend's own identical cutoff computed
  once at fetch time. Wall-clock time passing while the dialog sat open silently pushed the
  frontend cutoff past slots the backend had already approved, until the day's last real slot
  vanished and the picker showed a dead-end "no slots" message that didn't match what the
  backend actually had. Now pins the cutoff to the fetch timestamp and periodically re-asks the
  backend for today's real availability instead of degrading a cached list with local math.
- **Fixed the post/image viewer showing only a dark overlay with nothing on it.**
  `post-detail-sheet` opens via a `requestAnimationFrame` callback under `OnPush` change
  detection with no `markForCheck()` — the sheet's view never picked up that mutation, so it
  stayed parked off-screen at its initial closed position while only the backdrop ever
  rendered. Added the missing `markForCheck()`.
- **Fixed missing profile photos on the Saved page.** Author avatars were piped through
  `strapiUrl`, whose own doc comment says it explicitly does not apply to profile photos (bare
  base64, no data-URI prefix) — a bare base64 string resolved as a bogus relative Strapi path
  that 404s. Switched to the same `photoDataUri`/`memoizePhotoUriByKey` helper
  `dashboard-timeline` already uses for the identical field.

### Unreleased — Deep-linked notification emails, and a new like/comment email category

- **Notification emails now deep-link.** `sendGenericNotificationMail`'s CTA button used to
  always point at the bare dashboard home; it now reuses the same `entityType`/`entityId`
  pair the in-app notification bell already carries to build a real link — a message email
  opens that conversation, a booking email opens My Bookings, a testimonial email opens that
  testimonial, etc. New `EmailDeepLinkUtil` (backend) mirrors the frontend's own
  `notification-entity-link.util.ts` routing table so the two stay in step.
- **New "Likes & comments" email category.** Reactions and comments on your own posts can now
  also email you, same as messages/bookings/account changes already could — but this one
  defaults OFF (opt-in), not on, since it's by far the highest-frequency category; toggle it
  in Settings → Email notifications, including the existing Allow-all/Stop-all shortcuts.
- **Likes now notify at all.** `PostServiceImplement.toggleLike` and
  `CommentServiceImplement.toggleCommentLike` never published a notification of any kind
  before this — the post/comment author found out about a like only by noticing the count
  change. Both now publish the same `NotificationEvent` comments already do (in-app bell +
  DB row + mobile push + the new opt-in email), skipping a self-like or a blocked
  relationship.
- Documented the notification bell's own entity-type deep-linking in §7 for the first time —
  it shipped earlier this session but was never added to this file.

### Unreleased — Trainer/center subscription-tier perks (search boost, Featured badge, capacity)

- **Search-ranking boost + Featured badge.** A trainer/center on the platform's top paid
  Plan tier now sorts first in `getActiveTrainers`/`getActiveCenters` (ahead of even the
  free Promo Partner live-promotion boost) and carries a `featured` flag on its response
  DTO. Rendered as a gold "Featured" badge on `trainers-search-result`/`center-search-result`
  cards, the dashboard `find-providers` grid, `category-trainers` cards, and both public
  profile heroes (`trainers-details-hero`, `center-detail`).
- **Guaranteed Deals-feed placement.** `PromotionServiceImplement.getPublicFeed()` sorts a
  top-tier provider's live promotion to the top of the feed and marks it
  `PromotionResponse.featured`; the Deals page highlights it with a border + badge.
- **Tier-scaled capacity caps.** Every paid tier (not just the top one) raises a provider's
  own asset cap: feature videos for trainers (base 4 + 2/tier rank), introductions for
  centers (base 3 + 1/tier rank) — parity across both roles via each role's existing
  capacity-limited asset type.
- **Plans page tells the truth.** `my-subscriptions-plans` now lists the concrete, computed
  per-tier perks as bullets instead of relying on the admin-authored `accessScope` free text
  to describe them, so the copy can't drift out of sync with what the backend actually
  enforces.
- New shared `SubscriptionTierService` (backend) resolves `Subscription.planTier.sortOrder`
  against a role's max active tier once, instead of duplicating that logic across
  `TrainerServiceImplement`, `CenterServiceImplement`, and `PromotionServiceImplement`.

### Unreleased — Dark mode: Chart.js canvas colors, D13 complete

Forty-fourth pass, the true close of the dark-mode effort: adds
`ThemeService.isDark$` (a `BehaviorSubject`, same reactive pattern as
`NavControlsService`) so components outside Tailwind's reach can react
to a live theme toggle. All 5 Chart.js chart components app-wide
(confirmed exhaustive — this project never adopted `ng2-charts`, every
chart is a raw `new Chart()` call) get their axis tick/gridline colors
switched from hardcoded light-only hex/rgba values to
`ThemeService`-driven getters, and now update an already-rendered
chart's colors live on toggle instead of needing a reload. Also swaps
the login chart's near-invisible-on-dark "Mobile"/"iOS" legend-swatch
color for a theme-neutral gray. **D13 (dark mode, app-wide) is now
marked complete** — no further known gaps.

### Unreleased — Dark mode: date-strip/time-picker, closing the effort (D13 continued)

Forty-third pass: converts `shared/date-strip` and `shared/time-picker`,
previously deferred over a suspected dual-use risk with the public
booking flow. On inspection, their actual public consumer
(`booking/booking-page`) turned out to already be independently
converted with plain theme-toggle-aware `dark:` classes rather than
the permanently-dark-by-hardcoded-color pattern the rest of the public
site uses — so both shared components just needed the same plain
`dark:` treatment as everything else, no `[dark]`-input retrofit
needed. Checked `nav-history-controls` too and left it untouched: its
own doc comment says the pill is "deliberately never a loud color" by
design, same permanently-fixed-style pattern as `recap-card`. This is
the last item on the dark-mode punch list — no more surveyed
dashboard-scoped gaps remain.

### Unreleased — Dark mode: final sweep — Saved page, feedback modal, stray misses (D13 continued)

Forty-second pass, likely the last of the broad conversion effort: a
fresh full-app re-survey turned up exactly two genuine misses —
`saved-page` (bookmarked posts/workouts) and `footer/
berliz-feedback-modal` (a dashboard `MatDialog`, despite living next
to the permanently-dark public footer) — plus a few stray unconverted
lines inside otherwise-finished files (`connections-main`,
`dashboard-timeline`). Every dashboard-scoped template is now
converted except `nav-history-controls`, deliberately deferred
alongside `date-strip`/`time-picker` pending a `[dark]`-input retrofit
(it's mounted globally outside the layout switch, so it renders on
both the permanently-dark public site and the theme-toggle-aware
dashboard). Also flagged, not touched: several dead stub components
found during the re-survey, left for a separate cleanup task.

### Unreleased — Dark mode: triaged `shared/` sweep (D13 continued)

Forty-first pass: a file-by-file triage of the `shared/` directory
rather than a blanket sweep, since several of its components are
reused by the permanently-dark public site and one component's
selector (`app-search-panel-test`) turned out to be a never-wired
test stub. Converted 21 dashboard-scoped files (partnership
application dialogs, the universal prompt-modal confirm dialog,
renew-subscription/todo-details/update-email/update-partner-file/
update-trainer-photo/view-certificate/view-cv modals, the real
search-panel, skeleton-loader, recap-page, and the dual-use
ranks-card). Left deliberately unconverted: newsletter-popup and
partner-form-modal (public-only by their own gating/consumers),
validation-message and location-form (public signup only), date-strip
and time-picker (genuinely dual-use with the public booking flow —
deferred pending a `[dark]` input retrofit rather than risking style
bleed through the global theme toggle), post-detail-sheet (confirmed
permanently-dark by design), and five dead `shared/search/`
components never placed in any template.

### Unreleased — Dark mode: remaining native dashboard surfaces (D13 continued)

Fortieth pass: the last 10 native (non-admin) files under `dashboard/` —
the exercise library + equipment catalogue with its tabs, filters and
center-only management grid, the standalone exercise-detail page, the
profile/settings tab toggle, Find a Provider's trainer/center/service
search, the three dashboard-native provider-profile pages (trainer,
center, category), the dashboard-native user-profile-and-timeline
page, and the equipment-form/today's-todo `MatDialog` modals.
`search-todo`, `todo-form`, and `edit-todo` were confirmed dead code
(no route, no selector usage, no `dialog.open()` call anywhere) and
left untouched; `dashboard-route` is a pure `<router-outlet>` with no
color classes. The `dashboard/user/*` files are out of scope — despite
the folder name they're mounted at root `login/*` routes, not
`/dashboard`, so they belong to the permanently-dark public site.

### Unreleased — Dark mode: Partnership feature (D13 continued)

Thirty-ninth pass: the full `partner/` (Partnership) feature, 17
files — partner-null/partner-application onboarding, and the center
side's profile data form, introduction, pricing, equipment, locations,
photo/video albums, announcements, affiliated-trainers list, member
reviews, and likes, plus the trainer side's own profile/pricing data
form with its country/state/city availability picker. `partner-main`,
`partner-route`, and `partner` (the top-level switch component) needed
no changes — they carry no color classes of their own.

### Unreleased — Dark mode: navbar chrome (D13 continued)

Thirty-eighth pass: the rest of the dashboard's `navbar/` chrome —
breadcrumb trail, notification-bell dropdown, profile menu and its
photo-cropper sub-modal, and the unified global-search bar with its
results panel. The left nav rail (`side-bar`/`side-bar-open`/
`side-bar-close`) is a permanently-dark rail by design and was left
alone; `sidebar-navigation` and the 18 `search-*` result components
are dead code (superseded by `global-search`, unreachable except
through that same dead component) and were left untouched.

### Unreleased — Dark mode: My Trainer feature (D13 continued)

Thirty-seventh pass, the full My Trainer feature (15 files, ~2,400
lines): the client-reviews list (status/likes badges, before/after
body-angle photo grids for front/side/back), the activate/renew
subscription modal, trainer benefits/pricing/testimonials/
shared-progress/centers/clients/likes cards, and the larger
trainer-introduction (cover-photo cropper), trainer-subscriptions
(status/detail grid), trainer-main (profile-completion checklist +
insights section), feature-videos (4-slot trim/preview/upload editor),
photo-album (crop-queue modal, upload-progress bar), and video-album
(trim/preview/size-warning editor) surfaces.

### Unreleased — Dark mode: Workouts feature (D13 continued)

Thirty-sixth pass, the largest non-admin feature converted so far
(9 files, ~1,500 lines). Converts the whole Workouts module: My
Workouts (workouts/templates tabs, exercise-count badges, per-workout
assignment status chips), the drag-and-drop workout builder (exercise
library search + drag source, reorderable exercise rows with sets/
reps/rest/notes, the admin-only public-template toggle), workout
detail's read-only exercise-by-exercise breakdown (difficulty badges,
demo images, how-to-perform steps), workout history (stats tiles,
personal-records grid, the session timeline with superset grouping),
My Assigned Workouts (to-do/in-progress/completed counters, expandable
per-assignment exercise checklist), and the assign/log/share/
exercise-progress modals. Four components compute their own status or
difficulty pill classes in a `.ts` getter — `statusClass()` (in both
`my-workouts` and `my-assigned-workouts`), `difficultyClass()` (in
`workout-detail`), and `deltaClass()` (in `exercise-progress-modal`) —
all got `dark:` variants added directly in the TS, same pattern as
earlier heatmap/booking-card fixes. Verified with a real
`ng build --configuration=development`.

### Unreleased — Dark mode: six small surfaces bundled together (D13 continued)

Thirty-fifth pass, bundling several one-or-two-file features into a
single pass: Client Intake (the intake form itself — its non-
dismissible amber legal-disclosure banner keeps its fixed warning
color, same reasoning as the public terms page it mirrors — and the
My Client Intakes list), My Testimonials, My Equipment, Liked
Trainers, My Drafts, and the Payment success/cancel pages. While
converting My Client Intakes, noticed its list-item link points to
`/client-intake/:id` (root-absolute) but that route only exists nested
under `/dashboard` in `dashboard-feature.module.ts` — flagged as a
separate background task rather than fixed inline, since it's a
pre-existing routing bug unrelated to dark mode. Verified with a real
`ng build --configuration=development`.

### Unreleased — Dark mode: Peer Sessions feature (D13 continued)

Thirty-fourth pass. Converts Peer Sessions: the client/personal/
collaborations tab header (embeds `manage-bookings`, already
converted), personal-session cards (pending/confirmed/past states with
their status pills and per-card actions), group-run collaboration
cards (invited/awaiting-creator/upcoming/past, with join-request
counts), and the propose-session modal (its own fields only —
`app-date-strip`/`app-time-picker` are shared components left for the
`shared/` triage pass). Verified with a real
`ng build --configuration=development`.

### Unreleased — Dark mode: My Tasks feature (D13 continued)

Thirty-third pass. Converts the whole My Tasks feature: the Tasks/
Workouts tab toggle, the task list (client/trainer variants, priority
and status pills, due-date/overdue coloring, an expandable per-step
checklist with its own completion state), and the assign-task modal
(client picker, priority-pill selector, start/due date fields, and a
dynamic exercise-step `FormArray` with per-step name + exercise
picker). Verified with a real `ng build --configuration=development`.

### Unreleased — Dark mode: Promotions feature (D13 continued)

Thirty-second pass. Converts the Promotions feature: the Deals feed
(featured-offer ribbon, per-offer type badge), My Promotions (live/
paused/code badges, pause/edit/delete row actions), My Rewards
(redeem-a-code box, available/history/leaderboard cards — the
gradient referral card itself is left permanently-colored, matching
`recap-card`'s always-dark design), the shared promotion form modal,
and the admin-only growth-campaigns screen (`admin-campaigns` — role-
gated but its file lives outside `src/app/admin/`, so the original
admin sweep never touched it). `promo-badge-list`'s gradient badges
are also left alone on purpose — same reasoning as the referral card.
Verified with a real `ng build --configuration=development`.

### Unreleased — Dark mode: Bookings re-pass + module completion (D13 continued)

Thirty-first pass. Restores dark mode on `booking-card` and
`booking-details-modal`, whose `dark:` classes had been silently
dropped by a later, unrelated "send intake form" feature merge that
touched the same lines — confirmed via `git log`/`git show` before
redoing the work, and safe to redo now that the other session's
uncommitted changes to those files were committed and pushed
separately. Both components compute their status-pill classes in a
`.ts` getter (`statusClasses()`), so the `dark:` variants were added
there directly, not just in the template — same pattern as the
to-do heatmap and bio-editor fixes from earlier passes. Also converts
the rest of the module: `bookings-empty`, `manage-bookings`' My-
bookings/Requests tab toggle, `review-booking-modal`, the provider
`earnings-view` (its own separate `statusClasses()` getter, same
treatment), and `my-availability-editor` (weekly day toggles + the
booking-notice lead-time card). `my-bookings-main` was already fully
converted in an earlier pass and needed no changes. Verified with a
real `ng build --configuration=development`.

### Unreleased — Dark mode: My Subscriptions feature (D13 continued)

Thirtieth pass. Converts the full My Subscriptions feature: the
analytics summary cards (total/active/expiring/expired), active/due/
expired row variants, the per-row action dropdown and the bulk-action
panel (select-all, per-row checkboxes, activate/deactivate/delete),
the subscription detail modal, the plans/checkout grid (top-tier
ribbon, per-plan perks, redeem-a-code box), and the subscription
timeline. Fixed a `(keyup.enter)` binding I accidentally dropped from
the redeem-code input while rewriting `my-subscriptions-plans` — caught
before commit by re-diffing against the original. Verified with a real
`ng build --configuration=development`.

### Unreleased — Dark mode: Runs feature (D13 continued)

Twenty-ninth pass. Converts the full Runs feature: the tabbed shell
(Discover/My runs/History/Leaderboard), Discover's searchable event
cards with join-request states, My Runs' invite/pending/roster panels
(purple "invited" banner, amber "pending request" banner), History's
four stat cards and log rows with a highlight-on-scroll state, the
Leaderboard's rank medals and verified-run badges, and all three
modals (create/edit run, log a run, invite a runner). Verified with a
real `ng build --configuration=development`.

### Unreleased — Dark mode: user/* profile surfaces (D13 continued)

Twenty-eighth pass. Converts the rest of `src/app/user/*`: the avatar
(with a dark ring so its border blends into the page instead of
staying a stark white circle), bio editor, profile identity/stats,
account info, progress-sharing settings, the photo cropper modal, the
danger zone card, the large personal-info settings form (gender pills,
country/state/city `ng-select` pickers), and the My Progress check-in
tracker (`user-progress` — weight/body-fat/photo log, distinct from
`user-profile-settings.component.html`, already converted earlier).
Several components (`user-bio-edit`, `user-account-info`,
`user-profile-settings-form`) compute a Tailwind class string in their
`.ts` (`charCountClass()`, `statusClass`, `fieldBorder()`) — same
pattern as the to-do heatmap, so those got `dark:` variants added
directly in the TS. Added a global `html.dark .berliz-select` CSS
override (mirroring the existing `.mat-dialog-container` fix) since
`ng-select`'s internals are plain CSS with hardcoded light colors that
Tailwind's `dark:` scanner can't see — this also fixes the country/
state/city pickers on `location-form` and `partner/trainer-data`
before those components have been converted themselves. Verified with
a real `ng build --configuration=development`.

### Unreleased — Dark mode: My To-do List feature (D13 continued — first post-admin pass)

Twenty-seventh pass, the first outside `/dashboard/admin/*`. Converts
the whole My To-do List feature: pagination header, list/section/item
cards (status + priority pills, dropdown menus), the add-task form
(priority pill selector), the metrics summary cards, the completion
heatmap, the timeline, and the Chart.js breakdown card's wrapper/
legend (canvas internals untouched, as with other charts). The
heatmap's day-cell color comes from a TS helper (`getColor()`) that
returns a Tailwind class string at runtime — since Tailwind can't
statically discover `dark:` variants inside a computed string unless
they're written literally in the source, `dark:` classes were added
directly to each returned string in the `.ts` file, not just the
template. Verified with a real `ng build --configuration=development`.

### Unreleased — Dark mode: admin/contact-us + admin/newsletters (D13 continued — sweep complete)

Twenty-sixth pass. Converts both remaining admin CRUD sections in
full: `admin/contact-us` (header, list, details modal/detail page,
add/update submission modals, and the admin-reply review modal with
its saved-subject/saved-body pickers) and `admin/newsletters` (header
with its extra "Send Bulk" button, list, details modal/detail page,
add/update subscriber modals, and both the per-subscriber and bulk
message-composer modals). **This closes out the entire
`/dashboard/admin/*` CRUD sweep** — all ~28 admin sections are now
dark-mode complete. Verified with a real
`ng build --configuration=development`.

### Unreleased — Dark mode: admin/todo-lists (D13 continued)

Twenty-fifth pass, continuing the admin CRUD sweep. Converts the
complete `admin/todo-lists` section -- header, list (mobile cards +
desktop table, status-driven pills for completed/in-progress/
cancelled/pending), the details modal and standalone detail page
(shared `user-hover-card`, priority/due-date/last-update block, task
text), and the add/update form modals (user picker, task textarea, a
green/red form-level validity banner pattern not seen in earlier
sections). Verified with a real `ng build --configuration=development`.

### Unreleased — Dark mode: admin/tasks + admin/sub-tasks (D13 continued)

Twenty-fourth pass, continuing the admin CRUD sweep. Converts both
task-management sections in full: headers, lists (mobile cards +
desktop tables, shared `user-hover-card`, priority/status pills), the
details modals and standalone detail pages (client/trainer/priority/
date/sub-tasks/description blocks), and the add/update form modals
(client + trainer pickers, priority radio-pill group, date-range
inputs for tasks; task + exercise pickers and a read-only exercise
field for sub-tasks). The update-task modal's "already active" amber
warning banner keeps its tint in both themes. Verified with a real
`ng build --configuration=development`.

### Unreleased — Dark mode: admin/testimonials (D13 continued)

Twenty-third pass, continuing the admin CRUD sweep. Converts the
complete `admin/testimonials` section -- header, list (mobile cards +
desktop table, shared `user-hover-card`, featured-star toggle), the
details modal and standalone detail page (author/center/trainer/client
key-value block, likes, testimonial text), and the add/update form
modals (client picker, target radio-pill group for Berliz/center/
trainer, conditional center/trainer pickers, testimonial textarea). The
update modal's "already active, can't be edited" warning banner keeps
its amber tint in both themes. Verified with a real
`ng build --configuration=development`.

### Unreleased — Dark mode: admin/trainer-pricing + admin/center-pricing (D13 continued)

Twenty-second pass, continuing the admin CRUD sweep. Converts both
pricing sections in full: headers, lists (mobile cards + desktop
tables), details modal/detail page (coaching-rate + long-term-discount
key-value blocks), and add/update form modals. The center-pricing
modals (`add-center-pricings-modal`, `update-center-pricings-modal`)
predate the standardized admin CRUD modal pattern used everywhere else
(legacy `bg-gray-200`/`bg-gray-100`/`border-b-2` styling instead of the
usual card+border form-field look) — converted in place with the
closest equivalent dark mapping rather than restyled, since a visual
redesign is out of scope for this pass. The unfinished
`center-pricings-details-modal` stub (`<p>...works!</p>`, never wired
up) was left untouched. Verified with a real
`ng build --configuration=development`.

### Unreleased — Dark mode: admin/partners (D13 continued)

Twenty-first pass, continuing the admin CRUD sweep. Converts the complete
`admin/partners` section -- header, list (mobile cards + desktop table,
including the CV/certificate view-document buttons), the details modal
(status, documents, role/last-update key-value block, motivation,
social links, reject-application action), the standalone detail page,
and the two-step add/update form modals (email/certificate/CV/motivation,
then Facebook/Instagram/YouTube/role). Verified with a real
`ng build --configuration=development`, not just `tsc --noEmit`.

### Unreleased — Dark mode: admin/clients (D13 continued)

Twentieth pass, continuing the admin CRUD sweep. Converts the complete
`admin/clients` section -- header, list (mobile cards + desktop table,
shared `user-hover-card`), the details modal (programs, body-composition
fields, motivation/medical/dietary text blocks), the standalone detail
page, and the large add/update form modals (user select, category
picker, mode radio pills, height/weight/target-weight/calorie grid, and
four free-text sections).

### Unreleased — Dark mode: admin/members (D13 continued)

Nineteenth pass, continuing the admin CRUD sweep. Converts the complete
`admin/members` section -- header, list (mobile cards + desktop table),
the details modal, the standalone detail page, and the add/update form
modals (height/weight/target-weight grid, motivation textarea, medical
conditions, and a category-of-interest checkbox picker).

### Unreleased — Dark mode: admin/subscriptions (D13 continued)

Eighteenth pass, continuing the admin CRUD sweep. Converts the complete
`admin/subscriptions` section -- header, list (mobile cards + desktop
table, status pill, shared `user-hover-card`), the details modal, the
standalone detail page, and the add/update form modals (category-picker,
mode radio pills, user/duration/trainer/center selects, and the
computed total-amount callout).

### Unreleased — Dark mode: admin/payments (D13 continued)

Seventeenth pass, continuing the admin CRUD sweep. Converts the complete
`admin/payments` section -- header, list (mobile cards + desktop table,
status pill, Stripe-refund action + "Refunded" badge), the details modal,
the standalone detail page, and the add/update form modals.

### Unreleased — Dark mode: five single-page admin tools (D13 continued)

Sixteenth pass, continuing the admin CRUD sweep. Converts five smaller,
single-component admin tools: `admin/problem-reports`, `admin/content-reports`,
`admin/berliz-feedback` (all read-mostly moderation tables/lists), `admin/
exercise-suggestions` (a tabbed pending/approved/dismissed list with
approve/dismiss actions), and `admin/availability` (the trainer/center
weekly-schedule editor modal, including its toggle switches and
per-day time-range inputs).

### Unreleased — Dark mode: admin/equipment (D13 continued)

Fifteenth pass, continuing the admin CRUD sweep. Converts the complete
`admin/equipment` section -- a single page (search + "Add equipment",
mobile cards + desktop table with owner-type chip, featured toggle,
edit/delete) plus its add/update modal (owner-type picker, name/stock/
description fields, and the 4-photo upload grid with per-slot upload/
remove/error states). Slightly different shape from every other admin
section so far (one page instead of header+list, a dialog opened via a
plain Angular CDK/Material dialog with no separate detail-view modal),
but the same conversion mapping applies throughout.

### Unreleased — Dark mode: admin/bookings (D13 continued)

Fourteenth pass, continuing the admin CRUD sweep. Converts the complete
`admin/bookings` section -- header (results count + pending/confirmed/
completed/cancelled status-count pills + sort), and the list (mobile
cards + desktop table, status pill, per-status confirm/complete/cancel
action buttons, and the shared `user-hover-card` for the client column).

### Unreleased — Dark mode: admin/faqs (D13 continued)

Thirteenth pass, continuing the admin CRUD sweep. Converts the complete
`admin/faqs` section -- header + list combined in one component (mobile
cards + desktop table with a category chip and status pill), and the
add/update form modals (category, question, answer, display-order
fields).

Also: this pass's verification caught that the plain `tsc --noEmit`
check used through most of this sweep only validates TypeScript, not
Angular template syntax -- an earlier commit (`ccc139bc2`) had left a
`<button>` tag unterminated in `post-comments.component.html`, breaking
every build on master until a concurrent session caught and fixed it
(`62e24a794`). From this pass onward, verification uses a real
`ng build --configuration=development`, which runs the Angular
template compiler and would have caught that bug immediately.

### Unreleased — Dark mode: admin/exercises (D13 continued)

Twelfth pass, continuing the admin CRUD sweep. Converts the complete
`admin/exercises` section -- header (with its "Suggestions" link and
NEW badge), list (mobile cards + desktop table with demo image/video
attach buttons), the details modal (demo video preview, muscle-group
and category chip lists), the standalone detail page (adds a
difficulty-level badge, benefit callout, and numbered how-to-perform
steps beyond what the modal shows), and the add/update form modals
(name, demo image, description, benefit, how-to-perform, difficulty
select, muscle-group/category checkboxes).

### Unreleased — Dark mode: admin/categories (D13 continued)

Eleventh pass, continuing the admin CRUD sweep. Converts the complete
`admin/categories` section -- header, list (mobile cards + desktop
table with photo hover-zoom), add/update modals (each with their own
image-cropper sub-modal) with a tag-picker checkbox row, the
details modal, and the standalone detail page. Same mapping as every
prior admin section; several other sections' own templates cite this
one as "the Corrigo-style pattern" they were copied from.

### Unreleased — Dark mode: admin/tags + admin/muscle-groups (D13 continued)

Tenth pass, continuing the admin CRUD sweep. Converts the complete
`admin/tags` and `admin/muscle-groups` sections -- both follow the same
list/header/modal shape as the trainers/centers/users passes before them
(tags has no photo; muscle-groups does), so the same mapping applies:
header, list (mobile cards + desktop table), add/update/detail modals
(muscle-groups' add modal also has its own image-cropper sub-modal), and
each section's standalone detail page.

### Unreleased — Dark mode: admin/users (D13 continued)

Ninth pass, continuing the admin CRUD sweep. Converts the complete
`admin/users` section: header (results count, sort, "Add user"), list
(mobile card rows + desktop table, photo hover-preview, role chip +
inline role-edit, status/delete actions, plus the standalone photo
cropper), the account-details modal (full profile fields + a
force-password-change sub-form), the role-change modal, and the two-step
update-account modal (personal details, then location details).

### Unreleased — Dark mode: admin/centers + trainer/center detail pages (D13 continued)

Eighth pass, continuing the admin CRUD sweep. Converts the complete
`admin/centers` section (header, list, add/update/detail modals with their
image-cropper sub-modal) — structurally identical to the `admin/trainers`
pass before it, same mapping applied. Also catches two standalone detail
pages missed in that prior pass: `trainer-detail-page` and
`center-detail-page` (the "view full record" page each list's row links to,
separate from the row's own quick-view modal).

### Unreleased — Dark mode: admin section, starting with Trainers (D13 continued)

Seventh pass, and the start of the largest remaining bucket: `/dashboard/admin/*`
(~156 templates across ~28 CRUD sections — trainers, centers, users, tags,
exercises, categories, subscriptions, payments, etc.), none of it touched by
any prior pass. This pass covers the shared `admin-search` bar (used by
every admin list) and the complete `admin/trainers` section: header (results
count, sort, "Add trainer"), list (mobile card rows + desktop table, photo
hover-zoom, status pill, action buttons), and the add/update/detail modals
including their image-cropper sub-modal.

Also added a global CSS rule, `html.dark .mat-dialog-container` in
`styles.css`: Angular Material's dialog panel comes from the imported
`indigo-pink` prebuilt theme and is hardcoded light — it never reacts to
Tailwind's `dark:` variants since those only compile onto classes Tailwind's
JIT scanner finds in template source, and the panel's background isn't set
by any template. Every admin add/edit/detail modal (and any other
`MatDialog.open()` call in the app) renders its content directly against
that panel with no `bg-*` of its own, so without this override a dark-theme
viewer would see fully-converted modal content sitting inside a plain white
box. This one override unlocks dark mode for every current and future
Material dialog app-wide, not just this section — it isn't Trainers-specific,
it just happened to be needed to make Trainers' own modals render correctly.

The remaining ~27 admin sections follow the same list/header/modal shape and
are still light-only; each subsequent pass converts a few more.

### Unreleased — Dark mode: the last four dashboard-home widgets (D13 continued)

Sixth pass, closing out `dashboard-main`'s widget list started by the previous "dashboard-home
widgets" pass: `accountability-card`, `challenges-card`, and `consistency-ring` (all rendered
via `dashboard-main.component.html`, alongside the already-converted widgets) plus the
standalone `onboarding-checklist` component (the dismissible first-run checklist at the top of
the page). `recap-card` is deliberately left untouched — its dark red/gray gradient card was
already fixed-dark by design before this effort started, same as the greeting hero above it.

### Unreleased — Dark mode: dashboard-home widgets (D13 continued)

Fifth pass. Adds `dark:` classes to every Dashboard-home widget card: Overview
(module shortcuts), Now active, Users, Notifications, Suggested (programs +
workout templates), Trending exercises, Quick links, Timeline preview, the
Tasks/Workouts/Todos combo widget, and the login/activity/app-analytics/
subscription-analytics chart cards — plus the shared `user-hover-card` popover
used throughout admin tables. `dashboard-todo-list`'s `.ts` status/priority
color-mapping methods (`statusClass`, `priorityClass`, `taskStatusClass`,
`workoutStatusClass`, `getDueColor`) got `dark:` companions added to their
returned class strings too, since those drive the same badges as the
template. Left alone: the Chart.js canvases' own internal grid/axis/tick
colors (still light-only) — retuning every chart's color config for dark-mode
contrast is a separate, more involved pass.

### Unreleased — Dark mode: shared comment-thread components (D13 continued)

Fourth pass. Adds `ThemeService`-driven `dark:` classes to `post-comments`,
`comment-node`, `reaction-button`, and `mention-input` — the components every
comment thread is built from (Timeline posts, dashboard user profiles, and the
public profile page once signed in). All four already had a pre-existing
`dark` `@Input` for a *different*, older mechanism: rendering permanently dark
inside the media-sheet/public-profile-while-anonymous contexts, independent of
the viewer's theme choice. The new `dark:` classes were added only inside each
component's `!dark` branch, so `post-detail-sheet`'s `[dark]="true"` usage
(and any other always-dark call site) renders exactly as before — the two
mechanisms now compose instead of one needing to learn about the other.

### Unreleased — Dark mode: Timeline/feed + shared refresh button (D13 continued)

Third pass on top of the theme infra/shell/Settings and second-batch (Messages, Bookings,
FAQs, Connections) work already on master. Added `dark:` variants to the Timeline/feed page
(`dashboard-timeline`) — compose box (textarea, activity-type pills, workout-template select,
photo uploader), the Feed/My Timeline tab toggle, and every post card (author row, content,
photo frame, linked-workout and book-provider callouts, action bar, empty state) — plus the
shared `refresh-button` component used across most dashboard pages.

Explicitly deferred: `post-comments`, `comment-node`, `reaction-button`, and
`draft-resume-banner` all render inside the post card but were left untouched this pass.
The first three already carry their own `dark` `@Input` — a pre-existing mechanism (unrelated
to `ThemeService`) that lets them render correctly on the permanently-dark public profile vs.
the light dashboard; teaching them to *also* answer to the app-wide theme toggle needs its own
careful pass so the two mechanisms don't fight each other. `draft-resume-banner` uses a solid
`bg-amber-50` card that would need a real dark-mode treatment (not just swapped text colors)
to avoid looking like a bright patch on a dark page — deferred rather than doing it half-right.

### Unreleased — Dark mode: first batch of high-traffic surfaces (D13 continued)

Second pass on top of the theme infrastructure/shell/Settings work already on master. Added
`dark:` variants across: Dashboard home's own inline markup (the greeting hero and welcome
gradient were already fixed-dark by design, so those needed no change); the whole Messages
surface (`messages-main`, `conversation-row`, `message-bubble`, `message-composer`, the
floating `message-popup`); Bookings (`my-bookings-main`'s header plus the shared
`booking-card` component, which both the client-side list and the provider-side list already
reuse, so converting it once covers both); My FAQs; and Connections (search, incoming/sent
requests, the connections list).

Semantic accent colors (status badges, the purple "propose session" button, brand-red
buttons) were deliberately left alone — they already read fine on a dark background, and
retuning every accent color for dark mode contrast is its own pass, not bundled into this one
to keep the diff reviewable. The remaining ~550 dashboard templates (dashboard-home's own
~16 widget components, Timeline, admin screens, and the rest) are still untouched — same
transparent "real but partial" state as before, now covering more of what people actually
look at daily.

### Unreleased — Recap deep link + share-error transparency, global search expansion, FAQ deep link

- **Recap gets a real route.** `/dashboard/recap?period=` replaces the
  dialog-only entry point (`RecapModalComponent` retired, its content moved
  to `RecapPageComponent`) — bookmarkable, shareable within the app, and
  ready for a future "your recap is ready" notification to point straight at
  it (`notification-entity-link.util.ts` gained a `recap` case, though
  nothing publishes that notification type yet). The dashboard card's
  "See your recap" now `routerLink`s there instead of opening a dialog.
- **"Could not share the recap" now shows the real reason.** The share
  button's error handler read a hardcoded string regardless of what the
  backend actually said; now reads `err.error?.message` first, falling back
  to the generic string only when the backend didn't give one — the same
  pattern every other error handler in this codebase already uses. Root
  cause of any individual failure (content moderation, auth, etc.) is now
  actually visible instead of a dead end.
- **Global search covers far more of the app.** Added workout templates,
  FAQs, the public member directory, and posts (own + connections' feed --
  the one entity with no NgRx slice, so it's fetched once via
  `PostService.getFeed()` and cached locally instead; `SearchSource` gained
  an optional `fetch$` alongside the existing `load`/`select` pair to
  support that without disturbing the other ~15 existing sources).
- **Search results deep-link to the specific item, not just the list**,
  wherever a route/anchor exists for one: exercises now link to
  `/dashboard/exercises/:id` (was the bare list) using the detail page built
  earlier this session; FAQs, posts, and members already had somewhere
  specific to land and now do.
- **FAQs are deep-linkable** (`/dashboard/my-faqs?faqId=`) — expands and
  smooth-scrolls to the specific question. Used by global search and the
  notification entity-link resolver (previously `case 'faq'` only ever
  landed on the generic list, dropping the entityId on the floor).
### Unreleased — Dark mode infrastructure + dashboard shell + Settings (D13)

Real theming infrastructure, not a CSS-variable rewrite: Tailwind's own `darkMode: 'class'`
strategy, so every `dark:` utility already available in Tailwind just works once the `dark`
class is on `<html>`. New `ThemeService` (`light` / `dark` / `system`, per-device localStorage,
same pattern as `NavbarStyleService`/`NavControlsService`) applies it once in `AppComponent`'s
constructor and re-applies on live OS-level scheme changes while in `system` mode.

New "Appearance" card in Settings (`user-profile-settings`), styled the same 3-option
radio-card pattern as the existing Sidebar display / Navbar appearance cards, with a `NEW`
badge via the existing `WhatsNewService`.

Converted so far: the dashboard shell (`AppComponent`'s `sidebar` layout wrapper, `TopBar`)
and the entire Settings page (all 10 cards). Deliberately **not** touched: the public
marketing site (`topbar` layout in `AppComponent`) — it's permanently dark by brand design
already (`bg-black` wrapper), same design intent as the mobile app's own always-dark
Trainer/Center-detail and legal pages, so a light/dark toggle has nothing to do there. The
remaining ~560 dashboard templates keep their existing light-only classes for now, which
means the dashboard currently renders as dark chrome around light content cards — a real,
non-broken intermediate state, not full coverage. Converting the rest is its own follow-up
pass, same scale of effort as the original mobile app's own dark-mode rollout.

### Unreleased — Growth & marketing: reward redemption enforced at booking time

Closes the last documented gap from the original growth-feature plan: "a
client's session credit or a provider's promo isn't automatically
applied/deducted anywhere; it's shown to the client, and honored manually by
the provider." Genuine enforcement, not just honesty-system display:

- `Booking` gained optional `sessionCredit`/`promotion` links (V47). The
  booking form lets a client pick one of their own available `SessionCredit`s
  or the target provider's own live `Promotion` when requesting a session.
- Reserved at **creation** time, not confirmation: a credit flips
  `available` → `applied` and a capped promotion's `usageCount` increments
  immediately, so the same credit can't be attached to two pending bookings
  at once and a capped promo can't be oversold past its limit.
- Reverted automatically (credit back to `available`, promo's `usageCount`
  decremented) if the booking is cancelled before being honored, from both
  cancellation paths (`cancelBooking` while pending, `updateStatus` →
  cancelled while confirmed) -- the client never loses a reward to a booking
  that fell through.
- The applied reward renders as a label on the shared `BookingCardComponent`
  so the provider actually sees what to honor, instead of a generic "shown
  somewhere, remembered by nobody." New `BookingRewardRedemptionTest`
  (6 cases: apply, reject someone else's credit, reject an already-used
  credit, apply/reject a promotion, revert on cancel).
- Still true, and stays true until per-session Stripe charges exist: no real
  money is deducted anywhere. This closes the *tracking/enforcement* gap, not
  the *payment* gap -- the provider still honors the discount manually when
  the client shows up, same as before, but now the system actually remembers
  what was promised and stops it being spent twice.

### Unreleased — Growth & marketing: leaderboard, share bonus, partner codes

Closes the last documented gap: "social-share unlock, referral leaderboard,
corporate/gym co-marketing partnerships — raised as growth ideas, not built."

- **Referral leaderboard** — top 10 referrers by completed-referral count on
  My Rewards. `ReferralRepo.topReferrers` (grouped/ordered JPQL), names
  resolved via the same `DisplayNameUtil` every other surface uses.
- **Social-share unlock** — "Share for a bonus free session": native share
  sheet (falls back to copy-link), grants a one-time `share_bonus`
  `SessionCredit` the first time. Trust-based, matching how every other
  session credit already works (no per-session payment to verify against).
- **Corporate/gym co-marketing partner codes** — `Promotion` gained an
  optional `code` (V46 migration). A coded promotion is invisible on the
  public badge, the Deals feed, and the auto-signup-grant path — reachable
  only via `POST /promotion/redeem/{code}`. A coded platform campaign grants
  an immediate `SessionCredit` (once per user); a coded provider promo is
  just surfaced, honored manually like any other provider offer. "Have a
  code?" box on My Rewards; the promotion form gained an optional code field
  (self-serve trainer/center promos and admin campaigns both support it, not
  just admin — a trainer sharing a private rate with one gym partner is a
  legitimate real use case too).

### Unreleased — Growth & marketing follow-ups: referral coverage, Hub discovery, Promo Partner payout

Closes the three gaps the promotions/growth feature launch (below) documented:

- **Referral attribution now covers every signup path**, not just the full form.
  `loginOrCreate` (Google/Facebook) and `quickAdd` both accept an optional
  `referredBy`; `LoginFormComponent`/`QuickSignupComponent` read `?ref=` and forward
  it. Social accounts track-and-complete the referral in the same call (no
  separate activation step to defer to).
- **Growth campaigns now show up as a real Hub tile.** `DashboardServiceImplement`'s
  admin map gained a `campaigns` count (`PromotionRepo.countPlatformPromotions()`);
  `hub-grid.component.ts` groups it under Content & programs. Previously only
  reachable by typing the URL.
- **"Promo Partner" incentive extended beyond the free badge**, per the original
  plan's recommended next step: `getActiveTrainers`/`getActiveCenters` sort a
  provider with a live promotion first (search-ranking boost), and
  `PayoutServiceImplement` now charges 10% commission instead of 15% on a
  completed booking whose provider currently has a live promotion — a real,
  ongoing payout benefit for running one, not just one-time visibility. New unit
  test coverage for both the discounted-rate math and the sort order.

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
- **Fixed a `LazyInitializationException` crashing the hourly trainer-subscription
  expiry sweep.** `expireSubscriptions()` fetched active subscriptions, then touched
  each one's lazy `@OneToOne` trainer — with no surrounding transaction, that repo
  call's own short-lived Hibernate session had already closed by the time the loop
  got there. Caught live in the running dev server's log. Added `@Transactional`
  so one session spans the whole sweep; had zero test coverage before, now covers
  the expire / not-yet-due / no-trainer / empty-list paths. `com.berliz@24a6198`
  (+ tests).
- **Fixed `SocialAuthServiceImplementTest`'s two new-user tests failing after the
  referral-attribution wiring landed.** The new-user path in social login started
  calling `promotionService`/`referralService`, but the test had no `@Mock` for
  either — `@InjectMocks` silently left both null, the first call NPE'd, the
  surrounding try/catch swallowed it, and the test saw a null access token instead
  of the real failure. Added the missing mocks. `com.berliz@1b63fe6`.
- **Notification bell deep-links to connections/sessions/bookings, not just
  messages.** Only `entityType="message"` ever routed anywhere — every other
  notification (and the whole dropdown surface, which had no deep-link at all)
  fell through to a dialog repeating the notification's own text. Extracted
  the routing switch into a shared `navigateToNotificationEntity()` util so the
  dropdown and the My Notifications page can't drift apart, and extended it —
  plus the matching backend `entityType`/`entityId` on connection-request/
  accepted, peer-session proposed/confirmed, and booking status-change events —
  to route straight to Connections / My Sessions / My Bookings.
  `berliz@abda644f` / `com.berliz@772a8c5` (+ tests).
- **Settings is its own sidebar item again.** Folded into Profile a while back
  to fight sidebar overflow; the sidebar's had a scrollable container since,
  so that tradeoff no longer holds. `berliz@eb8d03eb` (+ test).
- **Sidebar child dropdown for My Trainer/Center Profile.** A chevron expands
  Introduction/Pricing/Benefits/Photo Album/Video Album etc. as sub-items,
  each jumping straight to that section (router fragment) instead of always
  landing at the top. Auto-expands while that item's own route is active.
  Added `scrollToFragment()` since Angular's `anchorScrolling` fires before
  either target page's async-loaded content exists. `berliz@5754295c` (+ tests).
- **Notification deep-linking extended to every remaining entity type.**
  Comment/mention/reply notifications route to the timeline with
  `?postId=` (new `GET /post/{id}`, fetched independently since the post
  might not be on whichever timeline tab is loaded, or loaded at all);
  workout/run verification, rank promotion, trainer/center profile
  self-confirmations, account settings, task/faq/workout CRUD, and
  payment/subscription/payout all route to their existing page. Also fixed
  a bug found along the way: `PayoutServiceImplement`'s notifications never
  set a `targetUser`, so the trainer/center a payout was actually about
  never received either one — only the admin audit copy existed.
  `berliz@e70574c5` / `com.berliz@884e962` (+ tests).
- **Account dropdown polish.** "Partnership" only made sense for a trainer/
  center, but showed for every role — gated behind a new `isProvider`
  getter, matching the sidebar. Added a labeled "Links" section (Rewards &
  referrals, Help & FAQs, Give feedback — reuses the same
  `BerlizFeedbackModalComponent` the public footer already opens); header
  gained a subtle background + slightly larger avatar. `berliz@83332192`
  (+ tests).
- **Built the bulk newsletter modal's template.** Admins had zero UI at all —
  the template was still the unedited CLI stub despite a real reactive form
  and working submit behind it. Mirrors the single-recipient newsletter
  modal minus the recipient field. Also fixed the submit handler: the
  invalid-form branch never told the admin anything, and a stray
  unconditional snackbar at the end fired on every call regardless of
  outcome (including a bogus error toast on top of a successful send's own
  success toast). `berliz@dcd245857` (+ tests).
- **Inline error styling for the booking-duration and location dropdowns.**
  Booking form's duration select and location-form's country/state/city/
  countryCode `ng-select`s (used across several booking/address flows) had
  zero invalid-state indication, unlike every text field around them —
  reused the existing `berliz-select--error` class already defined for
  this. `berliz@aa53a31ea` (+ tests).
- **Fixed 13 test regressions from the referral-attribution wiring.**
  `LoginFormComponent`/`QuickSignupComponent`/`SignupComponent` all gained
  an `ActivatedRoute` dependency (reading `?ref=`) and the Google/Facebook
  login calls gained a second `referredBy` parameter, but none of the
  three specs were updated — two had no `ActivatedRoute` provider at all,
  and two had stale single-argument `toHaveBeenCalledWith` assertions.
  `berliz@9d0898963`.
- **Fixed two My Bookings bugs.** A trainer/center landed on "My bookings"
  (their own client-side bookings, almost always empty for a provider)
  instead of "Requests" (sessions clients booked WITH them — their actual
  activity), so confirmed/completed bookings were invisible until they
  clicked over manually — now defaults a provider straight to Requests,
  without overriding a manual switch back. Also, clicking a booking card
  did nothing for any status except a still-pending request in provider
  mode; added a read-only "Booking details" modal (counterparty, full
  date/time/notes/applied reward, requested/updated timestamps) for every
  other status/mode. `berliz@8f7d9ea32` (+ tests).

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

### Earlier (from git history)
- Image/file attachments in messaging
- Passkey (WebAuthn) login + passkey management in settings; nav-control styles; "what's new" badges
- Group runs scheduling/logging; admin exercise-suggestions review
- Reply-with-quote and message edit/delete
- Workout logging + log sharing
- Peer sessions
- Blocking + content reports
