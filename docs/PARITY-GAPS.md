# Backend / web / mobile parity gaps

Owner's rule (2026-11-05): if there is a backend endpoint, there must be a web screen **and** a mobile screen for it. This file is the shared list of what is missing and who is on it. **Before starting anything here, check `ListAgents`, `git worktree list` and `git status`, and claim the item by editing the Owner column in a small commit to master.** Update the Status column when you ship.

Method: every endpoint in the backend `rest/*Rest.java` (716 on 2026-11-05) was checked against the web `src/` and mobile `src/` for a call to it (script: a path match, so it over-reports: admin list/get-by-id endpoints that a screen reaches by another route show up as "missing"). The lists below are the triaged, real gaps.

Status: `todo` / `doing` / `done`.

Handed over 2026-11-06: the booking-bugs session is closed. Done so far (all pushed to master): group sessions and packs (backend, web, mobile, trainer controls), accept-referral switch (web + mobile), booking notice and session length (mobile), weekly subscriptions and payment codes (mobile). Everything marked `todo` is next, in the order listed: promo-code preview, trainer monthly plans, the Shop on mobile (largest), monthly booking plans, exercise progress and workout-log sharing, client progress view, center trainers, then the web admin screens. Worktrees to know about: `.claude/worktrees/group-web` (web, branch feat/web-group-sessions, clean, equals master) and `.claude/worktrees/audit-web`; remove them when done.

**Owner instruction, 2026-11-06 morning: PAUSED, not dropped** -- Shop/Product/Order/Store and the admin Brand/Driver/Bill screens (every row below marked `paused`). Focus narrows to trainers, clients, centers and users until the owner says otherwise. Don't pick these up even though they're next in the stated order above.

## Needs both web and mobile (nobody has either)

| Feature | Backend | Web | Mobile | Owner | Status |
|---|---|---|---|---|---|
| Trainer controls for groups: list own groups/packs, confirm / cancel / complete a group, cancel a pack | `/group-session/trainer/mine`, `/{id}/confirm|cancel|complete`; `/group-pack/trainer/mine`, `/{id}/cancel` (backend done 2026-11-05) | Requests view of Bookings (`provider-groups`) | Provider Bookings screen (`ProviderGroupsCard`) | booking-bugs session | done (web + mobile) |
| "Accepting referral bookings" setting (trainer/center opt-out) | `/availability/acceptingReferrals` GET/PUT | Availability editor, next to Booking notice | Booking settings card under Weekly hours | booking-bugs session | done (web + mobile) |

## Web has it, mobile does not

| Feature | Backend | Owner | Status |
|---|---|---|---|
| Payment codes: request, ask trainer, my codes/requests, check/redeem; trainer forward/decline/cancel; admin approve/reject/revoke/codes; a "unique code" field in the booking form | `/payment-code/*`, `/bypassCode/*`, `paymentCode` on booking create and purchasePackage | booking-bugs session | done (mobile: PaymentCodesScreen, plan-card code box + ask, booking-form field) |
| Weekly fixed-time subscriptions: mine, view, set schedule, pause, resume, cancel | `/weekly-subscription/*` | booking-bugs session | done (mobile: WeeklySubscriptionsScreen) |
| Trainer monthly coaching plans (buy a trainer plan) | `POST /subscription/purchaseTrainerPlan` | Berliz Angular Project Overview | done (web -- already shipped, on the trainer's Level Up page; row was stale. No backend endpoint exists for a trainer to see their own trainer-plan subscribers -- `getMySubscriptions` returns the caller's own purchases as a buyer, not their subscriber list; flagging as a backend gap, not building against nothing) |
| Referral claim (free-session reward claim / waitlist) | `/referral-claim/*` | Berliz Angular Project Overview | done (web -- shipped as its own pass since this row was last touched; mobile still open) |
| Shop: browse products, product detail, cart + Stripe order checkout, my orders; seller: my store, my products | `/product/*`, `/store/*`, `/order/*`, `POST /payment/stripe/order-checkout/{id}` | Berliz Angular Project Overview (handed over 2026-11-06) | paused (owner, 2026-11-06) |
| Monthly booking plans: preview, mine, view, respond | `/booking/plan/*` | Berliz Angular Project Overview (handed over 2026-11-06) | todo |
| Promo code preview when buying a plan | `POST /discountCode/preview` | Berliz Angular Project Overview (handed over 2026-11-06) | todo |
| Provider settings: booking notice, session length | `/availability/leadTime`, `/availability/slotDuration` | booking-bugs session | done (mobile: Booking settings card) |
| Exercise progress chart; share a workout log with a user | `/workoutLog/getExerciseProgress/{id}`, `/workoutLog/{id}/share/{userId}` | Berliz Angular Project Overview (handed over 2026-11-06) | todo |
| Trainer views a client's progress entries | `/progress-entry/client/{clientId}` | Berliz Angular Project Overview (handed over 2026-11-06) | todo |
| Center: manage affiliated trainers, photo | `/center/updateMyCenterTrainers`, `/center/updatePhoto` | Berliz Angular Project Overview (handed over 2026-11-06) | todo |
| Passkeys (WebAuthn) | `/webauthn/*` | unclaimed: needs a native passkey module, decide with the owner | todo |

## Backend has it, web has no screen

| Feature | Backend | Owner | Status |
|---|---|---|---|
| Admin: Brands | `/brand/*` | Berliz Angular Project Overview (handed over 2026-11-06) (after the hub-route dedupe merges) | paused (owner, 2026-11-06) |
| Admin: Drivers | `/driver/*` | Berliz Angular Project Overview (handed over 2026-11-06) | paused (owner, 2026-11-06) |
| Admin: Bills | `/bill/*` | Berliz Angular Project Overview (handed over 2026-11-06) | paused (owner, 2026-11-06) |
| Admin: Products, Orders, Stores (all, any status) | `/product/*`, `/order/*`, `/store/*` admin endpoints | Berliz Angular Project Overview (handed over 2026-11-06) | paused (owner, 2026-11-06) |
| Center owner: members (add, status, remove, my members, my memberships) and a member's own views | `/center/addMember`, `/center/updateMemberStatus/{id}`, `/center/removeMember/{id}`, `/center/getMyCenterMembers`, `/center/getMyCenterMemberships`, `/member/getMy*` | Berliz Angular Project Overview (handed over 2026-11-06) | todo |
| A client's own trainer reviews | `/client/getMyTrainerReviews` | Berliz Angular Project Overview (handed over 2026-11-06) | todo |
| Admin: set a user's password | `PUT /user/changePasswordAdmin` | unclaimed (security-sensitive: ask the owner) | todo |

## Not a gap on purpose

Webhooks (`/payment/stripe/webhook`, `/revenuecat/webhook`), native-only calls (`/auth/apple`, `/payment/stripe/booking-payment-intent/*`, `/user/updatePushToken`), and the web-only display preferences (`/user/updateSidebarDisplay`, `/user/updateMessagePopupEnabled`).
