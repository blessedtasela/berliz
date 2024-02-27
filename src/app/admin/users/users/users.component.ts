import { Component } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Users } from 'src/app/models/users.interface';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { UserStateService } from 'src/app/services/user-state.service';

@Component({
  selector: 'app-user',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent {
  usersData: Users[] = [];
  totalUsers: number = 0;
  usersLength: number = 0;
  searchComponent: string = 'user'
  isSearch: boolean = true;

  constructor(private ngxService: NgxUiLoaderService,
    private userStateService: UserStateService,
    private rxStompService: RxStompService) {
  }

  ngOnInit(): void {
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
    this.watchActivateAccount()
    this.watchChangePassword()
    this.watchUpdateProfilePhoto()
    this.watchUpdateUser()
    this.watchUpdateUserBio()
    this.watchUpdateUserRole()
    this.watchUpdateUserStatus()
    this.watchGetUserFromMap()
    this.watchResetPassword()
    this.watchDeleteUser()
    this.watchUpdateUserEmail()
  }

  handleEmitEvent() {
    this.userStateService.getAllUsers().subscribe((allUsers) => {
      this.ngxService.start()
      console.log('isCachedData false')
      this.usersData = allUsers;
      this.totalUsers = allUsers.length
      this.usersLength = allUsers.length
      this.userStateService.setAllUsersSubject(this.usersData);
      this.ngxService.stop()
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