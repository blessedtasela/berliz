# Backend / web / mobile parity gaps

Owner's rule (2026-11-05): if there is a backend endpoint, there must be a web screen **and** a mobile screen for it. This file is the shared list of what is missing and who is on it. **Before starting anything here, check `ListAgents`, `git worktree list` and `git status`, and claim the item by editing the Owner column in a small commit to master.** Update the Status column when you ship.

Method: every endpoint in the backend `rest/*Rest.java` (716 on 2026-11-05) was checked against the web `src/` and mobile `src/` for a call to it (script: a path match, so it over-reports: admin list/get-by-id endpoints that a screen reaches by another route show up as "missing"). The lists below are the triaged, real gaps.

Status: `todo` / `doing` / `done`.

## Needs both web and mobile (nobody has either)

| Feature | Backend | Web | Mobile | Owner | Status |
|---|---|---|---|---|---|
| Trainer controls for groups: list own groups/packs, confirm / cancel / complete a group, cancel a pack | `/group-session/trainer/mine`, `/{id}/confirm|cancel|complete`; `/group-pack/trainer/mine`, `/{id}/cancel` (backend done 2026-11-05) | Requests view of Bookings (`provider-groups`) | Provider Bookings screen (`ProviderGroupsCard`) | booking-bugs session | done (web + mobile) |
| "Accepting referral bookings" setting (trainer/center opt-out) | `/availability/acceptingReferrals` GET/PUT | Availability editor, next to Booking notice | Booking settings card under Weekly hours | booking-bugs session | done (web + mobile) |

## Web has it, mobile does not

| Feature | Backend | Owner | Status |
|---|---|---|---|
| Payment codes: request, ask trainer, my codes/requests, check/redeem; trainer forward/decline/cancel; admin approve/reject/revoke/codes; a "unique code" field in the booking form | `/payment-code/*`, `/bypassCode/*`, `paymentCode` on booking create and purchasePackage | booking-bugs session | todo |
| Weekly fixed-time subscriptions: mine, view, set schedule, pause, resume, cancel | `/weekly-subscription/*` | booking-bugs session | todo |
| Trainer monthly coaching plans (buy a trainer plan) | `POST /subscription/purchaseTrainerPlan` | booking-bugs session | todo |
| Referral claim (free-session reward claim / waitlist) | `/referral-claim/*` | booking-bugs session | todo |
| Shop: browse products, product detail, cart + Stripe order checkout, my orders; seller: my store, my products | `/product/*`, `/store/*`, `/order/*`, `POST /payment/stripe/order-checkout/{id}` | booking-bugs session | todo |
| Monthly booking plans: preview, mine, view, respond | `/booking/plan/*` | booking-bugs session | todo |
| Promo code preview when buying a plan | `POST /discountCode/preview` | booking-bugs session | todo |
| Provider settings: booking notice, session length | `/availability/leadTime`, `/availability/slotDuration` | booking-bugs session | done (mobile: Booking settings card) |
| Exercise progress chart; share a workout log with a user | `/workoutLog/getExerciseProgress/{id}`, `/workoutLog/{id}/share/{userId}` | booking-bugs session | todo |
| Trainer views a client's progress entries | `/progress-entry/client/{clientId}` | booking-bugs session | todo |
| Center: manage affiliated trainers, photo | `/center/updateMyCenterTrainers`, `/center/updatePhoto` | booking-bugs session | todo |
| Passkeys (WebAuthn) | `/webauthn/*` | unclaimed: needs a native passkey module, decide with the owner | todo |

## Backend has it, web has no screen

| Feature | Backend | Owner | Status |
|---|---|---|---|
| Admin: Brands | `/brand/*` | booking-bugs session (after the hub-route dedupe merges) | todo |
| Admin: Drivers | `/driver/*` | booking-bugs session | todo |
| Admin: Bills | `/bill/*` | booking-bugs session | todo |
| Admin: Products, Orders, Stores (all, any status) | `/product/*`, `/order/*`, `/store/*` admin endpoints | booking-bugs session | todo |
| Center owner: members (add, status, remove, my members, my memberships) and a member's own views | `/center/addMember`, `/center/updateMemberStatus/{id}`, `/center/removeMember/{id}`, `/center/getMyCenterMembers`, `/center/getMyCenterMemberships`, `/member/getMy*` | booking-bugs session | todo |
| A client's own trainer reviews | `/client/getMyTrainerReviews` | booking-bugs session | todo |
| Admin: set a user's password | `PUT /user/changePasswordAdmin` | unclaimed (security-sensitive: ask the owner) | todo |

## Not a gap on purpose

Webhooks (`/payment/stripe/webhook`, `/revenuecat/webhook`), native-only calls (`/auth/apple`, `/payment/stripe/booking-payment-intent/*`, `/user/updatePushToken`), and the web-only display preferences (`/user/updateSidebarDisplay`, `/user/updateMessagePopupEnabled`).
