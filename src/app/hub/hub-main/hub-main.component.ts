import { Component, Input, OnInit } from '@angular/core';
import jwt_decode from "jwt-decode";
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Store } from '@ngrx/store';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { loadDashboard } from 'src/app/state/dashboard/dashboard.actions';
import { selectDashboardData } from 'src/app/state/dashboard/dashboard.selectors';

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
    private store: Store,
    private snackbar: SnackBarService
  ) {
    if (this.token) {
      this.tokenPayload = jwt_decode(this.token);
      this.userRole = this.tokenPayload?.role || null;
    }
  }

  ngOnInit(): void {
    this.store.select(selectDashboardData).subscribe(cached => {
      if (!cached) {
        this.fetchDashboard();
      } else {
        this.data = cached;
      }
    });
  }

  private fetchDashboard() {
    this.store.dispatch(loadDashboard());
  }

  formatUrl(name: string): string {
    return name.replace(/\s+/g, '-').toLowerCase();
  }
}
