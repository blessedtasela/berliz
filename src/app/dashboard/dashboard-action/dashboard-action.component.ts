import { Component, Input } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import jwt_decode from "jwt-decode";
import { Store } from '@ngrx/store';
import { loadDashboard } from 'src/app/state/dashboard/dashboard.actions';
import { selectDashboardData } from 'src/app/state/dashboard/dashboard.selectors';

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
   private store: Store
) {
    this.tokenPayload = jwt_decode(this.token);
    this.userRole = this.tokenPayload?.role
  }

  ngOnInit(): void {
    this.store.select(selectDashboardData).subscribe((data) => {
      if (!data) {
        this.handleEmitEvent()
      } else {
        this.data = data;
      }
    })
  }

  handleEmitEvent() {
    this.store.dispatch(loadDashboard());
  }


  formatUrl(name: any): any {
    return name.replace(/\s+/g, '-').toLowerCase();
  }

  toggleData() {
    this.showAllData == !this.showAllData;
  }

}

