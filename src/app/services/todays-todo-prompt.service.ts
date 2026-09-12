import { Injectable } from '@angular/core';

export type TodaysTodoPromptFrequency = 'daily' | 'morning' | 'off';

const FREQUENCY_KEY = 'todaysTodoPromptFrequency';
/** Local time hour before which "morning" mode still shows the prompt (exclusive upper bound). */
const MORNING_CUTOFF_HOUR = 11;

/**
 * How often DashboardMainComponent's "what are you doing today" popup is
 * allowed to show. Per-device (localStorage), same reasoning as
 * NavbarStyleService -- a nag-frequency preference, not account data worth
 * syncing across devices.
 *
 * Default is 'daily' (unchanged from before this setting existed: once per
 * calendar day, any time, skipped entirely if a task's already due today --
 * see DashboardMainComponent.evaluateTodaysTodoPopup) so nobody's experience
 * silently changes underneath them. 'morning' is the closer fit for what the
 * prompt is actually asking ("what are you doing TODAY" reads oddly at
 * 4pm) -- worth recommending, not worth forcing.
 */
@Injectable({ providedIn: 'root' })
export class TodaysTodoPromptService {

  get frequency(): TodaysTodoPromptFrequency {
    try {
      const raw = localStorage.getItem(FREQUENCY_KEY);
      return raw === 'morning' || raw === 'off' ? raw : 'daily';
    } catch {
      return 'daily';
    }
  }

  setFrequency(frequency: TodaysTodoPromptFrequency): void {
    try { localStorage.setItem(FREQUENCY_KEY, frequency); } catch { /* degrade silently */ }
  }

  /** Whether the popup may show right now, purely on the frequency rule -- callers still layer their own once-per-day/has-a-task-today checks on top. */
  isAllowedNow(now: Date = new Date()): boolean {
    switch (this.frequency) {
      case 'off': return false;
      case 'morning': return now.getHours() < MORNING_CUTOFF_HOUR;
      default: return true;
    }
  }
}
