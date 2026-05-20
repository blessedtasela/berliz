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
  selector: 'app-dashboard-activity-chart',
  templateUrl: './dashboard-activity-chart.component.html',
  styleUrls: ['./dashboard-activity-chart.component.css']
})
export class DashboardActivityChartComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input() data: any;

  @ViewChild('activityCanvas', { static: true })
  activityCanvas!: ElementRef<HTMLCanvasElement>;

  private chart!: Chart<'bar', number[], string>;

  ngAfterViewInit() {
    this.tryCreateChart();
  }

  ngOnChanges() {
    this.tryCreateChart();
  }

  private tryCreateChart() {
    if (!this.activityCanvas) return;

    if (this.chart) {
      this.chart.destroy();
    }

    this.createActivityChart();
  }

  private createActivityChart() {
    Chart.register(...registerables);

    const labels = ['Date', 'Days Spent', 'Total Hours', 'Locations', 'Places', 'Log Count'];
    const values = [10, 5, 20, 8, 15, 50];

    this.chart = new Chart<'bar', number[], string>(this.activityCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Activity',
          data: values,
          backgroundColor: 'rgba(220,38,38,0.12)',
          borderColor: 'rgba(220,38,38,1)',
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