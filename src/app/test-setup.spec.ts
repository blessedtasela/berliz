import { getTestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';

/**
 * Frontend CI (Nov 21-22, 2026): every push failed because of this. `MockStore.overrideSelector()`
 * (and `provideMockStore({ selectors: [...] })`) calls `selector.setResult(value)` directly on the
 * real, module-level `createSelector`/`createFeatureSelector` function -- the same singleton every
 * spec file imports -- not on anything scoped to that test's own TestBed (see
 * `node_modules/@ngrx/store/fesm2022/ngrx-store-testing.mjs`). Left un-reset, an override from one
 * spec file sticks to that selector for the rest of the Karma process and silently breaks every
 * later test (in ANY file, run order permitting) that reads the same selector through its own,
 * non-overriding store -- e.g. `dashboard-top-users.component.spec.ts` overriding `selectUsers`
 * permanently poisoned it for `users.component.spec.ts`, which runs later in the same suite.
 *
 * `src/test.ts` is NOT the fix for this: Angular 16's `@angular-devkit/build-angular:karma` builder
 * auto-bootstraps the test environment and globs `src/**\/*.spec.ts` directly, so `test.ts` (despite
 * being listed in tsconfig.spec.json's `files`) is never actually loaded into the Karma bundle --
 * confirmed by a console.log there that never fires. This file matches the real glob, so its
 * top-level `afterEach` (registered before Jasmine starts running any spec) applies globally,
 * releasing every MockStore override after every test regardless of which file set it.
 */
afterEach(() => {
  try {
    getTestBed().inject(MockStore, null)?.resetSelectors();
  } catch {
    // Nothing to reset: this spec never provided a MockStore, or the TestBed is already torn down.
  }
});
