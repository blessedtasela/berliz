import { Component, Input } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserService } from 'src/app/services/user.service';
import { genericError } from 'src/validators/form-validators.module';
import { AdminUpdateUserModalComponent } from '../admin-update-user-modal/admin-update-user-modal.component';
import { Users } from 'src/app/models/users.interface';
import { DatePipe } from '@angular/common';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { UserStateService } from 'src/app/services/user-state.service';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { AdminUpdateUserRoleModalComponent } from '../admin-update-user-role-modal/admin-update-user-role-modal.component';
import { UserDetailsModalComponent } from '../user-details-modal/user-details-modal.component';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent {
  @Input() usersData: Users[] = [];
  responseMessage: any;
  showFullData: boolean = false;
  selectedImage: any;

  constructor(private userStateService: UserStateService,
    private userService: UserService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private dialog: MatDialog,
    private datePipe: DatePipe,
    private rxStompService: RxStompService) {
  }
  ngOnInit(): void {
    this.watchActivateAccount()
    this.watchDeactivateAccount()
    this.watchDeleteUser()
    this.watchGetUserFromMap()
    this.watchUpdateProfilePhoto()
    this.watchUpdateUser()
    this.watchUpdateUserBio()
    this.watchUpdateUserRole()
    this.watchUpdateUserStatus()
  }

  handleEmitEvent() {
    this.userStateService.getAllUsers().subscribe((users) => {
      this.ngxService.start();
      this.usersData = users;
      this.userStateService.setAllUsersSubject(this.usersData);
      this.ngxService.stop();
    });
  }

  toggleData() {
    this.showFullData = !this.showFullData;
  }

  openUpdateUser(id: number) {
    try {
      const user = this.usersData.find(user => user.id === id);
      if (user) {
        const dialogRef = this.dialog.open(AdminUpdateUserModalComponent, {
          width: '900px',
          height: '600px',
          data: {
            userData: user,
          }
        });
        const childComponentInstance = dialogRef.componentInstance as AdminUpdateUserModalComponent;
        childComponentInstance.onUpdateUserEmit.subscribe(() => {
          this.handleEmitEvent();
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            console.log(`Dialog result: ${result}`);
          } else {
            console.log('Dialog closed without adding a category');
          }
        });
      } else {
        this.snackbarService.openSnackBar('User not found for id: ' + id, 'error');
      }
    } catch (error) {
      this.snackbarService.openSnackBar("An error occurred. Check user status", 'error');
    }
  }

  openUpdateUserRole(id: number) {
    try {
      const user = this.usersData.find(user => user.id === id);
      if (user) {
        const dialogRef = this.dialog.open(AdminUpdateUserRoleModalComponent, {
          width: '400px',
          data: {
            userData: user,
          }
        });
        const childComponentInstance = dialogRef.componentInstance as AdminUpdateUserRoleModalComponent;
        childComponentInstance.onUpdateUserRole.subscribe(() => {
          this.handleEmitEvent();
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            console.log(`Dialog result: ${result}`);
          } else {
            console.log('Dialog closed without updatig user\'s role');
          }
        });
      } else {
        this.snackbarService.openSnackBar('User not found for id: ' + id, 'error');
      }
    } catch (error) {
      this.snackbarService.openSnackBar("An error occurred. Check user status", 'error');
    }
  }


  onImgSelected(event: any, id: number): void {
    const selectedImage = event.target.files[0];
    if (selectedImage) {
      this.selectedImage = selectedImage;
      this.updatePhoto(id);
    }
  }

  updatePhoto(id: number): void {
    this.ngxService.start();
    const requestData = new FormData();
    requestData.append('profilePhoto', this.selectedImage);
    requestData.append('id', id.toString());
    this.userService.updateProfilePhoto(requestData)
      .subscribe(
        (response: any) => {
          this.ngxService.stop();
          this.responseMessage = response?.message;
          this.snackbarService.openSnackBar(this.responseMessage, "");
          this.handleEmitEvent()
        }, (error: any) => {
          this.ngxService.stop();
          console.error("error");
          if (error.error?.message) {
            this.responseMessage = error.error?.message;
          } else {
            this.responseMessage = genericError;
          }
          this.snackbarService.openSnackBar(this.responseMessage, 'error');
        });
    this.snackbarService.openSnackBar(this.responseMessage, "error");
  }

  updateUserStatus(id: number) {
    const dialogConfig = new MatDialogConfig();
    const user = this.usersData.find(user => user.id === id);
    const message = user?.status === 'false'
      ? 'activate this user\'s account?'
      : 'deactivate this user\'s account?';

    dialogConfig.data = {
      message: message,
      confirmation: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
      this.ngxService.start();
      this.userService.updateStatus(id)
        .subscribe((response: any) => {
          this.ngxService.stop();
          dialogRef.close('User status updated succesfully')
          this.responseMessage = response.message;
          this.snackbarService.openSnackBar(this.responseMessage, '');
          this.handleEmitEvent();
        }, (error) => {
          this.ngxService.stop();
          this.snackbarService.openSnackBar(error, 'error');
          if (error.error?.message) {
            this.responseMessage = error.error?.message;
          } else {
            this.responseMessage = genericError;
          }
          this.snackbarService.openSnackBar(this.responseMessage, 'error');
        });
    });
  }

  openUserDetails(id: number) {
    const user = this.usersData.find(user => user.id === id);
    const dialogRef = this.dialog.open(UserDetailsModalComponent, {
      width: '800px',
      data: {
        userData: user,
        photo: 'data:image/jpeg;base64,' + user?.profilePhoto.photo
      },
      panelClass: 'mat-dialog-height',
    });
    const childComponentInstance = dialogRef.componentInstance as UserDetailsModalComponent;
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(`Dialog result: ${result}`);
      } else {
        console.log('Dialog closed without any action');
      }
    });
  }

  deleteUser(id: number) {
    const user = this.usersData.find(user => user.id === id);
    const dialogConfig = new MatDialogConfig();
    const message = "delete this user. This is irreversible.";

    dialogConfig.data = {
      message: message,
      confirmation: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
      this.ngxService.start();
      this.userService.deleteUser(id)
        .subscribe((response: any) => {
          this.ngxService.stop();
          this.responseMessage = response.message;
          this.snackbarService.openSnackBar(this.responseMessage, '');
          this.handleEmitEvent();
        }, (error) => {
          this.ngxService.stop();
          this.snackbarService.openSnackBar(error, 'error');
          if (error.error?.message) {
            this.responseMessage = error.error?.message;
          } else {
            this.responseMessage = genericError;
          }
          this.snackbarService.openSnackBar(this.responseMessage, 'error');
        });
    });
  }

  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }


  watchGetUserFromMap() {
    this.rxStompService.watch('/topic/getUserFromMap').subscribe((message) => {
      const receivedUsers: Users = JSON.parse(message.body);
      this.usersData.push(receivedUsers);
    });
  }

  watchActivateAccount() {
    this.rxStompService.watch('/topic/activateAccount').subscribe((message) => {
      const receivedUsers: Users = JSON.parse(message.body);
      const userId = this.usersData.findIndex(users => users.id === receivedUsers.id)
      this.usersData[userId] = receivedUsers
    });
  }

  watchDeactivateAccount() {
    this.rxStompService.watch('/topic/deactivateAccount').subscribe((message) => {
      const receivedUsers: Users = JSON.parse(message.body);
      const userId = this.usersData.findIndex(Users => Users.id === receivedUsers.id)
      this.usersData[userId] = receivedUsers
    });
  }

  watchUpdateUserStatus() {
    this.rxStompService.watch('/topic/updateUserStatus').subscribe((message) => {
      const receivedUsers: Users = JSON.parse(message.body);
      const userId = this.usersData.findIndex(Users => Users.id === receivedUsers.id)
      this.usersData[userId] = receivedUsers
    });
  }

  watchUpdateUserRole() {
    this.rxStompService.watch('/topic/updateUserRole').subscribe((message) => {
      const receivedUsers: Users = JSON.parse(message.body);
      const userId = this.usersData.findIndex(Users => Users.id === receivedUsers.id)
      this.usersData[userId] = receivedUsers
    });
  }

  watchDeleteUser() {
    this.rxStompService.watch('/topic/deleteUser').subscribe((message) => {
      const receivedUsers: Users = JSON.parse(message.body);
      this.usersData = this.usersData.filter(Users => Users.id !== receivedUsers.id);
    });
  }

  watchUpdateUserBio() {
    this.rxStompService.watch('/topic/updateUserBio').subscribe((message) => {
      const receivedUsers: Users = JSON.parse(message.body);
      const userId = this.usersData.findIndex(Users => Users.id === receivedUsers.id)
      this.usersData[userId] = receivedUsers
    });
  }

  watchUpdateUser() {
    this.rxStompService.watch('/topic/updateUser').subscribe((message) => {
      const receivedUsers: Users = JSON.parse(message.body);
      const userId = this.usersData.findIndex(Users => Users.id === receivedUsers.id)
      this.usersData[userId] = receivedUsers
    });
  }

  watchUpdateProfilePhoto() {
    this.rxStompService.watch('/topic/updateProfilePhoto').subscribe((message) => {
      const receivedUsers: Users = JSON.parse(message.body);
      const userId = this.usersData.findIndex(Users => Users.id === receivedUsers.id)
      this.usersData[userId] = receivedUsers
    });
  }

}