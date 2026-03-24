import { Component, Input, ElementRef, ViewChild, AfterViewInit, OnDestroy, OnChanges } from '@angular/core';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-dashboard-login-chart',
  templateUrl: './dashboard-login-chart.component.html',
  styleUrls: ['./dashboard-login-chart.component.css']
})
export class DashboardLoginChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() data: any;

  @ViewChild('loginCanvas', { static: true }) loginCanvas!: ElementRef<HTMLCanvasElement>;

  private chart: any;

  ngAfterViewInit() {
    this.tryCreateChart();
  }

  ngOnChanges() {
    this.tryCreateChart();
  }

  private tryCreateChart() {
    if (!this.data || !this.loginCanvas) return;

    if (this.chart) {
      this.chart.destroy();
    }

    this.createLoginChart();
  }

  private createLoginChart() {
    Chart.register(...registerables);

    // Replace with real values if your API provides device stats
    const labels = ['Desktop', 'Android', 'iPhone'];
    const values = [450, 350, 200];

    this.chart = new Chart(this.loginCanvas.nativeElement, {
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
        aspectRatio: 1.5,
        plugins: {
          legend: { display: true }
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}