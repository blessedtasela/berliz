import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';

import { Chart, registerables } from 'chart.js/auto';

import { Store } from '@ngrx/store';
import { Subscription as RxSubscription, combineLatest, take } from 'rxjs';

import { Subscriptions } from 'src/app/models/subscriptions.interface';
import { AuthService } from 'src/app/services/auth.service';
import { loadMySubscriptions, loadSubscriptions } from 'src/app/state/subscription/subscription.actions';
import {
  selectMySubscriptions,
  selectSubscriptionLoading,
  selectSubscriptions
} from 'src/app/state/subscription/subscription.selectors';

/**
 * Previously depended entirely on a parent-supplied @Input, which meant the card
 * rendered a chart of zeros before (and often instead of) any real data — and
 * always showed nothing for admins, who have no personal subscriptions.
 * It is now self-sufficient: it dispatches and selects from the subscription
 * store itself — all subscriptions for admins, the signed-in user's own
 * subscriptions for every other role. Bar chart type and styling preserved.
 */
@Component({
  selector: 'app-dashboard-subscription-analytics',
  templateUrl: './dashboard-subscription-analytics.component.html',
  styleUrls: ['./dashboard-subscription-analytics.component.css']
})
export class DashboardSubscriptionAnalyticsComponent implements OnInit, OnDestroy {
  /** Kept for template compatibility with dashboard-main; not the data source. */
  @Input() subscriptions: Subscriptions[] = [];

  total = 0;
  active = 0;
  expired = 0;
  expiringSoon = 0;

  ready = false;
  scopeLabel = 'You';

  @ViewChild('analyticsCanvas', { static: true })
  analyticsCanvas!: ElementRef<HTMLCanvasElement>;

  private chart!: Chart<'bar', number[], string>;
  private subs: RxSubscription[] = [];
  private sawLoading = false;
  private isAdminView = false;

  constructor(
    private store: Store,
    private auth: AuthService
  ) { }

  ngOnInit() {
    this.isAdminView = this.auth.isAdmin();
    this.scopeLabel = this.isAdminView ? 'All users' : 'You';

    this.subs.push(
      combineLatest([this.subscriptions$(), this.store.select(selectSubscriptionLoading)])
        .subscribe(([list, loading]) => {
          if (loading) {
            this.sawLoading = true;
            return;
          }
          // Nothing in flight and nothing cached yet — wait for the real response
          // instead of drawing a chart of zeros.
          if (!this.sawLoading && (list ?? []).length === 0) return;

          this.ready = true;
          this.computeStats(list ?? []);
          this.renderChart();
        })
    );

    this.fetchIfNeeded();
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
    if (this.chart) this.chart.destroy();
  }

  private subscriptions$() {
    return this.isAdminView
      ? this.store.select(selectSubscriptions)
      : this.store.select(selectMySubscriptions);
  }

  /** Only hit the API when the slice is empty and no request is already running. */
  private fetchIfNeeded() {
    combineLatest([this.subscriptions$(), this.store.select(selectSubscriptionLoading)])
      .pipe(take(1))
      .subscribe(([list, loading]) => {
        if (loading || (list ?? []).length > 0) return;
        this.store.dispatch(this.isAdminView ? loadSubscriptions() : loadMySubscriptions());
      });
  }

  private computeStats(list: Subscriptions[]) {
    const now = new Date();

    this.total = list.length;
    this.active = list.filter(s => s.status === 'true').length;
    this.expired = list.filter(s => s.status === 'false').length;

    this.expiringSoon = list.filter(s => {
      if (!s.endDate) return false;
      const end = new Date(s.endDate);
      if (isNaN(end.getTime())) return false;
      const diff = (end.getTime() - now.getTime()) / 86400000;
      return diff > 0 && diff <= 7;
    }).length;
  }

  private renderChart() {
    const labels = ['Active', 'Expiring soon', 'Expired'];
    const values = [this.active, this.expiringSoon, this.expired];

    if (this.chart) {
      this.chart.data.datasets[0].data = values;
      this.chart.update();
      return;
    }

    Chart.register(...registerables);

    this.chart = new Chart<'bar', number[], string>(this.analyticsCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Subscriptions',
          data: values,
          backgroundColor: [
            'rgba(34,197,94,0.12)',
            'rgba(234,179,8,0.12)',
            'rgba(156,163,175,0.12)'
          ],
          borderColor: [
            'rgba(34,197,94,1)',
            'rgba(234,179,8,1)',
            'rgba(156,163,175,1)'
          ],
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
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
            ticks: { font: { size: 11 }, color: '#9ca3af' }
          },
          y: {
            beginAtZero: true,
            border: { display: false },
            grid: { color: 'rgba(0,0,0,0.04)' },
            ticks: { font: { size: 11 }, color: '#9ca3af', stepSize: 1 }
          }
        }
      }
    });
  }

  @HostListener('window:resize')
  onResize() {
    if (this.chart) setTimeout(() => this.chart.resize(), 50);
  }
}
