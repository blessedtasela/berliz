# Berliz — Whole-app audit (web, mobile, backend)

_Oct 2026, against web `7f0738acc`, backend `af5bda4` (Spring Boot 4.1.1), mobile `8c24281`._
_Scope: business logic and funnels on the public and signed-in surfaces, usability and
accessibility, operations/risk, and a plan for guided demos. Companion to
[`COMPETITIVE-ANALYSIS.md`](./COMPETITIVE-ANALYSIS.md) (which covers features — this covers how well
the existing ones work)._

## How to read this

- **Evidence** is cited as file names or counts. Counts come from `grep` over the source and are
  *indicative* (a regex can over- or under-count); each is there to show scale, not to be exact.
- **Not verified:** I did not click through the signed-in pages with real accounts, did not load-test,
  and did not inspect production data. Items marked _(verify)_ are inferred from code, not observed.
- **References** are mostly vendor and practitioner blogs; where a number comes from one, it is said so.
  Recommendations marked _(judgment)_ are mine, not sourced.

---

## 1. Verdict in one page

Berliz is **feature-rich and unusually well tested** (web 1,201 specs, backend 592 tests, CI on both,
migration-collision test, per-object webhook idempotency, double-booking guard, completed-booking
review gate). The risk is not missing features. It is:

1. **Flying blind in production** — no error monitoring on web, mobile *or* backend, and no health
   endpoint (the backend has no Actuator). Spring Boot 4 just shipped with nothing to tell you if it is healthy.
2. **Errors that look like success** — 664 `catch (Exception)` blocks in the services, ~216 of which
   return an empty object or `null` instead of failing. A broken review/booking call can reach the
   client as a blank 200.
3. **The public funnel leaks** — listing cards show no price and no rating (while `FEATURES.md` claims
   "transparent pricing everywhere"), search is one text box, and booking is login-walled up front.
4. **Provider-side business logic has holes** that cost bookings and trust: pending requests never
   expire, no upcoming-session reminders, no calendar sync, no analytics, reviews are not tied to a booking.
5. **Navigation is too wide and accessibility is thin** — ~25 sidebar entries with overlapping
   features; mobile has accessibility props in 4 of 124 screens/components.
6. **No guided first run** beyond a checklist — no tour, no demo/sandbox.

### Top 10, in order

| # | Action | Why now | Platforms | Effort |
|---|---|---|---|---|
| 1 | Add error monitoring + health endpoints (Sentry; Spring Actuator liveness/readiness → Railway healthcheck) | Boot 4 + Angular 21 just shipped; nothing reports breakage | web, mobile, backend | S |
| 2 | Stop swallowing exceptions in money/booking/review services; return real error statuses | Silent failures corrupt trust and hide bugs | backend | M |
| 3 | Session reminders (24 h + 2 h, email + push) for client **and** provider | No-shows are the provider's main cost; only payment reminders exist | backend, mobile, web | S–M |
| 4 | Pending-request SLA: nudge provider at 12 h, auto-expire at 48 h, tell the client and suggest alternatives | Requests can sit forever | backend (+UI copy) | M |
| 5 | Reviews tied to a booking: one per completed booking, prompt after completion, provider reply, avg + count everywhere | Today one completed booking allows unlimited reviews | backend, web, mobile | M |
| 6 | Listing cards: rate, rating + count, next open slot, mode; real filters + sort + server paging | Biggest public conversion lever | backend (+web, mobile) | M–L |
| 7 | Guest-first booking: choose a slot first, create the account at the last step | Forced sign-up is a documented abandonment cause | web, mobile | M |
| 8 | Handle Stripe `charge.refunded`, `charge.dispute.*`, `account.updated`, `payout.failed` | Money state can drift from Stripe's | backend | M |
| 9 | Sidebar from ~25 to ~8–10 entries; accessibility sweep (web icon buttons, mobile labels) | navigation is Hevy's most common UI complaint (per COMPETITIVE-ANALYSIS.md); Apple's accessibility labels are heading toward mandatory | web, mobile | M |
| 10 | Role-based demo workspaces + 1–3-step user-initiated tours (see §8) | Show value before asking for effort | all | M |

---

## 2. What is already strong (keep it)

- **Booking integrity:** `requireNoConflictingBooking` guards double-booking; pay-after-confirm with a
  24 h window and auto-cancel; provider-specific cancellation policy shown before booking.
- **Review gate:** a self-service review requires a *completed* booking with that trainer
  (`TrainerServiceImplement.addTrainerReview`). Many small marketplaces skip this.
- **Payments:** per-object webhook dedupe (`findByStripeInvoiceId`, `findByStripeCheckoutSessionId`).
- **Security posture:** server-side role + ownership checks, security headers, rate limiting on login,
  signup and password reset.
- **Quality net:** web 1,201 specs, backend 592 tests incl. a Flyway version-collision test and a
  Jackson-contract test, CI on both repos building the exact deploy artifact.
- **Information design:** transparent cancellation terms, value-first onboarding checklist, promo and
  referral system, dark mode, passkeys.

---

## 3. Public site (web) — the funnel

Funnel: landing → trainers/centers list → profile → book → log in → request → provider confirms → pay.

| # | Finding | Evidence | Recommendation |
|---|---|---|---|
| W1 | **Cards show no price or rating.** `FEATURES.md` marks "Transparent pricing + Book CTA everywhere" ✅, but the public trainer and center cards contain neither. | 0 matches for price/rating in `trainers-search-result.component.html` and `center-search-result.component.html`; `hourlyRate` exists on the model; there is no average-rating field on `Trainers` | Backend: return `avgRating`, `reviewCount`, `nextAvailableSlot` on the listing DTO. Cards: hourly rate (no "from" — your own rule), ★ avg (n), mode badge, next slot. Fix the docs claim until shipped. |
| W2 | **Discovery is one text box + one criteria chip.** No price, specialty, mode, availability or distance filters; no sort; the full list is loaded and filtered in the browser. | `trainers-search.component.html`; `getActiveTrainers` returns everything | Server-side search with facets (specialty, mode, price range, rating, location/distance, "available this week"), default sort "Recommended", result counts on filters. ClassPass filters by activity, location, distance, price and skill level and hides unavailable classes by default ([ClassPass help](https://help.classpass.com/hc/ar/articles/204312229-How-do-I-search-for-classes-)); Baymard separates filtering from sorting and recommends both ([Baymard](https://baymard.com/learn/ecommerce-filter-ui)). |
| W3 | **Login wall before the booking form opens.** | `BookingDialogService.openBookingForm` shows "Login required" first; the booking page gates at lines 228/258/290 of `booking-page.component.ts` _(guest behaviour on the page not verified)_ | Let a guest pick the slot, then ask for an account (Google/passkey/quick sign-up) on the final step and keep the selection (you already re-open the form after login, which is the right mechanism). Baymard: 19% of shoppers abandoned because they did not want to create an account ([Baymard](https://baymard.com/blog/reduce-cart-abandonment)) — ecommerce data, directional for bookings. |
| W4 | **No visible "ask a question" path before booking.** Chat components exist but are not placed on the profile pages. | `app-chat-with-trainer` / `-center` not referenced in any template _(verify)_ | A "Message" button on trainer/center profiles (it can reuse the existing messaging). Unanswered doubts are the commonest reason to leave. _(judgment)_ |
| W5 | **Trainer/center detail pages are not prerendered** (only 11 marketing routes are), so a shared link likely carries generic Open Graph tags. | `prerender-routes.txt` | Check a profile URL in a share debugger; if generic, serve per-profile OG tags (edge function or prerender the top N profiles) and add profiles to the sitemap. _(verify)_ |
| W6 | **No cookie-consent mechanism** found. | 0 matches for consent libraries | Confirm whether any third-party tracker loads; if so add consent (Canada/EU audiences). _(verify)_ |
| W7 | No PWA manifest/service worker, although a code comment refers to an "installed PWA". | 0 matches | Either add a manifest (cheap, helps "Add to Home Screen") or fix the comment. Low priority, since native apps exist. |

**Supply-side lesson for the public pages** ([Sharetribe](https://www.sharetribe.com/academy/onboard-initial-marketplace-supply/)): show *bookable availability*, because
when it isn't visible, customers message providers and the deal tends to leave the platform. The new
weekly-hours card helps; a "next open slot" on cards would help more.

---

## 4. Signed-in — client

| # | Finding | Evidence | Recommendation |
|---|---|---|---|
| C1 | **Sidebar is wide and overlapping.** ~25 entries for a plain user; Tasks, To-do list, Workouts, Workout Room, My Progress, Recap and Achievements overlap; three icons are reused (`zap`, `tag`, `clock` ×2). | `navbar/sidebar-nav-items.ts`. The analysis doc itself says "keep navigation shallow — the Hevy lesson". | Collapse to ~8–10: **Home · Train** (workouts, runs, tasks, to-dos, progress, achievements, recap as tabs) **· Find** (providers, deals) **· Bookings · Messages · Community** (timeline, connections, members, hub) **· Rewards & Saved · Me** (profile, settings, subscriptions, FAQs). Keep deep links working with redirects. |
| C2 | **First run is a checklist on an otherwise empty dashboard** (14 widgets). | `onboarding-checklist.component.ts` | See §8: demo workspace, empty states that teach, a "How clients see you / what you'll see" preview. |
| C3 | **Loading/empty/error coverage is partial.** Loading refs in 121 of 530 templates; error/retry in 39 (the load-error rollout is in progress). | grep | Finish the `app-load-error` rollout; one shared skeleton + empty-state component used by every list. |
| C4 | **Inconsistent dialogs and noise:** 8 native `alert()/confirm()` calls; 235 `console.log` in app code. | grep | Replace native dialogs with the existing prompt modal; add an ESLint `no-console` rule (allow `warn`/`error`). |
| C5 | **Forms:** 110 form templates; only 16 reference an explicit error component; 24 `<button>` without `type` (accidental submits inside forms). | grep | A single `app-field-error` pattern and a lint rule for button `type`. |

---

## 5. Signed-in — provider (trainer / center): business logic

| # | Finding | Evidence | Recommendation |
|---|---|---|---|
| P1 | **Pending booking requests never expire or escalate.** | No expiry/decline job; only `BookingPaymentScheduler` (payment chase) exists | Nudge at 12 h, auto-expire at 48 h with notice to the client and "try another time/provider". Track provider response time and show "usually replies in …" on the profile. _(judgment)_ |
| P2 | **No upcoming-session reminders.** | Reminders exist for unpaid bookings and subscription renewals only; `no_show` status exists but nothing tries to prevent it | 24 h and 2 h reminders to both sides (email + push), with one-tap confirm/cancel. |
| P3 | **No calendar sync** (ICS feed / Google / Apple). | 0 matches | Per-provider private ICS feed for confirmed bookings (cheap, read-only), later two-way Google. Prevents personal-calendar double-booking. |
| P4 | **Reviews are gated but not tied to a booking.** One completed booking permits unlimited reviews; no duplicate guard; no provider reply; no prompt after the session. | `addTrainerReview`: checks "has any completed booking", then inserts | Add `bookingId`, enforce one review per completed booking, prompt after completion (email + push, ~7-day window), provider reply, and a computed average + count. Double-blind publishing (both sides review before either is shown) is Airbnb's pattern ([Sharetribe glossary](https://www.sharetribe.com/marketplace-glossary/double-blind-reviews/)); verified-only reviews are standard ([Yocale](https://business.yocale.com/blog/yocale-verified-reviews/)). |
| P5 | **No provider analytics.** | 0 matches for views/conversion | Profile views → messages → requests → confirmed bookings, plus a weekly digest email. The metric that matters is *liquidity* — share of listings that transact ([Kompassify](https://kompassify.com/blog/marketplace-onboarding-guide)). |
| P6 | **No waitlist** for full slots. | 0 matches (outside referrals) | "Notify me if this opens" per slot. |
| P7 | **Stripe events not handled:** only 5 types are processed (`checkout.session.completed`, `invoice.paid`, `invoice.payment_succeeded`, `invoice.payment_failed`, `customer.subscription.deleted`). | `StripePaymentServiceImplement.processEvent` | Add `charge.refunded`, `charge.dispute.created/closed`, `account.updated` (Connect onboarding state), `payout.failed`. A dispute or an out-of-app refund currently leaves Berliz's records unchanged. |
| P8 | **Provider go-live path** is a long list rather than "listing live first, details later". | Sharetribe: a provider's first session should end with a live listing; payout details can wait until after the first enquiry ([Sharetribe](https://www.sharetribe.com/academy/onboard-initial-marketplace-supply/)) | A "Go live" progress card: photo → intro → pricing → hours → first package → payout, each step showing what clients will see; allow going live before payout setup. _(partly judgment)_ |

---

## 6. Admin

Broad and complete (28 CRUD sections). Two cheap wins: a single **moderation inbox** that surfaces
pending reviews (`status "false"`), content reports and problem reports with counts; and a **provider
quality view** (response time, cancellations, review score) once P1/P4/P5 exist.

---

## 7. Mobile (Android + iOS)

225 TS/TSX files, 73 screens, 51 components, Expo SDK 57 / RN 0.86, EAS configured, CI present.

| # | Finding | Evidence | Recommendation |
|---|---|---|---|
| M1 | **Accessibility is nearly absent.** `accessibilityLabel/Role` in 4 of 124 screen/component files. | grep | Label every `Pressable`/icon button, set roles, minimum 44 pt targets, test with VoiceOver and TalkBack, respect Dynamic Type. Apple's accessibility nutrition labels are voluntary now, with the stated intent that they become required for new apps and updates ([App Store Connect help](https://developer.apple.com/help/app-store-connect/manage-app-accessibility/overview-of-accessibility-nutrition-labels)); RN says touchables are accessible by default but need labels ([RN docs](https://reactnative.dev/docs/accessibility)). |
| M2 | **No crash reporting.** | 0 matches for Sentry/Crashlytics/Bugsnag | Sentry (Expo plugin) with source maps via EAS. Same for web and backend (§9). |
| M3 | **Thin automated tests:** 7 test files, versus 556 spec files on web (1,201 specs) and 592 backend tests. | find | Cover auth, booking request, pay-after-confirm, and Stripe return deep link first. |
| M4 | **Offline handling in 2 files.** | grep (NetInfo) | Global "You're offline" banner + queue-less read-only mode; retry on reconnect. |
| M5 | **Feature gaps vs web** (tracker in `README.md`): packages / hours / terms cards, the profile redesign, and the "How it works" strip. | README parity table | Port using the existing public endpoints; no backend work. |
| M6 | Store-readiness extras absent: store-review prompt, biometric unlock, i18n/localisation. | 0 matches | Review prompt after the 3rd completed booking; biometric unlock for returning users; keep strings extractable even if only English ships. |
| M7 | A `PlaceholderScreen` route remains for features with no screen yet. | `RootNavigator.tsx` | Replace with an honest "available on web" deep link (it has `webPath`) or hide the entry. |

---

## 8. Backend and operations

| # | Finding | Evidence | Recommendation |
|---|---|---|---|
| B1 | **No monitoring and no health endpoint.** | 0 matches for Actuator/Micrometer/Sentry in `pom.xml` | Add `spring-boot-starter-actuator` (expose only `health/liveness`, `health/readiness`), point Railway's healthcheck at it, add Sentry. |
| B2 | **Swallowed exceptions.** 664 `catch (Exception)`; ~216 return an empty/new response or `null`. Example: `addTrainerReview` catches everything and returns `new TrainerReviewResponse()`. | grep | Let unexpected exceptions reach the existing `GlobalExceptionHandler` (it already produces a clean 500); keep specific catches only where you translate. Start with Booking, Payment, Review, Subscription services; add tests asserting error statuses. |
| B3 | **No Bean Validation anywhere** (0 `@Valid`/`@NotBlank`/…); validation is hand-written per method. | grep | Introduce DTO constraints + `@Valid` on new/changed endpoints, and a uniform field-error response the apps can render inline. Do it incrementally, not as a big bang. |
| B4 | **Lists are not paginated** (`Pageable` in 7 files across 619 endpoints). Public lists return everything. | grep | Page + sort on the public lists first (trainers, centers, posts, notifications). |
| B5 | **No caching** on read-heavy public endpoints (categories, active trainers/centers, platform counts). | 0 matches | Short TTL (30–60 s) cache with Caffeine plus `Cache-Control` headers; it also protects the prerender build from API blips (a build once baked empty pages). |
| B6 | **Rate limiting covers four auth endpoints only**, per instance in memory (the code says so). | `RateLimitFilter.java` | Extend to public writes (contact, newsletter, problem reports, reviews); move to Redis before running more than one instance. |
| B7 | **Schedulers are not cluster-safe** (9 `@Scheduled` jobs, no ShedLock). | grep | Only matters if Railway scales beyond 1 instance — add ShedLock before that. |
| B8 | **Backups** rely on Railway's Postgres backups (the in-app scheduler is local-dev only, by its own comment). | `DatabaseBackupScheduler.java` | Do a documented restore drill once; a backup is only real when restored. |
| B9 | **Jackson 2 compatibility module** is deprecated in Spring Boot 4. | `pom.xml`, `JacksonCompatibilityTest` | Schedule the Jackson 3 migration; the contract test is the safety net. |
| B10 | Docs drift: `docs/ROADMAP.md` (frontend) still lists "authentication UI, user dashboard" as planned. | file | Replace with the real roadmap or remove. |

---

## 9. Guided demos and first-run

**What the research says** (vendor benchmarks — directional, not controlled experiments):
Produktly's 464-product benchmark reports a median completion of 73% for 1–2-step tours versus 8% for
9+ steps, and 23% for auto-started tours versus 69% when the user starts it themselves
([Indie Hackers summary](https://www.indiehackers.com/post/onboarding-benchmarks-from-real-data-across-464-saas-products-median-tour-completion-is-29-6288651c93)).
Chameleon reports 3-step tours at ~72% and 7+ steps at ~16% ([Chameleon](https://www.chameleon.io/blog/mastering-product-tours)).
Checklists tied to real account changes are argued to be a better signal than tour completion
([Frigade](https://frigade.com/glossary/onboarding-checklist)), and a seven-step tooltip tour over a blank
dashboard is widely criticised ([UXMagic](https://uxmagic.ai/blog/saas-onboarding-ux-examples)).
I found no sandbox/demo-mode activation data — treat that part as a bet worth A/B testing.

**Plan** _(judgment, shaped by the above)_

1. **"Explore as…" demo workspaces** — `Client`, `Trainer`, `Center`, reachable from the landing page and
   the app's welcome screen. Seeded demo accounts on the real backend, Stripe in test mode, outbound
   email/push disabled, a banner "Demo account — resets nightly", and a nightly reset job. Lets a
   visitor see a populated dashboard, booking inbox and earnings *before* signing up.
2. **Short, user-started tours (1–3 steps)** behind a "Take a 30-second tour" button — never auto-start.
   Where: dashboard home, the booking form, the provider profile editor, the availability editor, the
   earnings/payout step. (Web: Shepherd.js or similar; mobile: coach marks.)
3. **Empty states that teach** — every empty list shows a sample card plus the one action that fills it.
   Providers get **"How clients see you"** (a preview of the public page just redesigned).
4. **Provider "Go live" card** (see P8) driven by real data, not clicks.
5. **60–90 s videos** for the two core jobs ("book your first session", "set up your trainer profile") in
   the Help Center, on the landing page and as links from the relevant empty states.
6. **Measure it:** activation = first booking *requested* (client) / first booking *accepted* (provider);
   record time-to-value and each tour/checklist step so the demo investment can be judged.

---

## 10. Prioritised backlog

**P0 — trust and visibility (days)**
M-sized or smaller, no product decisions needed: B1 monitoring + health · B2 (money/booking/review
services first) · P2 session reminders · P7 Stripe events · fix the W1 docs claim.

**P1 — conversion and provider value (weeks)**
W1/W2 cards + search + paging · W3 guest-first booking · P1 request SLA · P4 reviews tied to bookings ·
W4 message button · C1 navigation consolidation · M1/M2 mobile accessibility + crash reporting ·
§9 demo workspaces + tours.

**P2 — scale and polish**
B3–B7 validation/pagination/caching/rate limits/ShedLock · P3 calendar sync · P5 provider analytics ·
P6 waitlist · M3–M6 mobile tests/offline/review prompt · W5–W7 sharing, consent, PWA · B9 Jackson 3.

---

## References

- Marketplace supply onboarding — [Sharetribe: onboard initial supply](https://www.sharetribe.com/academy/onboard-initial-marketplace-supply/), [Kompassify onboarding guide](https://kompassify.com/blog/marketplace-onboarding-guide)
- Reviews — [Sharetribe double-blind reviews](https://www.sharetribe.com/marketplace-glossary/double-blind-reviews/), [Yocale verified reviews](https://business.yocale.com/blog/yocale-verified-reviews/)
- Guest checkout / forced sign-up — [Baymard: reduce cart abandonment](https://baymard.com/blog/reduce-cart-abandonment)
- Search, filters, sort — [Baymard: filter UI](https://baymard.com/learn/ecommerce-filter-ui), [ClassPass search help](https://help.classpass.com/hc/ar/articles/204312229-How-do-I-search-for-classes-)
- Product tours and checklists — [Produktly benchmark via Indie Hackers](https://www.indiehackers.com/post/onboarding-benchmarks-from-real-data-across-464-saas-products-median-tour-completion-is-29-6288651c93), [Chameleon](https://www.chameleon.io/blog/mastering-product-tours), [Frigade](https://frigade.com/glossary/onboarding-checklist), [UXMagic](https://uxmagic.ai/blog/saas-onboarding-ux-examples)
- Mobile accessibility — [App Store Connect: accessibility nutrition labels](https://developer.apple.com/help/app-store-connect/manage-app-accessibility/overview-of-accessibility-nutrition-labels), [React Native accessibility](https://reactnative.dev/docs/accessibility)
