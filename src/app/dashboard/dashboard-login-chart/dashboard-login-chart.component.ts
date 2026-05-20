import {
  Component,
  Input,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  OnChanges,
  HostListener
} from '@angular/core';

import { Chart, registerables } from 'chart.js/auto';

@Component({
  selector: 'app-dashboard-login-chart',
  templateUrl: './dashboard-login-chart.component.html',
  styleUrls: ['./dashboard-login-chart.component.css']
})
export class DashboardLoginChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() data: any;

  @ViewChild('loginCanvas', { static: true })
  loginCanvas!: ElementRef<HTMLCanvasElement>;

  private chart!: Chart<'doughnut', number[], string>;

  ngAfterViewInit() {
    this.tryCreateChart();
  }

  ngOnChanges() {
    this.tryCreateChart();
  }

  private tryCreateChart() {
    if (!this.loginCanvas) return;

    if (this.chart) {
      this.chart.destroy();
    }

    this.createLoginChart();
  }

  private createLoginChart() {
    Chart.register(...registerables);

    const labels = ['Desktop', 'Android', 'iPhone'];
    const values = [450, 350, 200];

    this.chart = new Chart<'doughnut', number[], string>(this.loginCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: [
            'rgba(220,38,38,0.85)',
            'rgba(17,24,39,0.75)',
            'rgba(156,163,175,0.6)'
          ],
          borderColor: ['#fff', '#fff', '#fff'],
          borderWidth: 2,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              font: { size: 11 },
              color: '#6b7280',
              padding: 16,
              usePointStyle: true,
              pointStyleWidth: 8
            }
          },
          tooltip: {
            backgroundColor: '#111827',
            titleColor: '#f9fafb',
            bodyColor: '#d1d5db',
            padding: 10,
            cornerRadius: 8
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

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}