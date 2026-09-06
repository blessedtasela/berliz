# Berliz — Competitive Analysis & Differentiation

_Compiled Sept 2026. Purpose: find what fitness-app users reward and punish elsewhere, and
turn that into a concrete, ranked feature list for Berliz. Every proposed feature is listed
in [§4](#4-proposed-berliz-differentiators-pick-list) for you to pick from — nothing here is
built without sign-off._

---

## 1. Where Berliz sits

Berliz is three products most competitors only do one of:

1. **Social fitness network** — feed, posts, comments, connections, messaging (vs Strava, Hevy).
2. **Trainer & gym marketplace / discovery** — find and book trainers, gyms, martial-arts
   centers (vs ClassPass, Mindbody, Trainerize).
3. **Training tracker** — workouts, runs, progress, tasks, peer sessions (vs Strong, JEFIT,
   Nike Training Club).

The **martial-arts / centers angle** is a genuine niche almost no mainstream fitness-social
app serves. That's the sharpest wedge — see §4.

---

## 2. Competitor landscape

| App | Category | What users **love** | What users **complain about** |
|---|---|---|---|
| **Strava** | Social + tracking | Segments & leaderboards (compete without being in the same place); clubs, challenges; long-awaited dark mode; "Year in Sport" recap | Moving previously-free features (Year in Sport) **behind an $80 paywall**; leaderboard **cheating** (e-bike/motorbike); API lockdown killing integrations |
| **Hevy** | Strength log + social | "Best tracker" — simple, **free**, lots of graphs; friend feed ("see what friends are lifting"), copy a friend's workout & compare; Apple Watch standalone tracking | UI **hard to navigate**; no resistance-band tracking; no left/right imbalance tracking |
| **Strong** | Strength log | Simplest, most intuitive logging; "stays out of your way"; free tier is enough | Thin on social; feature velocity slow |
| **Trainerize / TrueCoach / Everfit** | Coaching platforms | Everfit: best UI + built-in nutrition; Trainerize: integrations, Health Connect sync, studio-scale; TrueCoach: fastest workout programming entry | **Advertised price misleading — real bill 40–60% higher** once automation/nutrition/payments/branding added; per-client cost ceilings; TrueCoach has no AI builder, no native nutrition |
| **ClassPass / Mindbody** | Gym & class discovery | Many studios in **one app / one membership**; try before committing; fast, well-liked support | **Hard to unsubscribe**; clunky onboarding/setup; studios dislike deep per-booking discounts |
| **Nike Training Club** | Guided workouts | Completely **free**; broadcast-quality video; big variety; real multi-week progressive programs | **No community at all** — can't connect with friends in-app; fewer plans than before |
| **Peloton App** | Guided workouts | Leaderboard, working out "with" others | Killed its **free** tier; £12.99/mo |
| **Freeletics** | AI bodyweight coach | AI Coach adapts intensity; strong bodyweight progression; community edge | Most content paywalled; tap-the-phone workout format divides users |
| **Garmin Connect** | Tracking | Depth of data | Backlash for locking **year-in-review** behind a subscription |
| **BJJ/martial-arts software** (Gymdesk, PushPress, SparkMembership, BJJLink) | Dojo management | Belt/rank progression tracking; attendance→promotion criteria; parent visibility into a child's progress; "10,000-hour" mastery visualization; session analytics | Mostly **owner-facing back-office**, weak member-facing social/mobile experience; generic fitness apps "don't get" martial arts |

---

## 3. Cross-cutting patterns

### What consistently *delights*
- **Asynchronous competition** — segments, leaderboards, PRs, challenges. You compete with
  people you'll never meet in real time. (Strava's core moat.)
- **Friends' activity in a feed** — "what did my friends train today", copy/compare. (Hevy.)
- **Gamification** — badges, streaks, shout-outs. Apps with it see **~50% higher retention**;
  in 2026 ~70% of successful transformations correlate with high in-app social connectivity.
- **A shareable annual/seasonal recap** — huge goodwill… until it's paywalled.
- **Generous free tier** — NTC and Hevy win largely on "free and complete".
- **One app instead of many memberships** — ClassPass's whole pitch.
- **Fast, human support.**

### What consistently *frustrates*
- **Paywalling something that used to be free** (Strava, Garmin, Peloton) — the single most
  reliable way to earn 1-star reviews.
- **Hidden/creeping pricing** — advertised price ≠ real bill (coaching platforms).
- **Surprise renewal charges** — no pre-renewal reminder → refund requests + 1-stars.
- **Hard paywall before value is felt** — 37% of churn is "insufficient usage"; a workout's
  value is felt *after* doing it, so gating upfront underperforms.
- **Clunky onboarding / weak value framing** — most apps lose subscribers *before* the
  paywall even loads.
- **Hard-to-cancel subscriptions.**
- **Confusing navigation** (Hevy's most common UI gripe).
- **Cheatable leaderboards** with no verification.

---

## 4. Proposed Berliz differentiators (pick list)

Ranked by _impact ÷ effort_. Effort: **S** ≈ 1–2 days FE · **M** ≈ 3–6 days · **L** ≈ 1–2 wks,
✚BE = needs backend. Pick the ones you want and I'll fold them into the plan + `FEATURES.md`.

### Tier 1 — high impact, contained

1. **Training streaks + weekly consistency ring** — S/M ✚BE.
   A visible streak (days/weeks with a logged workout, run, or class) on the dashboard and
   profile. Gamification is the highest-ROI retention lever and Berliz has all the source
   events already (workout logs, runs, sessions). *Gap: Strong/NTC have no streak; Hevy's is
   thin.*

2. **"Year/Season in Berliz" recap — permanently free** — M ✚BE.
   An auto-generated shareable recap (totals, PRs, top training partners, belt moves, a
   highlight post). Deliberately never paywalled — turn the mistake Strava/Garmin/Peloton
   keep making into a marketing loop. Generates a feed post → drives re-engagement.

3. **Belt / rank progression tracker** — M ✚BE. **(martial-arts wedge)**
   Per-discipline rank ladder (BJJ belts+stripes, karate kyu/dan, boxing tiers…), current
   rank, time-in-grade, attendance toward next promotion, and a mastery-hours bar. Center/
   trainer can promote; member gets a milestone post. *No mainstream social-fitness app does
   this; dojo software does it only for owners.*

4. **Accountability partners + "nudge when a streak is slipping"** — M ✚BE.
   Pick 1–3 connections as accountability partners; if someone hasn't trained in N days the
   app prompts a partner to send an encouragement. Uses existing connections + notifications
   + messaging. *Directly copies the "social nudge" pattern the research flags as working.*

5. **Reactions beyond a single like** — S ✚BE (small).
   💪 🔥 👏 ❤️ on posts and comments instead of one heart. Cheap, and it makes the feed feel
   alive. (Pairs with the comment-likes work already in flight.)

### Tier 2 — strong, larger

6. **Segments / leaderboards for runs & classes** — L ✚BE.
   Route segments for runs; per-center/per-class attendance & effort leaderboards among
   connections. Strava's core delight, scoped to friends (less cheating pressure than global).

7. **Challenges** — L ✚BE.
   Time-boxed goals (distance, sessions, technique count) a user, a group, or a whole center
   can join, with a progress board and a badge on completion.

8. **PRs & auto-milestones in the feed** — M ✚BE.
   Detect a personal best (weight, distance, pace, longest streak) from logged data and offer
   a one-tap MILESTONE post. The `MILESTONE`/`PROGRESS` activity types already exist.

9. **Verified activity badge** — M ✚BE.
   Mark runs/sessions imported from a wearable or confirmed by a trainer/center as
   "verified", so friend leaderboards mean something. Answers Strava's cheating complaint.

10. **Trainer/center "book" CTA on every relevant surface + transparent pricing** — M.
    Show full price (no "from $X") on trainer cards and make booking reachable from feed
    posts and profiles. Directly counters the coaching-platform "hidden pricing" gripe.

### Tier 3 — polish / trust

11. **Pre-renewal reminder + one-tap, no-friction cancel** — S/M ✚BE.
    Email/notification 2 days before a subscription renews; cancel in ≤2 taps from Settings.
    Turns the #1 subscription frustration into a trust signal. (Ties into
    [[project_payment_subscription_model]].)

12. **Onboarding that shows value before any paywall** — M.
    Role-aware first-run: get the user to one real action (log a workout, follow someone,
    find a gym) before pricing appears. Research: hard upfront paywalls underperform.

13. **Dark mode** — M.
    Repeatedly a top request elsewhere; the public profile page is already dark-themed, so
    the tokens partly exist.

14. **Copy / "do this workout" from a feed post** — S.
    One tap to clone a shared workout template into your own. (Hevy's most-loved social action.)

15. **Saved / bookmarked posts & workouts** — S ✚BE.

---

## 5. Anti-patterns Berliz should commit to avoiding

- Never move an existing free feature behind a paywall. If something must be paid, it launches
  paid.
- Always show the real price. No "from $X" on anything transactional.
- Always send a pre-renewal reminder; always allow a ≤2-tap cancel.
- Never gate first-run value behind pricing.
- Keep navigation shallow — the Hevy lesson. New features attach to an existing section
  before they get their own nav entry.
- Friend-scoped leaderboards by default; global/competitive views need a verification story.

---

## Sources

- [Strava App Review 2026 — BarBend](https://barbend.com/strava-app-review/)
- [How Strava Traded User Goodwill for Nothing — Velo/Outside](https://velo.outsideonline.com/road/road-gear/strava-missteps/)
- [Strava puts "Year in Sport" behind an $80 paywall](https://tagteam.harvard.edu/hub_feeds/3415/feed_items/17132945/content)
- [Strava taps AI, unveils family plan, dark mode — TechCrunch](https://techcrunch.com/2024/05/16/strava-taps-ai-to-weed-out-leaderboard-cheats-unveils-family-plan-dark-mode-and-more)
- [Hevy Workout Tracker alternatives & reviews — AlternativeTo](https://alternativeto.net/software/hevy-workout-tracker)
- [App for tracking weightlifting workouts — TeamBlind](https://www.teamblind.com/post/app-for-tracking-weightlifting-workouts-vsdarjxe)
- [Everfit vs Trainerize vs TrueCoach: The Honest Review 2026 — Everfit blog](https://blog.everfit.io/everfit-vs-trainerize-vs-truecoach)
- [Everfit vs Trainerize vs TrueCoach — FitBudd](https://www.fitbudd.com/insights/everfit-vs-trainerize-vs-truecoach)
- [Most fitness apps gate workouts immediately — RocketShip HQ](https://www.rocketshiphq.com/paywall-structure-fitness-app-workouts/)
- [The Adapty benchmark: fitness apps & hard paywalls — RocketShip HQ](https://www.rocketshiphq.com/paywall-optimization-fitness-apps/)
- [Garmin locks year-in-review behind paywall, users react angrily — Notebookcheck](https://www.notebookcheck.net/Garmin-locks-year-in-review-behind-subscription-paywall-users-react-angrily.1177473.0.html)
- [Mindbody vs ClassPass — SaaSHub](https://www.saashub.com/compare-mindbody-vs-classpass)
- [ClassPass Reviews 2026 — G2](https://www.g2.com/products/mindbody-classpass/reviews)
- [Fitness is social: top 6 features successful apps share — social.plus](https://www.social.plus/blog/fitness-is-social-top-6-features-all-successful-apps-share)
- [Best Fitness Apps for Groups: Social Workouts and Challenges — FitBudd](https://www.fitbudd.com/post/best-app-for-fitness-challenges-guide)
- [Nike Training Club Review — Yahoo/Health](https://health.yahoo.com/wellness/fitness/online-fitness/articles/nike-training-club-review-better-203000725.html)
- [Peloton's free app bites the dust — Tom's Guide](https://www.tomsguide.com/wellness/fitness/pelotons-free-app-bites-the-dust-heres-3-workout-apps-to-use-instead)
- [BJJ Gym Software: The Complete 2026 Guide — Gymdesk](https://gymdesk.com/blog/bjj-gym-software-comparison)
- [Best Martial Arts Management Software 2026 — PushPress](https://www.pushpress.com/blog/best-martial-arts-management-software)
- [Best BJJ Apps in 2026 — Mattime](https://mattime.app/blog/best-bjj-apps-2026/)
