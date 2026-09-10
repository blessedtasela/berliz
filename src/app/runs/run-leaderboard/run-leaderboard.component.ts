import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { take } from 'rxjs/operators';

import { IconsModule } from 'src/app/icons/icons.module';
import {
  RunLeaderboardEntry,
  RunLeaderboardMetric,
  RunLeaderboardPeriod,
  RunLeaderboardResponse,
} from 'src/app/models/run.interface';
import { RunService } from 'src/app/services/run.service';
import { memoizePhotoUriByKey } from 'src/app/shared/photo-lightbox/photo-data-uri';

const PERIODS: { key: RunLeaderboardPeriod; label: string }[] = [
  { key: 'week', label: 'This week' },
  { key: 'month', label: '30 days' },
  { key: 'year', label: 'This year' },
];

const METRICS: { key: RunLeaderboardMetric; label: string }[] = [
  { key: 'distance', label: 'Distance' },
  { key: 'pace', label: 'Best pace' },
  { key: 'sessions', label: 'Sessions' },
];

/**
 * D6 (scoped) — a run leaderboard among the current user and their accepted
 * connections. Distance / best pace / session count over a period. No GPS
 * traces or segment matching — plain totals from logged runs.
 */
@Component({
  selector: 'app-run-leaderboard',
  standalone: true,
  imports: [CommonModule, RouterModule, IconsModule],
  templateUrl: './run-leaderboard.component.html',
})
export class RunLeaderboardComponent implements OnInit {
  readonly periods = PERIODS;
  readonly metrics = METRICS;

  period: RunLeaderboardPeriod = 'month';
  metric: RunLeaderboardMetric = 'distance';

  data: RunLeaderboardResponse | null = null;
  loading = false;

  constructor(private runService: RunService) {}

  ngOnInit(): void {
    this.load();
  }

  setPeriod(p: RunLeaderboardPeriod): void {
    if (p === this.period) return;
    this.period = p;
    this.load();
  }

  setMetric(m: RunLeaderboardMetric): void {
    if (m === this.metric) return;
    this.metric = m;
    this.load();
  }

  load(): void {
    this.loading = true;
    this.runService.getRunLeaderboard(this.period, this.metric).pipe(take(1)).subscribe({
      next: res => { this.data = res.data; this.loading = false; },
      error: () => { this.data = null; this.loading = false; },
    });
  }

  private readonly _rowUri = memoizePhotoUriByKey();

  photo(entry: RunLeaderboardEntry): string | null {
    return this._rowUri(entry.userId, entry.profilePhoto);
  }

  metricValue(entry: RunLeaderboardEntry): string {
    switch (this.metric) {
      case 'pace':
        return entry.bestPaceMinPerKm != null ? this.formatPace(entry.bestPaceMinPerKm) + ' /km' : '—';
      case 'sessions':
        return entry.runCount + (entry.runCount === 1 ? ' run' : ' runs');
      default:
        return entry.totalDistanceKm + ' km';
    }
  }

  private formatPace(minPerKm: number): string {
    const mins = Math.floor(minPerKm);
    let secs = Math.round((minPerKm - mins) * 60);
    let m = mins;
    if (secs === 60) { m += 1; secs = 0; }
    return `${m}:${secs < 10 ? '0' + secs : secs}`;
  }

  trackByUserId(_: number, e: RunLeaderboardEntry): number {
    return e.userId;
  }
}
