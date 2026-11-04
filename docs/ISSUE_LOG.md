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
| PY-17 (item 21) | Test-mode Stripe money shown as real earnings | **Fixed going forward.** Added `livemode` (nullable Boolean) to `Payment` and `Payout`, populated from Stripe's own `livemode` flag on the Checkout Session / PaymentIntent / Invoice at the moment each payment is recorded; `Payout.livemode` is copied from the booking's most recent Stripe payment. Billing-summary sums (`sumAmountByStatusTrueAndDateAfter`, `sumPayoutAmountByStatus`) now exclude rows where this is explicitly `false`. **Not done (needs the owner):** the 4 known contaminated Oct 27 rows predate this column (it's null on them, not false) and still need manual identification against Stripe -- I have no Stripe-dashboard or production-DB access to do that part. | Backend: 7 new unit tests (4 on `calculateAndCreatePayout`'s livemode resolution, 2 webhook-handler tests, migration V92) + full suite green. Unverified by QA/real Stripe test-mode charge. |
| PY-18 (item 22) | Earnings as a full transaction ledger | **Already built, not realized** -- the entire "Admin Billing" section (`/dashboard/billing`, admin-only) exists end-to-end: an Overview tab (gross payment volume, active recurring revenue, payouts pending/paid, refunds -- `GET /dashboard/billing-summary`, now livemode-aware per PY-17 above), a Payouts tab (every payout, gross/commission/amount/status, Stripe transfer id, "Pay out" action), a Connect-accounts tab, and Payments/Subscriptions tabs surfacing the Stripe fields. Found while fixing PY-17 -- this was going to be built from scratch this session until `docs/FEATURES.md` line 129 (and then the actual component files) turned up. **Not a single unified "ledger" table** in the literal sense the item describes, but the gross/commission/net/status data is all there across Payouts + Payments; a dedicated combined view would be a small follow-up, not a from-scratch feature. | Verified by reading the existing components/routes, not newly tested this session |

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

Remaining bugs: PF-24 (negative price), BK-17/18 (bookings list hides money), PF-23/25/26/27 (dashboard-vs-public-profile contradictions), SG-06 (no terms/privacy checkbox), VD-11 (wrong too-short message), PF-06, GN-05 (home counters), PF-30, PF-31 (demo content), GN-20, PF-29, PF-28, PF-14, PF-32, SG-03, GN-09, CT-11, GN-21.

Features (owner's stated order): GN-26 itself (this file is the stand-in), CT-12 (super admin center builder), PR-01/PR-02 (Programs), CM-01 (connected clients + real messaging), EM-01/02/03 (notification email rebuild — the Universal Header Block idea from the Muse research belongs here).

**Jackson 3 migration and mobile passkeys stay parked** — not oversights: Jackson 3 would break passkey login (`webauthn4j` 0.28 is Jackson-2-only, no upgrade path confirmed yet); passkeys need the owner's own `assetlinks.json`/AASA hosting + signing-cert SHA-256 + a native-module EAS dev-client build.

### A second "fix list" (email research + ad hoc asks), same session, continued

- **Fix 4 / BK-16 ("no request a code button")** — turned out to only be a real gap on the **Plan** subscription picker (Basic/Plus/Exclusive-style tiers): Plans have no trainer to route a request through, so there was genuinely no ask-for-a-code path there. **Fixed**: new `PlanCodeRequest` flow (backend `POST /bypassCode/requestCode`, admin `GET/PUT .../codeRequests`), a "No code? Request one" link on every plan card, goes straight to the administration's queue. The **package/booking** version of this ("Request a code from my trainer") already existed (`level-up-page`) — not touched. Group packs' per-member-share payment model doesn't fit a flat bypass code and was deliberately left alone rather than bolted on incorrectly.
- **Two live email bugs**, from the owner's Nov 3 Muse research doc ("items 27 and 28"): (1) the trainer payment-received notification said only "X paid for their session" with no amount, currency, date, booking reference, or which account it was for -- **fixed**, now states all of those plus that the figure is gross, not net payout (`BookingReference.paymentReceivedSummary`). (2) a claimed "button lands on the client page instead of the trainer page" bug turned out to be **already fixed** -- `/dashboard/my-bookings` is the role-aware `ManageBookingsComponent`, not the old client-only page. The deeper "every email needs a Universal Header Block (account/role identity) because one person can hold more than one Berliz account" idea from that research is real but systemic (touches the full email catalogue) -- that's the EM-01/02/03 rebuild, not a quick fix, and stays queued there.
- **~5 remaining native `confirm()`/`alert()` dialogs** — only 2 were real (most of the audit's "~5" were already on `PromptModalComponent`, or, in one case, dead commented-out code): `payment-codes` (revoke) and `weekly-subscriptions` (cancel) still used `window.confirm()`. **Fixed**, both now use `PromptModalComponent`. Also deleted `src/legacy/guards/authentication.guard.ts` -- dead, unused, unconditionally `alert()`'d and redirected regardless of actual auth state.
- **PY-17 test-mode-earnings tracking** — see the Money table above; fixed going forward, historical rows still need the owner.
- **"Hide my achievements" toggle** -- the owner asked for this to be built; **it already exists** (`PUT /user/updateShowAchievements`, migration V74, Settings on both web and mobile). No work needed.
- **Star ratings, calendar sync, provider analytics, waitlist, sidebar consolidation** -- all four were on this file's own "still open" list (and in memory) as unbuilt; **all four turned out to already be shipped** by an earlier, undocumented change (see `docs/FEATURES.md`, "Guest-first booking, star ratings, waitlist, calendar link and provider insights"). Verified directly against current code (`TrainerReview.rating`/`CenterReview.rating`, `SlotWaitlist`, the Insights tab, the Train/Find & Book/Community/Me sidebar groups) before writing this, so this isn't trusting stale docs either. The two stale memory files that caused the confusion have been corrected.
- **Jackson 3 migration** -- the owner said to leave it parked; confirmed the reason still holds (`webauthn4j` 0.28 has no Jackson 3 support).
- **Admin Billing (PY-18 fold-in)** -- the owner asked to fold the existing "Admin Billing" plan into the PY-17/18 work. It turned out to already be fully built (`/dashboard/billing`: Overview, Payouts, Connect accounts, Payments/Subscriptions tabs) -- see PY-18 above. The plan file (`reflective-juggling-orbit.md`) was stale.

### Pre-existing issue found, not caused by this session

`WeeklySubscriptionServiceImplementTest` (3 of its tests) anchors to `new Date()` for "next 4 weeks" Tue/Thu scheduling counts, so how many occurrences it expects can be off by one depending what day of the week the suite actually runs on -- it failed on 2026-11-03/04 but this session never touched the weekly-subscriptions feature. Whoever owns it should pin the test to a fixed reference date instead of the real clock.

### Shipped this session

- Backend branch `fix/money-dropin-cap` -> rebased onto fresh `origin/master`, full suite green (excluding the pre-existing flaky test above), merged to `master`, branch deleted.
- Frontend branch `fix/booking-money-dropin` -> this file + CA$ consistency + drop-in cap validator.
- Mobile branch `fix/error-reporting-console-fallback` -> always-log error reporting.
