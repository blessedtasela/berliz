import { Component, Input, OnInit } from '@angular/core';
import jwt_decode from "jwt-decode";
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { DashboardStateService } from 'src/app/services/dashboard-state.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

@Component({
  selector: 'app-hub-main',
  templateUrl: './hub-main.component.html',
  styleUrls: ['./hub-main.component.css']
})
export class HubMainComponent implements OnInit {

  @Input() data: any;

  token = localStorage.getItem('token');
  tokenPayload: any;
  userRole: string | null = null;

  constructor(
    private loader: NgxUiLoaderService,
    private dashboardState: DashboardStateService,
    private snackbar: SnackBarService
  ) {
    if (this.token) {
      this.tokenPayload = jwt_decode(this.token);
      this.userRole = this.tokenPayload?.role || null;
    }
  }

  ngOnInit(): void {
    this.dashboardState.dashboardData$.subscribe(cached => {
      if (!cached) {
        this.fetchDashboard();
      } else {
        this.data = cached;
      }
    });
  }

  private fetchDashboard() {
    this.dashboardState.getDashBoard().subscribe({

      next: (res) => {
        this.data = res;
        this.dashboardState.setDashboardSubject(res);
      },
      error: () => {
        this.snackbar.openSnackBar('Failed to load dashboard data. Please try again later.', 'error');
      }
    });
  }

  formatUrl(name: string): string {
    return name.replace(/\s+/g, '-').toLowerCase();
  }
}
