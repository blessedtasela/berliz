# QA Feature Relationship Map

`docs/FEATURES.md` lists what Berliz does, one row per capability. This document is the other
half: how those capabilities depend on and affect each other, so a QA pass on one thing doesn't
miss what it quietly breaks or blocks on another. Each cluster below names the backend file/method
that actually enforces the gate, so it can be re-verified any time the code changes — these aren't
assumptions, every chain here was traced through the real service code as of Nov 23, 2026.

Read a cluster, test what it names together, move on. Nothing here duplicates `FEATURES.md`'s
per-feature detail — follow the linked section there for that.

---

## 1. Booking lifecycle

See [FEATURES.md §5 Discovery & marketplace](./FEATURES.md#5-discovery--marketplace) and
[§6 Payments & subscriptions](./FEATURES.md#6-payments--subscriptions).

**Chain:** request created → provider confirms (prices it: hourly rate × minutes, less
reward/promo, plus location fee) → client has **24h to pay** or it auto-cancels → Stripe Checkout
→ webhook marks Paid, creates the Payout row → session happens → status becomes `completed` (or
`no_show`, or stays `cancelled`) → **only now** does a review slot open.

**The review gate is stricter than "completed once" — it's completed-count vs. review-count.**
`TrainerServiceImplement.getMyReviewSlotStatus()` compares
`bookingRepo.findByClientAndTrainerAndStatus(client, trainer, "completed").size()` against
`trainerReviewRepo.countByTrainerAndClient(trainer, client)`. A client can leave one review per
*completed session*, not one ever — book and complete three sessions with the same trainer, you
get three review slots.

**Trap:** `Testimonial` (the entity behind "Testimonials" in FEATURES.md §5) is a **completely
separate, ungated system** from `TrainerReview`/`CenterReview` (the "Reviews" system
`getMyReviewSlotStatus` guards). `TestimonialServiceImplement.addTestimonial()` has no booking
check at all. If you're testing "does a review require a completed session," make sure you're
testing the Review flow, not the Testimonial flow sitting right next to it in the UI — they look
like one feature and aren't.

**Cancellation math:** `CancellationPolicy.refundFraction()` — full refund if the client cancels
at least `freeCancelHours` before start, else `lateCancelRefundPercent`% back. Both values are
pinned to the booking at confirmation (provider's own setting, or the platform default), so
changing a trainer's cancellation policy *after* a booking is confirmed must not retroactively
change what that booking refunds if cancelled — test by confirming a booking, changing the
trainer's policy, then cancelling the old booking.

**Plans/packs reuse the same `Booking` rows, not a separate schema.** A weekly subscription, a
multi-session pack, or a group pack each creates/links ordinary `Booking` rows
(`Booking.packageSubscriptionId`/`planId`) — the confirm → pay → complete → review chain above
applies to each session inside a plan exactly like a single booking. Testing "cancel one session
inside an active 10-pack" exercises the same cancellation-policy code path as a one-off booking,
just with the pack's remaining-session count also needing to move.

**Reward interplay:** a `SessionCredit` or provider `Promotion` attached at booking *creation*
flips to `applied`/increments `usageCount` immediately — not at confirmation — specifically so the
same reward can't be double-attached to two pending bookings. Cancelling before the booking is
honored reverts both. If you create a booking with a reward, abandon it (don't confirm), and
create a second one with the same reward, the first must auto-revert or the second will wrongly
be refused as "already used."

---

## 2. Account deletion cascades

See [FEATURES.md §1](./FEATURES.md#1-accounts--identity).

`AccountDeletionServiceImplement`'s `scrub()` sets `User.deletedAt` (a timestamp, not a boolean)
and wipes personal fields — the account row survives (so bookings/payments on the other side of a
transaction stay intact), it just stops looking or acting like a live person.

**Every surface that renders someone else's identity has to check `deletedAt` separately** — this
session's GN-85 work threaded it through one-by-one: `UserResponse`, `PostResponse.authorDeleted`,
`CommentResponse.authorDeleted`, `ConnectionResponse.otherUserDeleted`,
`ConversationSummaryResponse.otherUserDeleted`, `MessageResponse.senderAccountDeleted`/
`recipientAccountDeleted`/`replyToSenderAccountDeleted`, `BookingResponse.clientDeleted`. There is
**no single global check** — a new surface that shows a user's name/photo needs its own flag added,
or it'll happily render a deleted account as if they were still there.

**Trap for QA:** deleting a test account mid-flow (e.g. mid-conversation, mid-booking) doesn't
throw errors anywhere — by design, everything the deleted user already did stays on record. What
to actually check is cosmetic: does the *other* party's screen now say "Deleted account" with no
actions, on every surface that mentions them? If you're testing five different features with the
same two test accounts and delete one partway through, you'll want to re-check each surface
separately rather than assume one fix covers all of them.

**What it refuses:** `scrub()` won't run while the account has upcoming bookings or a
still-renewing subscription — test the refusal message, not just the happy path.

---

## 3. Social graph — connections, follow, block

See [FEATURES.md §2](./FEATURES.md#2-social--feed-posts-connections).

**Connections and Follow are two independent systems, not one with two names.** A connection
needs a request + accept; a follow is one-sided, no acceptance. Both separately make someone's
posts show up in the follower/connection's feed — test them as two separate paths to the same
feed result, not interchangeably. `RecommendedTrainersComponent` only excludes people already
*followed*, not connections, so a trainer you're connected with (but not following) can still show
up in "Recommended for you" — that's the current, intentional behavior, not a bug, but it's a
common false-positive QA finds if testing from the assumption that connecting = follow.

**Block is two-directional and enforced independently in each service** —
`BlockServiceImplement.isBlockedEitherDirection()` is called directly inside
`PostServiceImplement`, `CommentServiceImplement`, `MessageServiceImplement`,
`FollowServiceImplement`, and `SavedItemServiceImplement` (confirmed by reading each call site,
not inferred). There's no shared middleware doing this once for everything — a new feature that
touches user-to-user content needs its own `isBlockedEitherDirection()` call, or blocking won't
reach it. If you're testing "does blocking X hide their content from me," check each surface
separately (feed, comments, mentions, messaging, likers lists, notifications) rather than
assuming one block covers all of them, precisely because each one is its own, separately-added
check.

---

## 4. Reactions, likes, comments

See [FEATURES.md §2](./FEATURES.md#2-social--feed-posts-connections) and this session's GN-124
work (`docs/ISSUE_LOG.md`).

**Post reactions and comment reactions are fully parallel, separate systems** — `PostLike`/
`postLikeRepo` vs. `CommentLike`/`commentLikeRepo`, each with their own toggle endpoint
(`PUT /post/like/{id}` vs. `PUT /comment/like/{id}`) and their own `ReactionType.from()` call.
Fixing or breaking one does not touch the other — test both independently, not as one "reactions"
feature.

**Default changed to LOVE (GN-124, Nov 22-23, 2026):** `ReactionType.from(null/blank/unknown)` now
resolves to `LOVE`, not the old `LIKE`. `LIKE` is still a valid stored value (pre-existing rows
from before the picker existed), it's just never offered as a pick anymore. If a test fixture or
an old screenshot still expects a plain tap to produce `LIKE`, that's now stale — check against
`LOVE`.

**Deleting a post cascades reactions and comments in one call, in a specific order** —
`PostServiceImplement.deletePost()`: deletes every `PostLike` on it, then every `CommentLike` on
every comment under it, then the comments themselves, then the post. **Deleting a comment removes
its whole reply subtree** via `ON DELETE CASCADE` on `comment.parent_fk` (the DB does it, the
service just recounts for `commentCount`/`replyCount`) — `comment_like`/`comment_mention` cascade
off each removed comment the same way. Testing "delete a comment with 3 replies, each with their
own reactions" should show the post's `commentCount` drop by 4, not 1.

**Notification fan-out:** reacting, commenting, and `@mention`-ing each publish their own
notification (in-app + push + email, gated per-category by the recipient's own notification
settings — see FEATURES.md §7). Reacting to your own post/comment, or mentioning yourself, must
not notify you — that's the first thing to check when this cluster regresses, since it's an easy
off-by-one to introduce when wiring a new reaction type or mention path.

---

## 5. Payments, payouts, and the reward system

See [FEATURES.md §6](./FEATURES.md#6-payments--subscriptions) and
[§10 Growth & marketing](./FEATURES.md#10-growth--marketing).

**Four separate things create a `Payment`/`Payout`, and they don't share a code path:** a single
booking payment, a plan/pack purchase (multi-session), a monthly coaching subscription
(Level Up), and the platform's own tiered `Subscription` plans. Testing one doesn't exercise the
others' pricing/validation logic — each has its own Stripe Checkout session and its own webhook
handling.

**Commission is volume-tiered per provider, per Pacific week — not a flat 15%, and not
promotion-based.** `PayoutServiceImplement.resolveCommissionRate()`: base rate 15%
(`COMMISSION_RATE`), dropping to 12% (`TIER_MID_RATE`) at 5+ completed-and-paid sessions that
Pacific week, and to 10% (`TIER_HIGH_RATE`) at 10+ (`TIER_MID_THRESHOLD`/`TIER_HIGH_THRESHOLD`).
Only `completed` + `PAID` bookings count toward the tier — a cancelled, refunded, or no-show
session never bumps the count, but still gets whatever rate the week has already earned by that
point. The rate is resolved and pinned onto the `Payout` row **at the time that specific booking
completes**, so earlier payouts in the same week don't retroactively jump to a higher tier once a
later session pushes the provider over a threshold — test by completing 4 sessions in one week
(all at 15%), then a 5th (that one and only that one at 12%), and confirm the first 4 aren't
rewritten.

**Promo/bypass codes are a different mechanism from session-credit rewards** — a bypass code
(admin-approved, `DiscountCode`) comps a whole subscription purchase via a one-time Stripe
`Coupon`; a `SessionCredit` (from a campaign or referral) discounts one individual booking at
creation time (see cluster 1's reward-interplay note). They don't stack by design and live in
separate admin surfaces (`/dashboard/hub/promo-codes` vs. `/dashboard/my-rewards`) — don't test
them as if one supersedes or interacts with the other; as far as the code shows, they don't.

**Refunds don't automatically restore a spent reward.** Cancelling a *paid* booking auto-refunds
through Stripe (per FEATURES.md §6), but a `SessionCredit` that was `applied` to that booking at
creation time is a separate record — check explicitly whether a refund also flips the credit back
to `available`, since the booking-cancellation revert logic (cluster 1) is specifically for an
*unconfirmed/unpaid* booking being abandoned, not a paid one being refunded after the fact; these
are two different code paths and this map does not have enough direct evidence to say the second
one restores the credit — treat it as an open question to test, not an assumed behavior.

---

## 6. Admin impersonation (GN-78)

See `docs/ISSUE_LOG.md`'s GN-78 entry.

`UserServiceImplement.impersonate()` is gated on `jwtFilter.isSuperAdmin()` — not the `admin` role
generally, the one specific super-admin account. It mints the **exact same kind of access/refresh
token pair a real login produces**, with the same lifetime (no shortened expiry for an
impersonated session) — this is a real session as that user, not a read-only view.

**What it does NOT do:** route through `SecurityIncidentServiceImplement`'s incident ledger. The
only audit trail is a single `log.warn("Super admin {} is impersonating user {} ...")` line.
There's no record inside the app itself of who was impersonated when, beyond that log line — if
QA needs to confirm an impersonation happened, that's a server-log check, not something visible
anywhere in the admin UI.

**Trap:** because the minted token is indistinguishable in lifetime/shape from that user's own real
login, testing-as-another-user via impersonation is **not equivalent to that user's own session**
in one specific way worth remembering: it's the super admin's `startImpersonation()` on the
frontend that stashes the real admin's own tokens so "Return to admin" can restore them — a plain
page refresh or a cleared-tokens edge case while impersonating should be tested to confirm it
doesn't strand the session as the impersonated user with no way back.

---

## Gaps this map doesn't cover

Not every FEATURES.md domain has a clear enough cross-dependency to write a trustworthy cluster
for yet — Messaging's interaction with Connections/Follow/Block beyond what's in cluster 3,
Notifications' per-category email opt-out interacting with the GN-124 reaction fan-out, and the
Growth/referral credit's interaction with account deletion (does a referred-but-then-deleted
account's credit survive?) are all real open questions, just not ones this pass traced through the
actual code. Add a cluster here once one of those is actually verified, rather than guessing.
