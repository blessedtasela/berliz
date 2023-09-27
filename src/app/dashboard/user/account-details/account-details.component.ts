import { Component } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserService } from 'src/app/services/user.service';
import { genericError } from 'src/validators/form-validators.module';
import { UpdateUserModalComponent } from '../update-user-modal/update-user-modal.component';
import { UpdateProfilePhotoModalComponent } from '../update-profile-photo-modal/update-profile-photo-modal.component';
import { PromptModalComponent } from '../../../shared/prompt-modal/prompt-modal.component';
import { Users } from 'src/app/models/users.interface';
import { UserDataService } from 'src/app/services/user-data.service';

@Component({
  selector: 'app-account-details',
  templateUrl: './account-details.component.html',
  styleUrls: ['./account-details.component.css']
})
export class AccountDetailsComponent {
  userData!: Users;
  responseMessage: any;
  profilePhoto: any;

  constructor(
    private userService: UserService,
    private router: Router,
    private dialog: MatDialog,
    private userDataService: UserDataService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService) { }

  ngOnInit(): void {
    this.handleEmitEvent();
  }

  handleEmitEvent() {
    this.ngxService.start();
    this.userDataService.getUser().subscribe(() => {
      this.userData = this.userDataService.userData;
      this.profilePhoto = 'data:image/jpeg;base64,' + this.userData.profilePhoto
      this.ngxService.stop()
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

    // Set the event emitter before opening the dialog
    childComponentInstance.onUpdateUser.subscribe(() => {
      this.handleEmitEvent();
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(`Dialog result: ${result}`);
      } else {
        console.log('Dialog closed without updatig account');
      }
    });
  }

  openUpdateProfilePhoto() {
    const dialogRef = this.dialog.open(UpdateProfilePhotoModalComponent, {
      width: '400px',
      data: {
        image: this.profilePhoto
      }
    });
    const childComponentInstance = dialogRef.componentInstance as UpdateProfilePhotoModalComponent;

    // Set the event emitter before opening the dialog
    childComponentInstance.onUpdateProfilePhoto.subscribe(() => {
      this.handleEmitEvent();
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(`Dialog result: ${result}`);
      } else {
        console.log('Dialog closed without updatig profile photo');
      }
    });
  }

  deactivateAccount() {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.data = {
      message: 'deactivate your acount. You won\'t be able to login anymore.' +
        'To activate your account back, please contact berlizworld@gmail.com with your username and request.',
      confirmation: true
    };

    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {

      this.userService.deactivateAccount()
        .subscribe((response: any) => {
          localStorage.removeItem('token')
          this.ngxService.start()
          this.responseMessage = response;
          this.ngxService.stop();
          this.snackbarService.openSnackBar(this.responseMessage, '');
          this.router.navigate(['/home'])
        }, (error) => {
          this.ngxService.stop();
          console.log(error)
          if (error.error?.message) {
            this.responseMessage = error.error?.message;
          } else {
            this.responseMessage = genericError;
          }
          this.snackbarService.openSnackBar(this.responseMessage, 'error');
        });
    });
  }

}
