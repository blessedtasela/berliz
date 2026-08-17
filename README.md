# Berliz — Frontend

Angular single-page application for Berliz, a fitness and combat sports platform connecting trainers, gyms, and clients through profiles, bookings, and content.

**Live**: [berliz.fitness](https://berliz.fitness)

## Stack

Angular 16 · TypeScript · NgRx · Tailwind CSS · RxJS

See [`docs/TECH_STACK.md`](docs/TECH_STACK.md) for a full breakdown of every library in use and why it's here, and [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for how the app is structured.

## Getting started

### Requirements

- Node.js 18+
- Angular CLI (`npm install -g @angular/cli`)

### Setup

```bash
git clone https://github.com/blessedtasela/berliz.git
cd berliz
npm install
```

Configuration lives in `src/environments/environment.ts` (development) and `environment.prod.ts` (production, swapped in automatically by `angular.json`'s `fileReplacements` on a production build) — not a `.env` file. Copy the shape of `environment.ts` if you need to point at a different backend locally.

### Run locally

```bash
ng serve
```

Opens at `http://localhost:4200`, proxying API calls to whatever `environment.api` points at (defaults to a local backend at `http://localhost:8080`).

### Build

```bash
ng build                    # development build
ng build --configuration=production   # production build, used by Netlify
```

Output goes to `dist/berliz/`.

### Test

```bash
ng test
```

## Deployment

Netlify builds and deploys automatically on every push to `master` (see `netlify.toml`). Cloudflare sits in front of the custom domain for DNS and SSL. Full details in [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

## Project structure

```text
src/
  app/
    admin/            # Admin-only management screens (users, centers, trainers, content, etc.)
    services/          # HTTP services, auth interceptor, shared business logic
    state/              # NgRx: actions, reducers, effects, selectors
    shared/             # Reusable components, pipes, directives
    models/             # TypeScript interfaces for API data shapes
    utils/              # Framework-agnostic helper functions
    ...                 # Feature areas (trainers/, centers/, categories/, etc.), each
                          # typically paired with an admin/<feature> counterpart
  environments/         # environment.ts / environment.prod.ts — build-time config
  legacy/               # Pre-NgRx state services, kept for reference during migration
angular.json             # Angular CLI / build configuration
netlify.toml              # Netlify build & deploy configuration
docs/                      # Architecture, setup, deployment, roadmap, API, tech stack docs
```

## Further reading

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — how the pieces fit together
- [`docs/SETUP.md`](docs/SETUP.md) — detailed local setup
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — how production deploys work
- [`docs/API.md`](docs/API.md) — backend API reference from the frontend's perspective
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — what's built and what's planned
- [`docs/TECH_STACK.md`](docs/TECH_STACK.md) — every technology in use, and why
