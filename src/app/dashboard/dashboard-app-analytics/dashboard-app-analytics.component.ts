import { Component } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { DashboardStateService } from 'src/app/services/dashboard-state.service';

@Component({
  selector: 'app-dashboard-app-analytics',
  templateUrl: './dashboard-app-analytics.component.html',
  styleUrls: ['./dashboard-app-analytics.component.css']
})
export class DashboardAppAnalyticsComponent {
  public chart: any;
  public data: any;
  chartCreated: boolean = false;

  constructor(private dashboardStateService: DashboardStateService,
    private ngxService: NgxUiLoaderService) { }

  ngOnInit() {
    this.dashboardStateService.dashboardData$.subscribe((cachedData) => {
      if (cachedData === null) {
        this.handleEmitEvent()
      } else {
        this.data = cachedData;
        if(!this.chartCreated){
        this.createAnalyticChart();
        this.chartCreated = true;
        }
      }
    })
  }

  handleEmitEvent() {
    this.dashboardStateService.getDashBoard().subscribe((data) => {
      this.ngxService.start()
      console.log("isCached false")
      this.data = data
      if (!this.chartCreated) {
        this.createAnalyticChart();
        this.chartCreated = true;
      }
      this.dashboardStateService.setDashboardSubject(this.data);
      this.ngxService.stop()
    })
  }

  createAnalyticChart() {
    if (this.data) {
      const labels = Object.keys(this.data); // Extract category names
      const values = Object.values(this.data); // Extract values
      Chart.register(...registerables);
      this.chart = new Chart("analyticChart", {
        type: 'line', //this denotes tha type of chart

        data: {// values on X-Axis
          labels: labels,
          datasets: [
            {
              label: "Total",
              data: values,
              backgroundColor: 'limegreen'
            }
          ]
        },
        options: {
          aspectRatio: 1.5,
          responsive: true,
        }
      });
    }
    else {
      console.log("data is undefined")
    }
  }

}
