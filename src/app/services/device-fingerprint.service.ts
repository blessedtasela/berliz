import { Injectable } from '@angular/core';

/**
 * PY-32: a coarse, dependency-free device fingerprint sent on signup and on a TRIAL booking, so
 * the backend can tell "this looks like the same device that already had a trial" apart from a
 * brand-new one. Built entirely from values already on `navigator`/`screen`/`Intl` plus the
 * browser's own Web Crypto API (no fingerprinting library, no new dependency, per PY-32's own
 * scope) -- it is deliberately weak on its own (two identical devices can collide; clearing
 * nothing changes it, since it reads hardware/browser properties rather than stored state) which
 * is exactly why TrialRiskScoring never treats it as more than one input among several. Cached
 * for the life of the tab so it isn't recomputed per request.
 */
@Injectable({
  providedIn: 'root'
})
export class DeviceFingerprintService {
  private cached: string | null = null;

  /** Resolves to a 64-char hex SHA-256 hash, or null if Web Crypto isn't available (very old browser, non-secure context). */
  async get(): Promise<string | null> {
    if (this.cached) return this.cached;
    try {
      const raw = this.rawFingerprint();
      const hash = await this.sha256Hex(raw);
      this.cached = hash;
      return hash;
    } catch {
      // Never let a fingerprinting failure block signup or booking -- it's one input among several, not a gate on its own.
      return null;
    }
  }

  private rawFingerprint(): string {
    const nav = window.navigator;
    const scr = window.screen;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? '';
    return [
      nav.userAgent,
      nav.language,
      nav.platform,
      String(nav.hardwareConcurrency ?? ''),
      String((nav as any).deviceMemory ?? ''),
      `${scr.width}x${scr.height}x${scr.colorDepth}`,
      timezone,
      String(new Date().getTimezoneOffset()),
    ].join('|');
  }

  private async sha256Hex(input: string): Promise<string> {
    const bytes = new TextEncoder().encode(input);
    const digest = await window.crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
}
