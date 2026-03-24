import { Component, Input, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { DashboardStateService } from 'src/app/services/dashboard-state.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard-app-analytics',
  templateUrl: './dashboard-app-analytics.component.html',
  styleUrls: ['./dashboard-app-analytics.component.css']
})
export class DashboardAppAnalyticsComponent implements OnInit, OnDestroy {
  @Input() data: any;

  @ViewChild('analyticCanvas', { static: true }) analyticCanvas!: ElementRef<HTMLCanvasElement>;

  private chart!: any;
  private subscriptions: Subscription[] = [];
  private chartCreated = false;

  constructor(
    private dashboardStateService: DashboardStateService,
    private ngxService: NgxUiLoaderService
  ) {}

  ngOnInit() {
    const sub = this.dashboardStateService.dashboardData$.subscribe((cachedData) => {
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
    const sub = this.dashboardStateService.getDashBoard().subscribe((data) => {
      this.ngxService.start();
      this.data = data;
      this.dashboardStateService.setDashboardSubject(data);
      this.ngxService.stop();
    });

    this.subscriptions.push(sub);
  }

  private createAnalyticChart() {
    if (!this.data) return;

    const labels = Object.keys(this.data);
    const values = Object.values(this.data);

    Chart.register(...registerables);

    this.chart = new Chart(this.analyticCanvas.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Total',
            data: values,
            backgroundColor: 'limegreen',
            borderColor: 'limegreen',
            borderWidth: 2,
            tension: 0.3,
            fill: false
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
}