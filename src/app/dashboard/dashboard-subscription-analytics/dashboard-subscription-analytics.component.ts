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

    const labels = ['Active', 'Expiring soon', 'Expired'];
    const values = [this.active, this.expiringSoon, this.expired];

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

  ngOnDestroy() {
    if (this.chart) this.chart.destroy();
  }
}
