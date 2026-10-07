import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { Users } from 'src/app/models/users.interface';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { selectUsers } from 'src/app/state/user/user.selector';
import { loadAllUsers, loadUsersFailure, loadUsersSuccess } from 'src/app/state/user/user.actions';
import { watchLoadError } from 'src/app/shared/load-error/load-error-tracker';
import { AdminSearchField } from 'src/app/shared/admin-search/admin-search-field.interface';

@Component({
    selector: 'app-user',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.css'],
    standalone: false
})
export class UsersComponent implements OnDestroy {
  usersData: Users[] = [];
  totalUsers: number = 0;
  usersLength: number = 0;
  searchComponent: string = 'user'
  isSearch: boolean = true;
  /** Why the list couldn't be loaded -- so a failed load never reads as an empty table. */
  loadError: string | null = null;
  private loadErrorSub?: Subscription;

  /** ?userId=<id> from search -- passed through to UserListComponent, which opens that user's details modal once it has loaded. */
  deepLinkUserId: number | null = null;

  readonly selectUsers = selectUsers;
  readonly userSearchFields: AdminSearchField<Users>[] = [
    { value: 'email', label: 'Email', accessor: u => u.email },
    { value: 'name', label: 'Name', accessor: u => `${u.firstname || ''} ${u.lastname || ''}` },
    { value: 'id', label: 'User id', accessor: u => u.id?.toString() },
    { value: 'role', label: 'Role', accessor: u => u.role },
    { value: 'status', label: 'Status', accessor: u => u.status },
  ];

  constructor(private store: Store,
    private route: ActivatedRoute,
    private actions$: Actions,
    private rxStompService: RxStompService) {
  }

  retryLoad(): void {
    this.store.dispatch(loadAllUsers());
  }

  ngOnDestroy(): void {
    this.loadErrorSub?.unsubscribe();
  }

  ngOnInit(): void {
    const raw = this.route.snapshot.queryParamMap.get('userId');
    this.deepLinkUserId = raw ? Number(raw) : null;

    this.loadErrorSub = watchLoadError(this.actions$, loadUsersFailure, [loadAllUsers, loadUsersSuccess], null, m => this.loadError = m);
    this.store.dispatch(loadAllUsers());
    this.handleEmitEvent()
    // this.userStateService.allUsersData$.subscribe((cachedData) => {
    //   if (!cachedData) {
    //     this.handleEmitEvent()
    //   } else {
    //     this.usersData = cachedData;
    //     this.totalUsers = cachedData.length
    //     this.usersLength = cachedData.length
    //   }
    // });
    // this.watchActivateAccount()
    // this.watchChangePassword()
    // this.watchUpdateProfilePhoto()
    // this.watchUpdateUser()
    // this.watchUpdateUserBio()
    // this.watchUpdateUserRole()
    // this.watchUpdateUserStatus()
    // this.watchGetUserFromMap()
    // this.watchResetPassword()
    // this.watchDeleteUser()
    // this.watchUpdateUserEmail()
  }

  handleEmitEvent() {
    this.store.select(selectUsers).subscribe((allUsers) => {
      console.log('isCachedData false')
      this.usersData = allUsers;
      this.totalUsers = allUsers.length
      this.usersLength = allUsers.length
    });
  }

  handleSearchResults(results: Users[]): void {
    this.usersData = results;
    this.totalUsers = results.length;
  }

  watchGetUserFromMap() {
    this.rxStompService.watch('/topic/getUserFromMap').subscribe((message) => {
      this.handleEmitEvent()
    });
  }

  watchChangePassword() {
    this.rxStompService.watch('/topic/changePassword').subscribe((message) => {
      this.handleEmitEvent()
    });
  }

  watchDeleteUser() {
    this.rxStompService.watch('/topic/deleteUser').subscribe((message) => {
      this.handleEmitEvent()
    });
  }

  watchResetPassword() {
    this.rxStompService.watch('/topic/resetPassword').subscribe((message) => {
      this.handleEmitEvent()
    });
  }

  watchActivateAccount() {
    this.rxStompService.watch('/topic/activateAccount').subscribe((message) => {
      this.handleEmitEvent()
    });
  }

  watchUpdateUserStatus() {
    this.rxStompService.watch('/topic/updateUserStatus').subscribe((message) => {
      this.handleEmitEvent()
    });
  }

  watchUpdateUserRole() {
    this.rxStompService.watch('/topic/updateUserRole').subscribe((message) => {
      this.handleEmitEvent()
    });
  }

  watchUpdateUserBio() {
    this.rxStompService.watch('/topic/updateUserBio').subscribe((message) => {
      this.handleEmitEvent()
    });
  }

  watchUpdateUser() {
    this.rxStompService.watch('/topic/updateUser').subscribe((message) => {
      this.handleEmitEvent()
    });
  }

  watchUpdateUserEmail() {
    this.rxStompService.watch('/topic/updateUserEmail').subscribe((message) => {
      this.handleEmitEvent()
    });
  }


  watchUpdateProfilePhoto() {
    this.rxStompService.watch('/topic/updateProfilePhoto').subscribe((message) => {
      this.handleEmitEvent()
    });
  }

}