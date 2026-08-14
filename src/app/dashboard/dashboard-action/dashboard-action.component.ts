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

  /**
   * Dashboard keys whose natural `/dashboard/<key>` path is not where the user
   * should actually land. Everything else falls back to `/dashboard/<key>`.
   */
  private readonly ROUTE_OVERRIDES: Record<string, string> = {
    // No admin CRUD table for equipment — it's center-scoped and managed from
    // "My equipment" on /dashboard/exercises, so point at the public browser.
    'equipments': '/services/equipment',
    'workouts': '/dashboard/workouts',
    'my-workouts': '/dashboard/workouts',
    'liked-trainers': '/trainers',
    // No dedicated "my testimonials" page exists (a user has at most one
    // testimonial); the merged Programs/testimonials page is the sensible landing spot.
    'my-testimonials': '/services',
  };

  resolveRoute(key: any): string {
    const slug = this.formatUrl(key);
    return this.ROUTE_OVERRIDES[slug] ?? '/dashboard/' + slug;
  }

  toggleData() {
    this.showAllData == !this.showAllData;
  }

}

