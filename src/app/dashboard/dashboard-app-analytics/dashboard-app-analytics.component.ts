import { Component, Input } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { DashboardStateService } from 'src/app/services/dashboard-state.service';

@Component({
  selector: 'app-dashboard-app-analytics',
  templateUrl: './dashboard-app-analytics.component.html',
  styleUrls: ['./dashboard-app-analytics.component.css']
})
export class DashboardAppAnalyticsComponent {
  @Input() public chart: any;
  @Input() public data: any;

  constructor(private dashboardStateService: DashboardStateService,
    private ngxService: NgxUiLoaderService) { }

  ngOnInit() {
    // this.dashboardStateService.dashboardData$.subscribe((cachedData) => {
    //   if (cachedData === null) {
    //     this.handleEmitEvent()
    //   } else {
    //     this.data = cachedData;
    //     if(!this.chartCreated){
    //     this.createAnalyticChart();
    //     this.chartCreated = true;
    //     }
    //   }
    // })
  }

  handleEmitEvent() {
    this.dashboardStateService.getDashBoard().subscribe((data) => {
      this.ngxService.start()
      console.log("isCached false")
      this.data = data
      this.dashboardStateService.setDashboardSubject(this.data);
      this.ngxService.stop()
    })
  }



}
