import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import jwt_decode from "jwt-decode";
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { loadDashboard } from 'src/app/state/dashboard/dashboard.actions';
import { selectDashboardData, selectDashboardError, selectDashboardLoading } from 'src/app/state/dashboard/dashboard.selectors';

@Component({
    selector: 'app-hub-main',
    templateUrl: './hub-main.component.html',
    styleUrls: ['./hub-main.component.css'],
    standalone: false
})
export class HubMainComponent implements OnInit, OnDestroy {

  @Input() data: any;

  token = localStorage.getItem('token');
  tokenPayload: any;
  userRole: string | null = null;

  /** True while /dashboard/details is in flight -- keeps the empty state from flashing before data arrives. */
  loading = false;
  /** Set when /dashboard/details failed; without this a failed load was indistinguishable from "nothing to show". */
  error: string | null = null;

  private destroy$ = new Subject<void>();

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
    this.store.select(selectDashboardLoading).pipe(takeUntil(this.destroy$)).subscribe(l => this.loading = !!l);
    this.store.select(selectDashboardError).pipe(takeUntil(this.destroy$)).subscribe(e => this.error = e);

    this.store.select(selectDashboardData).pipe(takeUntil(this.destroy$)).subscribe(cached => {
      if (!cached) {
        this.fetchDashboard();
      } else {
        this.data = cached;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private fetchDashboard() {
    this.store.dispatch(loadDashboard());
  }

  retry(): void {
    this.fetchDashboard();
  }

  formatUrl(name: string): string {
    return name.replace(/\s+/g, '-').toLowerCase();
  }
}
