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

import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { loadDashboard } from 'src/app/state/dashboard/dashboard.actions';
import { selectDashboardData } from 'src/app/state/dashboard/dashboard.selectors';

@Component({
  selector: 'app-dashboard-app-analytics',
  templateUrl: './dashboard-app-analytics.component.html',
  styleUrls: ['./dashboard-app-analytics.component.css']
})
export class DashboardAppAnalyticsComponent implements OnInit, OnDestroy {
  @Input() data: any;

  @ViewChild('analyticCanvas', { static: true })
  analyticCanvas!: ElementRef<HTMLCanvasElement>;

  private chart!: Chart<'line', number[], string>;
  private subscriptions: Subscription[] = [];
  private chartCreated = false;

  constructor(
    private store: Store,
    private ngxService: NgxUiLoaderService
  ) { }

  ngOnInit() {
    const sub = this.store.select(selectDashboardData).subscribe((cachedData) => {
      if (cachedData === null) {
        this.fetchDashboardData();
      } else {
        this.data = cachedData;

        if (!this.chartCreated) {
          this.createAnalyticChart();
          this.chartCreated = true;
        }
      }
    });

    this.subscriptions.push(sub);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
    if (this.chart) {
      this.chart.destroy();
    }
  }

  private fetchDashboardData() {
    this.store.dispatch(loadDashboard());
  }

  private createAnalyticChart() {
    if (!this.data) return;

    const labels = Object.keys(this.data);
    const values = Object.values(this.data).map(v => Number(v));

    Chart.register(...registerables);
    if (this.chart) this.chart.destroy();

    this.chart = new Chart<'line', number[], string>(this.analyticCanvas.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Total',
          data: values,
          backgroundColor: 'rgba(220,38,38,0.08)',
          borderColor: 'rgba(220,38,38,1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: 'rgba(220,38,38,1)',
          pointRadius: 4,
          pointHoverRadius: 6
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

  // ⭐ FORCE CHART TO RESIZE WHEN WINDOW RESIZES
  @HostListener('window:resize')
  onResize() {
    if (this.chart) {
      setTimeout(() => {
        this.chart.resize();
      }, 50); // allow grid layout to settle
    }
  }
}