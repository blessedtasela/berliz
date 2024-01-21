import { Component, Input } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { DashboardStateService } from 'src/app/services/dashboard-state.service';
import jwt_decode from "jwt-decode";

@Component({
  selector: 'app-dashboard-action',
  templateUrl: './dashboard-action.component.html',
  styleUrls: ['./dashboard-action.component.css']
})
export class DashboardActionComponent {
  @Input() data: any;
  responseMessage: any;
  showAllData: boolean = false;
  token: any = localStorage.getItem('token')
  tokenPayload: any
  userRole: any

  constructor(private ngxService: NgxUiLoaderService,
    private dashboardStateService: DashboardStateService) {
    this.tokenPayload = jwt_decode(this.token);
    this.userRole = this.tokenPayload?.role
  }

  ngOnInit(): void {
    // this.dashboardStateService.dashboardData$.subscribe((CachedData) => {
    //   if (!CachedData) {
    //     this.handleEmitEvent()
    //   } else {
    //     this.data = CachedData;
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


  formatUrl(name: any): any {
    return name.replace(/\s+/g, '-').toLowerCase();
  }

  toggleData() {
    this.showAllData == !this.showAllData;
  }

}

