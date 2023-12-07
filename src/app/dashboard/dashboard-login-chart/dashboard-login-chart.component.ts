import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { DashboardStateService } from 'src/app/services/dashboard-state.service';

@Component({
  selector: 'app-dashboard-login-chart',
  templateUrl: './dashboard-login-chart.component.html',
  styleUrls: ['./dashboard-login-chart.component.css']
})


export class DashboardLoginChartComponent {
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
        if (!this.chartCreated) {
          this.createLogDeviceChart();
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
        this.createLogDeviceChart();
        this.chartCreated = true;
      }
      this.dashboardStateService.setDashboardSubject(this.data);
      this.ngxService.stop()
    })
  }

  createLogDeviceChart() {
    if (this.data) {
      const labels = Object.keys(this.data);
      const values = Object.values(this.data);
      Chart.register(...registerables);
      Chart.register(...registerables);
      this.chart = new Chart("loggedDevice", {
        type: 'doughnut',
        data: {
          labels: ['Desktop', 'Andriod', 'Iphone'],
          datasets: [{
            data: [450, 350, 200],
            backgroundColor: [
              'limegreen',
              'rgba(63, 67, 71, 0.7)', // Gray-950 
              'rgba(220, 38, 38, 0.7)', // Red-600 with
            ],
          }]
        },
        options: {
          aspectRatio: 1.5,
        }
      });
    } else {
      console.log("data is null")
    }
  }

}
