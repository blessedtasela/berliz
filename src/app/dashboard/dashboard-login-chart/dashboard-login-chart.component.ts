import {
  Component,
  Input,
  ElementRef,
  ViewChild,
  OnInit,
  OnDestroy,
  HostListener
} from '@angular/core';

import { Chart, registerables } from 'chart.js/auto';

import { Store } from '@ngrx/store';
import { Subscription, combineLatest, take } from 'rxjs';

import { LoginHistoryEntry, LoginStats } from 'src/app/models/analytics.interface';
import { AuthService } from 'src/app/services/auth.service';
import { loadLoginStats, loadMyLoginHistory } from 'src/app/state/analytics/analytics.actions';
import {
  selectAnalyticsLoading,
  selectLoginStats,
  selectMyLoginHistory
} from 'src/app/state/analytics/analytics.selectors';

/** One bucket of the mobile / tablet / desktop split shown under the chart. */
interface DeviceBucket {
  key: string;
  label: string;
  color: string;
  count: number;
  percent: number;
}

/**
 * Real login analytics, backed by the `loginEvent` table the backend now writes
 * one row into on every successful login.
 *
 * Admins see the whole platform (GET /analytics/getLoginStats); every other role
 * sees their own sessions (GET /analytics/getMyLoginHistory) — the stats endpoint
 * is admin-only, and a user's own history answers the same three questions at
 * personal scope.
 *
 * The chart is a 30-day logins-per-day line (a time series, not a composition, so
 * the old doughnut is gone). The device split the product owner asked for lives in
 * the stat row underneath, inside the same card, so the dashboard grid is unchanged.
 */
@Component({
  selector: 'app-dashboard-login-chart',
  templateUrl: './dashboard-login-chart.component.html',
  styleUrls: ['./dashboard-login-chart.component.css']
})
export class DashboardLoginChartComponent implements OnInit, OnDestroy {
  /** Kept for template compatibility with dashboard-main; not the data source. */
  @Input() data: any;

  @ViewChild('loginCanvas', { static: true })
  loginCanvas!: ElementRef<HTMLCanvasElement>;

  ready = false;
  scopeLabel = 'You';

  /** Headline numbers rendered above / below the chart. */
  totalLogins = 0;
  uniqueActiveUsers = 0;
  averageSessionMinutes = 0;
  devices: DeviceBucket[] = [];

  private chart!: Chart<'line', number[], string>;
  private subscriptions: Subscription[] = [];
  private sawLoading = false;
  private isAdminView = false;

  private static readonly DAYS = 30;

  private static readonly DEVICE_META: { key: string; label: string; color: string }[] = [
    { key: 'desktop', label: 'Desktop', color: 'rgba(220,38,38,0.85)' },
    { key: 'mobile', label: 'Mobile', color: 'rgba(17,24,39,0.75)' },
    { key: 'tablet', label: 'Tablet', color: 'rgba(234,179,8,0.85)' },
    { key: 'unknown', label: 'Unknown', color: 'rgba(156,163,175,0.6)' }
  ];

  constructor(
    private store: Store,
    private auth: AuthService
  ) { }

  ngOnInit() {
    this.isAdminView = this.auth.isAdmin();
    this.scopeLabel = this.isAdminView ? 'All users' : 'You';

    this.subscriptions.push(
      combineLatest([
        this.store.select(selectLoginStats),
        this.store.select(selectMyLoginHistory),
        this.store.select(selectAnalyticsLoading)
      ]).subscribe(([stats, history, loading]) => {
        if (loading) {
          this.sawLoading = true;
          return;
        }

        // Nothing in flight and nothing cached yet — wait for the real response
        // instead of drawing an empty chart.
        const hasPayload = this.isAdminView ? !!stats : (history ?? []).length > 0;
        if (!this.sawLoading && !hasPayload) return;

        this.ready = true;
        if (this.isAdminView) {
          this.renderFromStats(stats);
        } else {
          this.renderFromHistory(history ?? []);
        }
      })
    );

    this.fetchIfNeeded();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
    if (this.chart) this.chart.destroy();
  }

  /** Only hit the API when the slice is empty and no request is already running. */
  private fetchIfNeeded() {
    combineLatest([
      this.store.select(selectLoginStats),
      this.store.select(selectMyLoginHistory),
      this.store.select(selectAnalyticsLoading)
    ])
      .pipe(take(1))
      .subscribe(([stats, history, loading]) => {
        if (loading) return;
        if (this.isAdminView) {
          if (stats) return;
          this.store.dispatch(loadLoginStats());
        } else {
          if ((history ?? []).length > 0) return;
          this.store.dispatch(loadMyLoginHistory());
        }
      });
  }

  // ── Admin scope: the aggregated endpoint ────────────────────────────────────

  private renderFromStats(stats: LoginStats | null) {
    if (!stats) {
      this.totalLogins = 0;
      this.uniqueActiveUsers = 0;
      this.averageSessionMinutes = 0;
      this.devices = [];
      this.renderChart([], []);
      return;
    }

    const points = stats.loginsByDay ?? [];
    const labels = points.map(p => this.shortLabel(p.date));
    const values = points.map(p => p.count ?? 0);

    this.totalLogins = stats.totalLogins ?? values.reduce((sum, v) => sum + v, 0);
    this.uniqueActiveUsers = stats.uniqueActiveUsers ?? 0;
    this.averageSessionMinutes = stats.averageSessionMinutes ?? 0;
    this.devices = this.buildDevices(stats.deviceBreakdown ?? {});

    this.renderChart(labels, values);
  }

  // ── Personal scope: the caller's own events, bucketed client-side ───────────

  private renderFromHistory(history: LoginHistoryEntry[]) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const labels: string[] = [];
    const keys: string[] = [];
    for (let i = DashboardLoginChartComponent.DAYS - 1; i >= 0; i--) {
      const day = new Date(today);
      day.setDate(day.getDate() - i);
      labels.push(day.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
      keys.push(this.dayKey(day));
    }

    const counts = new Map<string, number>(keys.map(k => [k, 0]));
    const deviceCounts: Record<string, number> = {};
    let measuredSessions = 0;
    let totalMinutes = 0;

    history.forEach(entry => {
      if (!entry?.loginAt) return;
      const loggedIn = new Date(entry.loginAt);
      if (isNaN(loggedIn.getTime())) return;

      const key = this.dayKey(loggedIn);
      if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);

      const device = (entry.deviceType ?? 'unknown').toLowerCase();
      deviceCounts[device] = (deviceCounts[device] ?? 0) + 1;

      if (entry.durationMinutes != null && entry.durationMinutes >= 0) {
        measuredSessions++;
        totalMinutes += entry.durationMinutes;
      }
    });

    const values = keys.map(k => counts.get(k) ?? 0);

    // History is capped at the 25 most recent events, so the honest headline is
    // what's actually in the window rather than a lifetime total.
    this.totalLogins = values.reduce((sum, v) => sum + v, 0);
    this.uniqueActiveUsers = 0;
    this.averageSessionMinutes = measuredSessions === 0
      ? 0
      : Math.round((totalMinutes * 10) / measuredSessions) / 10;
    this.devices = this.buildDevices(deviceCounts);

    this.renderChart(labels, values);
  }

  // ── Shared rendering ────────────────────────────────────────────────────────

  private buildDevices(breakdown: Record<string, number>): DeviceBucket[] {
    const buckets = DashboardLoginChartComponent.DEVICE_META
      .map(meta => ({ ...meta, count: breakdown[meta.key] ?? 0, percent: 0 }))
      .filter(bucket => bucket.count > 0);

    const total = buckets.reduce((sum, b) => sum + b.count, 0);
    if (total > 0) {
      buckets.forEach(b => b.percent = Math.round((b.count / total) * 100));
    }
    return buckets;
  }

  /** Local-time day key — avoids the UTC shift that toISOString() would introduce. */
  private dayKey(date: Date): string {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  }

  /** "2026-07-09" → "Jul 9", parsed as a local date so the label can't slip a day. */
  private shortLabel(isoDate: string): string {
    const parts = (isoDate ?? '').split('-').map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return isoDate ?? '';
    return new Date(parts[0], parts[1] - 1, parts[2])
      .toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  private renderChart(labels: string[], values: number[]) {
    if (this.chart) {
      this.chart.data.labels = labels;
      this.chart.data.datasets[0].data = values;
      this.chart.update();
      return;
    }

    Chart.register(...registerables);

    this.chart = new Chart<'line', number[], string>(this.loginCanvas.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Logins',
          data: values,
          backgroundColor: 'rgba(220,38,38,0.10)',
          borderColor: 'rgba(220,38,38,1)',
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: 'rgba(220,38,38,1)',
          tension: 0.35,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#111827',
            titleColor: '#f9fafb',
            bodyColor: '#d1d5db',
            padding: 10,
            cornerRadius: 8
          }
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: {
              font: { size: 11 },
              color: '#9ca3af',
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 6
            }
          },
          y: {
            beginAtZero: true,
            border: { display: false },
            grid: { color: 'rgba(0,0,0,0.04)' },
            ticks: { font: { size: 11 }, color: '#9ca3af', stepSize: 1, precision: 0 }
          }
        }
      }
    });
  }

  @HostListener('window:resize')
  onResize() {
    if (this.chart) {
      setTimeout(() => this.chart.resize(), 50);
    }
  }
}
