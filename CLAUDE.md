# Berliz Web Frontend

Angular 16 + NgRx + Tailwind frontend for Berliz (backend: `C:\berliz-project\back-end\com.berliz`).

## Branching & merge workflow

Too many long-lived branches kept colliding (one was 116 commits behind
`master`). The rule now, for every session:

- **`master` is the only permanent branch.** Everything else is short-lived.
- **One branch per task, cut from fresh `origin/master`.** Do the work, run the
  tests, merge back to `master`, then **delete the branch (local + remote)** —
  all in the same session. A branch must not outlive the session that made it.
- **Trivial one-file changes** (a doc, a dependency bump, a constant) can go
  straight to `master` once tests pass — skip the branch.
- **Sync while you work:** `git fetch origin && git merge origin/master` (or
  rebase) periodically, not just at the end. If a branch falls >~20 commits
  behind `master` or older than a day, sync it now or abandon and re-cut.
- **Delete on merge, every time.** A merged branch has zero value and just
  makes the branch list unreadable.
- **Don't touch another session's branch or worktree** if it has commits or
  uncommitted changes from the last hour — assume it's live. Force-removing a
  dirty worktree destroys work you can't verify is junk.

## Mobile parity tracker

There's a companion Expo/React Native app at `C:\berliz-project\mobile` that
ports this app's client-facing features. Its `README.md` has a feature
parity table tracking what's built on each side — check it before adding a
new web feature (so it lands on the tracker) and before assuming mobile
lacks something (it might already be there).
