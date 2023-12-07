import { Component } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { DashboardStateService } from 'src/app/services/dashboard-state.service';

@Component({
  selector: 'app-dashboard-activity-chart',
  templateUrl: './dashboard-activity-chart.component.html',
  styleUrls: ['./dashboard-activity-chart.component.css']
})
export class DashboardActivityChartComponent {
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
      const labels = Object.keys(this.data);
      const values = Object.values(this.data);
      Chart.register(...registerables);
      this.chart = new Chart("activityChart", {
        type: 'bar', //this denotes tha type of chart
        data: {// values on X-Axis
          labels: ['Date', 'Days Spent', 'Total Hours', 'Locations Visited', 'Places Explored', 'Log Count'],
          datasets: [
            {
              label: 'Activity Log',
              data: [10, 5, 20, 8, 15, 50], // Sample numeric data
              backgroundColor: 'rgba(54, 162, 235, 0.2)', // Blue color
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1,
            },
          ],
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
