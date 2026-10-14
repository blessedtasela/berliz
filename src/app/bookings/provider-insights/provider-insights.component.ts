import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { IconsModule } from 'src/app/icons/icons.module';
import { ProviderAnalyticsService, ProviderSummary } from 'src/app/services/provider-analytics.service';

/**
 * A provider's last 7 / 30 / 90 days in one glance: how many looked at the profile, how many asked to book,
 * how many of those became sessions, and what was paid. "Insights" tab of the provider bookings screen.
 */
@Component({
  selector: 'app-provider-insights',
  imports: [CommonModule, IconsModule],
  template: `
    <div class="flex flex-col gap-4 font-sans">
      <div class="flex items-center justify-between gap-3">
        <div>
          <h2 class="text-sm font-bold text-gray-900 dark:text-gray-100">How your profile is doing</h2>
          <p class="text-[11px] text-gray-400 dark:text-gray-500">From people looking, to requests, to booked sessions.</p>
        </div>
        <div role="group" aria-label="Time range" class="flex rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shrink-0">
          <button type="button" *ngFor="let d of ranges" (click)="setDays(d)" [attr.aria-pressed]="days === d"
            class="px-3 py-1.5 text-[11px] font-semibold transition"
            [ngClass]="days === d ? 'bg-red-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'">
            {{ d }}d
          </button>
        </div>
      </div>

      <div *ngIf="loading" class="flex items-center justify-center py-10 gap-2 text-gray-400 dark:text-gray-500 text-xs">
        <i-feather name="loader" class="animate-spin" style="width:14px;height:14px;"></i-feather> Loading…
      </div>

      <p *ngIf="failed && !loading" class="text-xs text-red-600">Couldn't load your numbers.
        <button type="button" (click)="load()" class="underline font-semibold">Try again</button></p>

      <ng-container *ngIf="summary && !loading">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div *ngFor="let t of tiles" class="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 px-3 py-3">
            <p class="text-[10px] uppercase tracking-wide font-semibold text-gray-400 dark:text-gray-500">{{ t.label }}</p>
            <p class="text-xl font-extrabold text-gray-900 dark:text-gray-100 leading-tight">{{ t.value }}</p>
            <p *ngIf="t.hint" class="text-[11px] text-gray-400 dark:text-gray-500">{{ t.hint }}</p>
          </div>
        </div>

        <div>
          <p class="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">Profile views per day</p>
          <div *ngIf="bars.length; else noViews" class="flex items-end gap-1 h-24" role="img" [attr.aria-label]="viewsAria">
            <div *ngFor="let b of bars" class="flex-1 min-w-0 flex flex-col justify-end h-full" [title]="b.date + ': ' + b.views + ' views'">
              <div class="w-full rounded-t bg-red-500/80 dark:bg-red-500/70" [style.height.%]="b.percent"></div>
            </div>
          </div>
          <ng-template #noViews>
            <p class="text-xs text-gray-400 dark:text-gray-500 py-4">No profile views yet in this time. Share your profile link to get started.</p>
          </ng-template>
        </div>

        <p *ngIf="summary.requests === 0 && summary.views > 0" class="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900 rounded-xl px-3 py-2.5 flex items-start gap-1.5">
          <i-feather name="info" class="shrink-0 mt-0.5" style="width:12px;height:12px;"></i-feather>
          People are looking but nobody has asked to book. Check your open times, your rate and that your photo and bio are filled in.
        </p>
      </ng-container>
    </div>
  `
})
export class ProviderInsightsComponent implements OnInit {

  readonly ranges = [7, 30, 90];
  days = 30;
  summary: ProviderSummary | null = null;
  loading = false;
  failed = false;

  constructor(private analytics: ProviderAnalyticsService) { }

  ngOnInit(): void {
    this.load();
  }

  setDays(d: number): void {
    if (d === this.days) return;
    this.days = d;
    this.load();
  }

  load(): void {
    this.loading = true;
    this.failed = false;
    this.analytics.summary(this.days).subscribe({
      next: res => {
        this.loading = false;
        this.summary = res?.data ?? null;
        this.failed = !this.summary;
      },
      error: () => {
        this.loading = false;
        this.failed = true;
      }
    });
  }

  get tiles(): { label: string; value: string; hint?: string }[] {
    const s = this.summary;
    if (!s) return [];
    return [
      { label: 'Profile views', value: String(s.views) },
      { label: 'Booking requests', value: String(s.requests), hint: s.requestRatePercent !== null ? `${s.requestRatePercent}% of views` : undefined },
      { label: 'Booked', value: String(s.confirmed + s.completed), hint: s.acceptedPercent !== null ? `${s.acceptedPercent}% of requests` : undefined },
      { label: 'Paid', value: '$' + Number(s.paid ?? 0).toFixed(2), hint: s.cancelled ? `${s.cancelled} cancelled or declined` : undefined },
    ];
  }

  get bars(): { date: string; views: number; percent: number }[] {
    const days = this.summary?.viewsByDay ?? [];
    const max = Math.max(1, ...days.map(d => d.views));
    return days.map(d => ({ date: d.date, views: d.views, percent: Math.max(4, Math.round((d.views / max) * 100)) }));
  }

  get viewsAria(): string {
    return `Profile views per day over the last ${this.days} days, ${this.summary?.views ?? 0} in total`;
  }
}
