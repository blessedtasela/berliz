import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { WeeklySlot, WeeklySubscription } from 'src/app/models/weekly-subscription.model';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { WeeklySubscriptionService } from 'src/app/services/weekly-subscription.service';

export const WEEKDAYS = [
  { value: 1, label: 'Monday' }, { value: 2, label: 'Tuesday' }, { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' }, { value: 5, label: 'Friday' }, { value: 6, label: 'Saturday' }, { value: 7, label: 'Sunday' },
];

/**
 * Weekly fixed-time subscriptions, for both sides: the client picks the weekdays and times (or the trainer does it for them),
 * the sessions are booked and held week after week, and either side can pause, resume or cancel. Dates that could not be booked
 * (outside availability, a holiday, a clash) are listed with why, so nothing is silently lost.
 */
@Component({
  selector: 'app-weekly-subscriptions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './weekly-subscriptions.component.html'
})
export class WeeklySubscriptionsComponent implements OnInit {

  readonly weekdays = WEEKDAYS;
  loading = true;
  subs: WeeklySubscription[] = [];
  /** The slot rows being edited, per subscription. */
  editing: Record<number, WeeklySlot[]> = {};
  busyId: number | null = null;
  errors: Record<number, string> = {};
  focusId: number | null = null;

  constructor(private weekly: WeeklySubscriptionService, private snackBar: SnackBarService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.queryParamMap.get('id'));
    this.focusId = Number.isFinite(id) && id > 0 ? id : null;
    this.load();
  }

  load(): void {
    this.loading = true;
    this.weekly.mine().subscribe({
      next: r => {
        this.subs = [...(r.data ?? [])].sort((a, b) => (a.subscriptionId === this.focusId ? -1 : b.subscriptionId === this.focusId ? 1 : 0));
        for (const s of this.subs) if (s.needsSchedule && !this.editing[s.subscriptionId]) this.startEdit(s);
        this.loading = false;
      },
      error: () => { this.subs = []; this.loading = false; }
    });
  }

  isActive(s: WeeklySubscription): boolean {
    return s.status === 'true';
  }

  dayLabel(day: number): string {
    return WEEKDAYS.find(d => d.value === day)?.label ?? '';
  }

  startEdit(s: WeeklySubscription): void {
    const rows: WeeklySlot[] = s.slots.length
      ? s.slots.map(x => ({ dayOfWeek: x.dayOfWeek, time: x.time }))
      : Array.from({ length: s.sessionsPerWeek }, (_, i) => ({ dayOfWeek: (i * 2) % 7 + 1, time: '18:00' }));
    this.editing[s.subscriptionId] = rows;
  }

  cancelEdit(s: WeeklySubscription): void {
    delete this.editing[s.subscriptionId];
    delete this.errors[s.subscriptionId];
  }

  /** The same message the server would give, caught early so the person fixes it before sending. */
  problem(s: WeeklySubscription): string {
    const rows = this.editing[s.subscriptionId] ?? [];
    if (rows.length !== s.sessionsPerWeek) return `Pick exactly ${s.sessionsPerWeek} weekly time${s.sessionsPerWeek === 1 ? '' : 's'}.`;
    const seen = new Set<string>();
    for (const r of rows) {
      if (!/^([01]?\d|2[0-3]):[0-5]\d$/.test(r.time || '')) return 'Pick a start time for every slot.';
      const key = `${r.dayOfWeek}:${r.time}`;
      if (seen.has(key)) return 'Two of the weekly times are the same.';
      seen.add(key);
    }
    return '';
  }

  save(s: WeeklySubscription): void {
    const msg = this.problem(s);
    if (msg) { this.errors[s.subscriptionId] = msg; return; }
    this.run(s, this.weekly.setSchedule(s.subscriptionId, this.editing[s.subscriptionId]), () => this.cancelEdit(s));
  }

  pause(s: WeeklySubscription): void {
    this.run(s, this.weekly.pause(s.subscriptionId));
  }

  resume(s: WeeklySubscription): void {
    this.run(s, this.weekly.resume(s.subscriptionId));
  }

  cancel(s: WeeklySubscription): void {
    if (!window.confirm('Cancel this subscription? It stops renewing and your upcoming sessions are released (sessions starting within the free-cancel window stay booked).')) return;
    this.run(s, this.weekly.cancel(s.subscriptionId));
  }

  private run(s: WeeklySubscription, call: import('rxjs').Observable<{ message?: string; data: WeeklySubscription }>, done?: () => void): void {
    this.busyId = s.subscriptionId;
    delete this.errors[s.subscriptionId];
    call.subscribe({
      next: r => {
        this.busyId = null;
        if (r.message) this.snackBar.openSnackBar(r.message, '');
        done?.();
        this.load();
      },
      error: err => {
        this.busyId = null;
        this.errors[s.subscriptionId] = err?.error?.message || 'Something went wrong, try again.';
      }
    });
  }
}
