import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { Users } from 'src/app/models/users.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { selectUsers, selectUserLoading } from 'src/app/state/user/user.selector';
import { loadAllUsers } from 'src/app/state/user/user.actions';
import { memoizePhotoUriByKey } from 'src/app/shared/photo-lightbox/photo-data-uri';

@Component({
    selector: 'app-dashboard-top-users',
    templateUrl: './dashboard-top-users.component.html',
    styleUrls: ['./dashboard-top-users.component.css'],
    standalone: false
})
export class DashboardTopUsersComponent implements OnInit, OnDestroy {
  users: Users[] = [];
  /** GN-72: this widget used to show "0 total / No users yet" the instant it rendered, before
   *  loadAllUsers() had actually resolved -- true loading state, not just an empty array, so the
   *  template can tell "still loading" apart from "genuinely no users" (same GN-58/GN-60 fix
   *  pattern already used elsewhere for exactly this class of false-empty-state bug). Starts true:
   *  this component always has a fetch in flight the instant it's created. */
  loading = true;
  responseMessage: any;
  showFullData: boolean = false;
  subscriptions: Subscription[] = []

  constructor(private store: Store,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private dialog: MatDialog,
    private datePipe: DatePipe,
    private router: Router) { }

  private readonly _rowUri = memoizePhotoUriByKey();

  photoSrc(user: Users): string {
    return this._rowUri(user.id, user.profilePhoto) ?? '../../../assets/icons/user.png';
  }

  goToProfile(user: Users): void {
    this.router.navigate(['/user', user.id]);
  }

  ngOnInit(): void {
    this.handleEmitEvent()
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => (sub.unsubscribe()))
  }

  handleEmitEvent() {
    this.store.dispatch(loadAllUsers());
    this.subscriptions.push(
      this.store.select(selectUsers).subscribe((users) => {
        this.users = users;
      }),
      this.store.select(selectUserLoading).subscribe((loading) => {
        this.loading = loading;
      }),
    );
  }

  formatDate(dateString: any): string {
    const date = new Date(dateString);
    return date.toDateString();
  }

}


