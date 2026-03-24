import { Component, Input, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-dashboard-activity-chart',
  templateUrl: './dashboard-activity-chart.component.html',
  styleUrls: ['./dashboard-activity-chart.component.css']
})
export class DashboardActivityChartComponent implements AfterViewInit, OnDestroy {
  @Input() data: any;

  @ViewChild('activityCanvas', { static: true }) activityCanvas!: ElementRef<HTMLCanvasElement>;

  private chart: any;

  ngAfterViewInit() {
    this.tryCreateChart();
  }

  ngOnChanges() {
    this.tryCreateChart();
  }

  private tryCreateChart() {
    if (!this.data || !this.activityCanvas) return;

    if (this.chart) {
      this.chart.destroy();
    }

    this.createActivityChart();
  }

  private createActivityChart() {
    const labels = ['Date', 'Days Spent', 'Total Hours', 'Locations Visited', 'Places Explored', 'Log Count'];
    const values = [10, 5, 20, 8, 15, 50]; // Replace with real data if needed

    Chart.register(...registerables);

    this.chart = new Chart(this.activityCanvas.nativeElement, {
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