import { Component, OnInit } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { DashboardStateService } from 'src/app/services/dashboard-state.service';
import jwt_decode from "jwt-decode";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit{
  data: any;

  constructor(private ngxService: NgxUiLoaderService,
    private dashboardStateService: DashboardStateService) { }

  ngOnInit() {
    this.dashboardStateService.dashboardData$.subscribe((CachedData) => {
      if (!CachedData) {
        this.handleEmitEvent()
      } else {
        this.data = CachedData;
      }
    })
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
