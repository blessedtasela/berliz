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
        datasets: [
          {
            data: values,
            backgroundColor: [
              'limegreen',
              'rgba(63, 67, 71, 0.7)',
              'rgba(220, 38, 38, 0.7)'
            ],
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,   // ⭐ IMPORTANT
        plugins: {
          legend: { display: true }
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