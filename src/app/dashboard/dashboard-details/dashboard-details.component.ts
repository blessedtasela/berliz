import { Component, OnInit } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import jwt_decode from "jwt-decode";
import { DashboardStateService } from 'src/app/services/dashboard-state.service';

@Component({
  selector: 'app-dashboard-details',
  templateUrl: './dashboard-details.component.html',
  styleUrls: ['./dashboard-details.component.css']
})
export class DashboardDetailsComponent implements OnInit {
  data: any;
  responseMessage: any;
  allData: any;
  token: any = localStorage.getItem('token')
  tokenPayload: any
  userRole: any

  constructor(private ngxService: NgxUiLoaderService,
    private dashboardStateService: DashboardStateService) {
    this.tokenPayload = jwt_decode(this.token);
    this.userRole = this.tokenPayload?.role
  }


  formatUrl(name: any): any {
    return name.replace(/\s+/g, '-').toLowerCase();
  }

  ngOnInit(): void {
    this.dashboardStateService.dashboardData$.subscribe((CachedData) => {
      if (!CachedData) {
        this.handleEmitEvent()
      } else {
        this.data = CachedData;
      }
    })
  }

  showAllData() {
    this.allData == !this.allData;
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
