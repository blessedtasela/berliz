# Issue log (GN-26 stand-in)

GN-26 (an admin-visible issues log inside the app) is itself one of the open
items below and hasn't been built yet. Until it ships, this file is where
each session records what it worked on, so the owner can see where things
stand without asking. Once GN-26 ships, migrate these rows into it and retire
this file. Items are only "verified" after a re-test (ideally Koda's QA
pass), not on the developer's word alone -- rows below say "fixed, unverified"
until that happens.

## 2026-11-03 session

Source: owner's Nov 3 fix list (money bugs first, per his own priority order).

### Money (lead priority)

| ID | Item | Status | Verified by |
|---|---|---|---|
| BK-15 / Fix 2 | Gym drop-in added to the Estimated Total | Already fixed in code (not by this session) -- `booking-price.util.ts` already excludes `dropInFee` from `total`; the booking page already wires `locationFee` (travel) and `gymDropIn` (drop-in) separately. **If production still shows this bug, the deployed build is stale -- redeploy frontend from current `master`.** | Frontend unit tests (unchanged, already passing) |
| BK-14 / Fix 3 | Drop-in flat $25 on every gym, no CA$ label, no real per-gym cap | **Fixed.** Backend cap was 0-1000, changed to 0-25 (`ProviderPricingRules.dropInFee`, `MAX_DROP_IN_FEE`). Frontend: added a matching client-side `max(25)` validator on the trainer's per-gym field, and made every "$" label in the booking location picker and price estimate say "CA$" (gym list, travel-fee note, refund example). | Backend: 8 new/updated unit tests pass. Frontend: 60 + 9 unit tests pass (updated wording assertions). Unverified by a human QA pass yet. |
| PY-16 (item 18) | Overcharge: drop-in added to the platform charge | Root cause (BK-15) was already fixed in code before this session (see above -- redeploy question applies). In-app full/partial refunds through Stripe already existed (admin Payments tab). **Fixed this session:** a refund now also recomputes the booking's Payout (gross/commission/amount kept) at its already-locked-in commission rate, instead of leaving stale pre-refund figures (`PayoutService#adjustPayoutForRefund`); a payout already paid out via Stripe is left alone and logged for manual reconciliation. **Not done:** a full audit of every money total in the app. | Backend: 3 new unit tests + full suite green. Unverified by QA. |
| PY-15 / PY-20 (item 20) | Commission mislabeled 15% but charged 10% | **Fixed.** Root cause: a "Promo Partner" feature silently gave any provider with a live promotion a flat 10% rate regardless of the 15% label. Replaced with the owner's Nov 3 decision: 15% base, 12% at 5+ completed-paid sessions in the provider's Pacific week, 10% at 10+ (`PayoutServiceImplement`). **Not done:** Earnings-tab visibility of a paid-but-upcoming booking, the "Set up payouts" banner, reconciling the dashboard to live Stripe. | Backend: 26 unit tests pass (4 new tier tests + full regression). Unverified by QA. |
| PY-17 (item 21) | Test-mode Stripe money shown as real earnings | **Not started.** Investigated: no `livemode` tracking exists anywhere in the codebase today, so there's no way to tell a test charge from a real one after the fact. Needs: a `livemode` column on Payment/Payout populated from the Stripe webhook event, excluded from earnings sums; the 4 known contaminated Oct 27 rows need manual identification against Stripe (I don't have DB/Stripe-dashboard access to do that part). | Not started |
| PY-18 (item 22) | Earnings as a full transaction ledger | **Not started.** This is a real new feature (a ledger table with gross/commission/net/status per transaction, row-level detail, totals that reconcile) -- scoped but not built. | Not started |

### P0s

| ID | Item | Status | Verified by |
|---|---|---|---|
| SG-07 (item 13) | Every real sign-up failed with "something went wrong" | **Fixed.** Found via Railway production logs: every sign-up that left the (optional) profile photo blank threw `MethodArgumentNotValidException` (Spring can't bind an empty-string multipart field to `MultipartFile`), answered as a generic 500. Fixed with Spring's own `StringMultipartFileEditor`, registered globally; validation failures now get a specific 400 message naming the field instead of falling through to "something went wrong." | Backend: 2 new unit tests pass, full suite green. **Not yet verified against a real multipart sign-up request end-to-end** -- recommend a real sign-up smoke test before calling this fully closed. |
| GN-19 / Fix 1 | Android: "Something went wrong" right after sign-in | **Partially fixed.** The crash itself is a React render-time error caught by `ErrorBoundary`; `reportError` was a complete no-op because `EXPO_PUBLIC_SENTRY_DSN` isn't set, so the real cause was invisible. Fixed: `reportError` now always `console.error`s too, so it's visible via Metro/adb even without Sentry. **Still needed:** the owner needs to supply/set a Sentry DSN (external action, not something I can do); the actual crashing component is still unidentified -- needs either Sentry data or a device repro. | Mobile: existing + 1 new unit test pass (4/4 in `errorReporting.test.ts`). The underlying Android crash itself is **not verified fixed** -- only its visibility improved. |
| GN-23 (item 14) | Admin Users page: empty, then "something went wrong", then real data | **Not started.** Same generic-error family as SG-07/GN-19; not investigated this session. |

### Bonus find (not on the list, but real)

`BookingServiceImplement#ensureClientRelationship` -- the exact "client booked before -> automatically part of the trainer's network" behavior the owner asked about -- **already exists in code**, but was crashing with a `StackOverflowError` on every single call (Lombok `@Data` on both `Client` and `Subscription` created a circular hashCode through their bidirectional relationship). It was silently swallowed by a try/catch, so the feature has never actually worked in production. **Fixed** (excluded the cycle from equals/hashCode/toString) and covered by a new regression test. This answers the owner's standing question: the feature exists, it just needs this fix to actually run.

### Not started this session (in priority order)

Booking correctness: BK-24 (item 19, intake/onboarding disconnect), BK-19 (discipline + what-to-bring), BK-20 (selections sticking), BK-21 (location dropdown), BK-22 (24h auto-cancel), BK-23 (early-arrival wording), CT-06 (center video gallery).

Remaining bugs: PF-24 (negative price), BK-17/18 (bookings list hides money), PF-23/25/26/27 (dashboard-vs-public-profile contradictions), SG-06 (no terms/privacy checkbox), VD-11 (wrong too-short message), PF-06, GN-05 (home counters), PF-30, PF-31 (demo content), GN-20, PF-29, PF-28, PF-14, PF-32, SG-03, GN-09, CT-11, GN-21, Fix 4/BK-16 (discount doesn't move the total + no "request a code" button).

Features (owner's stated order): GN-26 itself (this file is the stand-in), CT-12 (super admin center builder), PR-01/PR-02 (Programs), CM-01 (connected clients + real messaging), EM-01/02/03 (notification email rebuild).

### Pre-existing issue found, not caused by this session

`WeeklySubscriptionServiceImplementTest` (3 of its tests) anchors to `new Date()` for "next 4 weeks" Tue/Thu scheduling counts, so how many occurrences it expects can be off by one depending what day of the week the suite actually runs on -- it failed on 2026-11-03/04 but this session never touched the weekly-subscriptions feature. Whoever owns it should pin the test to a fixed reference date instead of the real clock.

### Shipped this session

- Backend branch `fix/money-dropin-cap` -> rebased onto fresh `origin/master`, full suite green (excluding the pre-existing flaky test above), merged to `master`, branch deleted.
- Frontend branch `fix/booking-money-dropin` -> this file + CA$ consistency + drop-in cap validator.
- Mobile branch `fix/error-reporting-console-fallback` -> always-log error reporting.
