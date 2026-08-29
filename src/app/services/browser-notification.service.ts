import { Injectable } from '@angular/core';

export type NotificationCategory = 'message' | 'post' | 'connection';

const ENABLED_KEY = 'browserNotificationsEnabled';
const CATEGORY_KEY_PREFIX = 'browserNotify_';

/** Preference defaults when a category has never been explicitly set. */
const DEFAULT_CATEGORY_ENABLED: Record<NotificationCategory, boolean> = {
  message: true,
  post: true,
  connection: true,
};

/**
 * Native browser Notification API — pops a system notification while this
 * tab (or another tab of the app) is open, even if the tab isn't focused.
 * This is NOT push-when-the-browser-is-closed (that needs a service worker +
 * VAPID keys + a push subscription stored server-side, a materially bigger
 * project) — it only fires for events the app actually observes live over a
 * private per-user STOMP queue: incoming messages
 * (MessageEffects.receiveMessage$, `/user/queue/messages`) and post
 * comments/mentions (PostActivityEffects.receivePostActivity$,
 * `/user/queue/postActivity`). The "connection" category is still just a
 * captured preference with no live stream feeding it yet.
 * Preferences are per-device (localStorage), not synced across devices.
 */
@Injectable({ providedIn: 'root' })
export class BrowserNotificationService {

  get supported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  get permission(): NotificationPermission | 'unsupported' {
    return this.supported ? Notification.permission : 'unsupported';
  }

  get masterEnabled(): boolean {
    try {
      return localStorage.getItem(ENABLED_KEY) === 'true';
    } catch {
      return false;
    }
  }

  setMasterEnabled(enabled: boolean): void {
    try {
      localStorage.setItem(ENABLED_KEY, String(enabled));
    } catch { /* degrade silently */ }
  }

  isCategoryEnabled(category: NotificationCategory): boolean {
    try {
      const raw = localStorage.getItem(CATEGORY_KEY_PREFIX + category);
      return raw === null ? DEFAULT_CATEGORY_ENABLED[category] : raw === 'true';
    } catch {
      return DEFAULT_CATEGORY_ENABLED[category];
    }
  }

  setCategoryEnabled(category: NotificationCategory, enabled: boolean): void {
    try {
      localStorage.setItem(CATEGORY_KEY_PREFIX + category, String(enabled));
    } catch { /* degrade silently */ }
  }

  /** Triggers the browser's own permission prompt. Must be called from a user gesture (a click handler), not on page load. */
  async requestPermission(): Promise<NotificationPermission | 'unsupported'> {
    if (!this.supported) return 'unsupported';
    if (Notification.permission === 'granted' || Notification.permission === 'denied') {
      return Notification.permission;
    }
    return Notification.requestPermission();
  }

  /**
   * Shows a notification if: browser support exists, permission is granted,
   * the master toggle and this category's toggle are both on, and the page
   * is hidden (no point popping a system notification for something already
   * visible on screen).
   */
  notify(category: NotificationCategory, title: string, body: string, onClick?: () => void): void {
    if (!this.supported || Notification.permission !== 'granted') return;
    if (!this.masterEnabled || !this.isCategoryEnabled(category)) return;
    if (document.visibilityState === 'visible') return;

    try {
      const n = new Notification(title, { body, icon: '/assets/berliz-favicon/favicon-32x32.png' });
      if (onClick) {
        n.onclick = () => {
          window.focus();
          onClick();
          n.close();
        };
      }
    } catch { /* some browsers throw if constructed outside a valid context — never break the caller over this */ }
  }
}
