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
| Profile avatars link to that user's profile | 🚧 | Everywhere except the top-bar avatar (opens the account menu) |

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
| D1 | Training streaks + weekly consistency ring (dashboard + profile) | 📋 | ✚ |
| D2 | "Year/Season in Berliz" recap — auto-generated, shareable, **permanently free** | 📋 | ✚ |
| D3 | Belt / rank progression tracker (per discipline; trainer/center promotes; milestone post) | 📋 | ✚ |
| D4 | Accountability partners + "nudge when a streak slips" | 📋 | ✚ |
| D5 | Multi-reactions (💪🔥👏❤️) on posts & comments | 📋 | ✚ |
| D6 | Friend-scoped segments & leaderboards for runs and classes | 📋 | ✚ |
| D7 | Challenges — individual / group / center, progress board + completion badge | 📋 | ✚ |
| D8 | PR detection → one-tap MILESTONE post | 📋 | ✚ |
| D9 | Verified activity badge (wearable-imported or trainer-confirmed) | 📋 | ✚ |
| D10 | Transparent trainer/center pricing + book CTA on every relevant surface | 📋 | — |
| D11 | Pre-renewal reminder + ≤2-tap cancel | 📋 | ✚ |
| D12 | Value-first onboarding (one real action before any paywall) | 📋 | — |
| D13 | Dark mode (app-wide) | 📋 | — |
| D14 | "Do this workout" — clone a shared workout from a feed post | 📋 | — |
| D15 | Saved / bookmarked posts & workouts | 📋 | ✚ |

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
