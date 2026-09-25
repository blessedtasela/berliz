import { Injectable } from '@angular/core';

export type ThemeMode = 'light' | 'dark' | 'system';

const MODE_KEY = 'themeMode';

/**
 * App-wide light/dark theme — per-device (localStorage), same reasoning as
 * NavbarStyleService/NavControlsService: a display preference, not account
 * data worth syncing across devices. Only applies to the authenticated
 * dashboard (AppComponent's `sidebar` layout) — the public marketing site
 * keeps its own permanently-dark brand aesthetic regardless of this
 * setting, same design intent as the mobile app's TrainerDetail/
 * CenterDetail/legal pages, which mirror this split exactly.
 *
 * Tailwind's class-based dark mode (`darkMode: 'class'` in
 * tailwind.config.js) drives everything visual: this service only ever
 * toggles a `dark` class on `<html>`, and every `dark:` utility already in
 * (or added to) a template does the rest — no separate CSS-variable system
 * to maintain.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {

  get mode(): ThemeMode {
    try {
      const raw = localStorage.getItem(MODE_KEY);
      return raw === 'light' || raw === 'dark' || raw === 'system' ? raw : 'system';
    } catch {
      return 'system';
    }
  }

  private get systemPrefersDark(): boolean {
    return typeof window !== 'undefined' && !!window.matchMedia
      && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  /** The actually-rendered mode, with 'system' already resolved against the device setting. */
  get isDark(): boolean {
    const mode = this.mode;
    return mode === 'dark' || (mode === 'system' && this.systemPrefersDark);
  }

  setMode(mode: ThemeMode): void {
    try { localStorage.setItem(MODE_KEY, mode); } catch { /* degrade silently, same as NavbarStyleService */ }
    this.apply();
  }

  /** Applies the current resolved theme to `<html>` — call once on app init
   * (AppComponent's constructor), and again whenever the OS-level scheme
   * changes while mode is 'system' (see watchSystemChanges). A no-op under
   * SSR/prerendering (domino's synthetic `document` tolerates the call, but
   * there's no persisted preference to read there anyway — every
   * prerendered page renders light, same tradeoff AuthService already
   * accepts for "always renders logged out" during prerender). */
  apply(): void {
    try {
      document.documentElement.classList.toggle('dark', this.isDark);
    } catch { /* no DOM (SSR) */ }
  }

  /** Re-applies on every OS-level scheme change while mode is 'system' —
   * matches the mobile app's ThemeContext following useColorScheme() live. */
  watchSystemChanges(): void {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    try {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (this.mode === 'system') this.apply();
      });
    } catch { /* older browsers without addEventListener on MediaQueryList */ }
  }
}
