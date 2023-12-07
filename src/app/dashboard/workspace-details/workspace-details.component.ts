import { Component, Input } from '@angular/core';
import jwt_decode from "jwt-decode";
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { DashboardStateService } from 'src/app/services/dashboard-state.service';

@Component({
  selector: 'app-workspace-details',
  templateUrl: './workspace-details.component.html',
  styleUrls: ['./workspace-details.component.css']
})
export class WorkspaceDetailsComponent {
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


  formatUrl(name: any): any {
    return name.replace(/\s+/g, '-').toLowerCase();
  }

  toggleData() {
    this.showAllData == !this.showAllData;
  }

}
