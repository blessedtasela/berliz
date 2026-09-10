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
| Tasks & To-do lists | ✅ | Personal + admin-assignable |
| Progress entries (measurements/metrics over time) | ✅ | |
| Progress sharing | ✅ | `progress_share` |
| Exercise library + gear/equipment ("Exercises & Gear") | ✅ | Videos, detail fields, trending |
| Exercise suggestions (user-submitted → admin review) | ✅ | |
| Muscle-group taxonomy | ✅ | |
| Fitness achievements | ✅ | `FitnessAchievement` |
| Peer sessions (propose / schedule training with a connection) | ✅ | "My Sessions" |
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
| Stripe payments + webhook | ✅ | |
| Bypass / promo codes | ✅ | |
| Payouts (to trainers/partners) | ✅ | |
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
| D2 | "Year/Season in Berliz" recap — auto-generated, shareable, **permanently free** | 📋 | ✚ |
| D3 | Belt / rank progression tracker (per discipline; trainer/center promotes; milestone post) | ✅ | ✚ |
| D4 | Accountability partners + "nudge when a streak slips" | ✅ | ✚ |
| D5 | Multi-reactions (👍💪🔥👏❤️) on posts & comments | ✅ | ✚ |
| D6 | Friend-scoped segments & leaderboards for runs and classes | 📋 | ✚ |
| D7 | Challenges — open / connections-only, progress board + completion badge | ✅ | ✚ |
| D8 | PR detection → one-tap MILESTONE post | ✅ | ✚ |
| D9 | Verified activity badge (wearable-imported or trainer-confirmed) | ✅ | ✚ |
| D10 | Transparent trainer/center pricing + book CTA on every relevant surface | ✅ | ✚ |
| D11 | Pre-renewal reminder + ≤2-tap cancel | 📋 | ✚ |
| D12 | Value-first onboarding (one real action before any paywall) | 📋 | — |
| D13 | Dark mode (app-wide) | 📋 | — |
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

---

## Changelog

Newest first. Each entry: what shipped, which surfaces, PR/commit.

### Unreleased — "Post interaction & UX" work
_Branch: `claude/xenodochial-kirch-459f51` → follow-on branch_

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
