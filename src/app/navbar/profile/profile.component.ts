import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ChangePasswordModalComponent } from 'src/app/dashboard/user/change-password-modal/change-password-modal.component';
import { UpdateProfilePhotoModalComponent } from 'src/app/dashboard/user/update-profile-photo-modal/update-profile-photo-modal.component';
import { UpdateUserModalComponent } from 'src/app/dashboard/user/update-user-modal/update-user-modal.component';
import { Users } from 'src/app/models/users.interface';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserStateService } from 'src/app/services/user-state.service';
import { UserService } from 'src/app/services/user.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})

export class ProfileComponent {
  @Output() isMenuOpen = new EventEmitter<boolean>();
  userData!: Users;
  profileOpen: boolean = false;
  responseMessage: any;
  @Input() search: boolean = false;

  constructor(
    private userService: UserService,
    private router: Router,
    private dialog: MatDialog,
    private userStateService: UserStateService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private rxStompService: RxStompService) { }

  ngOnInit(): void {
    this.handleEmitEvent();
    this.watchActivateAccount()
    this.watchDeactivateAccount()
    this.watchDeleteUser()
    this.watchUpdateProfilePhoto()
    this.watchUpdateUser()
    this.watchUpdateUserBio()
    this.watchUpdateUserRole()
    this.watchUpdateUserStatus()
  }

  handleEmitEvent() {
    this.userStateService.getUser().subscribe((user) => {
      this.userData = user;
    });
  }

  openUpdateProfilePhoto() {
    const dialogRef = this.dialog.open(UpdateProfilePhotoModalComponent, {
      width: '400px',
      data: {
        user: this.userData
      }
    });
    const childComponentInstance = dialogRef.componentInstance as UpdateProfilePhotoModalComponent;
    childComponentInstance.onUpdateProfilePhoto.subscribe(() => {
      this.ngxService.start();
      this.handleEmitEvent();
      this.ngxService.stop();
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(`Dialog result: ${result}`);
      } else {
        console.log('Dialog closed without updatig profile photo');
      }
    });
  }

  toggleProfile() {
    this.profileOpen = !this.profileOpen;
  }

  logout() {
    console.log('logging out')
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      message: 'Logout',
      confirmation: true
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((response: any) => {
      dialogRef.close();
      this.userService.logout()
      this.responseMessage = "you have successfully logged out"
      this.snackbarService.openSnackBar(this.responseMessage, '');
    });
  }

  openChangePassword() {
    const dialogRef = this.dialog.open(ChangePasswordModalComponent, {
      width: '400px',
      data: {
        user: this.userData
      }
    });
    const childComponentInstance = dialogRef.componentInstance as ChangePasswordModalComponent;
    childComponentInstance.onChangePassword.subscribe(() => {
      this.ngxService.start();
      this.handleEmitEvent();
      this.ngxService.stop();
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(`Dialog result: ${result}`);
      } else {
        console.log('Dialog closed without updatig password');
      }
    });
  }

  openUpdateUser() {
    const dialogRef = this.dialog.open(UpdateUserModalComponent, {
      width: '700px',
      data: {
        userData: this.userData
      }
    });
    const childComponentInstance = dialogRef.componentInstance as UpdateUserModalComponent;
    childComponentInstance.onUpdateUser.subscribe(() => {
      this.ngxService.start();
      this.handleEmitEvent();
      this.ngxService.stop();
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(`Dialog result: ${result}`);
      } else {
        console.log('Dialog closed without updatig account');
      }
    });
  }

  watchActivateAccount() {
    this.rxStompService.watch('/topic/activateAccount').subscribe((message) => {
      const receivedUsers: Users = JSON.parse(message.body);
      if (this.userData.id === receivedUsers.id)
        this.userData = receivedUsers
    });
  }

  watchDeactivateAccount() {
    this.rxStompService.watch('/topic/deactivateAccount').subscribe((message) => {
      const receivedUsers: Users = JSON.parse(message.body);
      if (this.userData.id === receivedUsers.id)
        this.userData = receivedUsers
    });
  }

  watchUpdateUserStatus() {
    this.rxStompService.watch('/topic/updateUserStatus').subscribe((message) => {
      const receivedUsers: Users = JSON.parse(message.body);
      if (this.userData.id === receivedUsers.id)
        this.userData = receivedUsers
    });
  }

  watchUpdateUserRole() {
    this.rxStompService.watch('/topic/updateUserRole').subscribe((message) => {
      const receivedUsers: Users = JSON.parse(message.body);
      if (this.userData.id === receivedUsers.id)
        this.userData = receivedUsers
    });
  }

  watchDeleteUser() {
    this.rxStompService.watch('/topic/deleteUser').subscribe((message) => {
      const receivedUsers: Users = JSON.parse(message.body);
      if (this.userData.id === receivedUsers.id)
        this.userData === null;
    });
  }

  watchUpdateUserBio() {
    this.rxStompService.watch('/topic/updateUserBio').subscribe((message) => {
      const receivedUsers: Users = JSON.parse(message.body);
      if (this.userData.id === receivedUsers.id)
        this.userData = receivedUsers
    });
  }

  watchUpdateUser() {
    this.rxStompService.watch('/topic/updateUser').subscribe((message) => {
      const receivedUsers: Users = JSON.parse(message.body);
      if (this.userData.id === receivedUsers.id)
        this.userData = receivedUsers
    });
  }

  watchUpdateProfilePhoto() {
    this.rxStompService.watch('/topic/updateProfilePhoto').subscribe((message) => {
      const receivedUsers: Users = JSON.parse(message.body);
      if (this.userData.id === receivedUsers.id)
        this.userData = receivedUsers
    });
  }
}
