import { Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js/auto';
import { Subscriptions } from 'src/app/models/subscriptions.interface';

@Component({
  selector: 'app-dashboard-subscription-analytics',
  templateUrl: './dashboard-subscription-analytics.component.html',
  styleUrls: ['./dashboard-subscription-analytics.component.css']
})
export class DashboardSubscriptionAnalyticsComponent {
 @Input() subscriptions: Subscriptions[] = [];

  total = 0;
  active = 0;
  expired = 0;
  expiringSoon = 0;

  @ViewChild('analyticsCanvas', { static: true })
  analyticsCanvas!: ElementRef<HTMLCanvasElement>;

  private chart!: Chart<'bar', number[], string>;

  ngOnChanges() {
    this.computeStats();
    this.tryCreateChart();
  }

  ngAfterViewInit() {
    this.tryCreateChart();
  }

  private computeStats() {
    const now = new Date();

    this.total = this.subscriptions.length;
    this.active = this.subscriptions.filter(s => s.status === 'true').length;
    this.expired = this.subscriptions.filter(s => s.status === 'false').length;

    this.expiringSoon = this.subscriptions.filter(s => {
      if (!s.endDate) return false;
      const end = new Date(s.endDate);
      const diff = (end.getTime() - now.getTime()) / 86400000;
      return diff > 0 && diff <= 7;
    }).length;
  }

  private tryCreateChart() {
    if (!this.analyticsCanvas) return;

    if (this.chart) this.chart.destroy();

    this.createChart();
  }

  private createChart() {
    Chart.register(...registerables);

    const labels = ['Active', 'Expiring Soon', 'Expired'];
    const values = [this.active, this.expiringSoon, this.expired];

    this.chart = new Chart<'bar', number[], string>(this.analyticsCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Subscriptions',
            data: values,
            backgroundColor: [
              'rgba(34, 197, 94, 0.4)',   // green
              'rgba(234, 179, 8, 0.4)',   // yellow
              'rgba(107, 114, 128, 0.4)'  // gray
            ],
            borderColor: [
              'rgba(34, 197, 94, 1)',
              'rgba(234, 179, 8, 1)',
              'rgba(107, 114, 128, 1)'
            ],
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }

  @HostListener('window:resize')
  onResize() {
    if (this.chart) setTimeout(() => this.chart.resize(), 50);
  }

  ngOnDestroy() {
    if (this.chart) this.chart.destroy();
  }
}
