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

    const labels = ['Date', 'Days Spent', 'Total Hours', 'Locations Visited', 'Places Explored', 'Log Count'];
    const values = [10, 5, 20, 8, 15, 50];

    this.chart = new Chart<'bar', number[], string>(this.activityCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Activity Log',
            data: values,
            backgroundColor: 'rgba(54, 162, 235, 0.4)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,   // ⭐ IMPORTANT
        plugins: {
          legend: { display: true }
        },
        scales: {
          y: {
            beginAtZero: true,
            suggestedMax: Math.max(...values) + 5
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