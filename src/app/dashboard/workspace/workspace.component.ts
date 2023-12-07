import { Component } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { DashboardStateService } from 'src/app/services/dashboard-state.service';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.css']
})
export class WorkspaceComponent {
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

