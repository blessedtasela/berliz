import { Component, EventEmitter, Output } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ChangePasswordModalComponent } from 'src/app/dashboard/user/change-password-modal/change-password-modal.component';
import { UpdateProfilePhotoModalComponent } from 'src/app/dashboard/user/update-profile-photo-modal/update-profile-photo-modal.component';
import { UpdateUserModalComponent } from 'src/app/dashboard/user/update-user-modal/update-user-modal.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserStateService } from 'src/app/services/user-state.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  @Output() isMenuOpen = new EventEmitter<boolean>();
  userData: any;
  profileOpen: boolean = false;
  responseMessage: any;
  profilePhoto: any;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private userStateService: UserStateService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService) { }

  ngOnInit(): void {
    this.handleEmitEvent();
  }

  handleEmitEvent() {
    this.userStateService.getUser().subscribe((user) => {
      this.userData = user;
      this.profilePhoto = 'data:image/jpeg;base64,' +this.userData.profilePhoto;
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
      localStorage.removeItem('token');
      this.router.navigate(['/login']);
      this.responseMessage = "you have successfully logged out"
      this.snackbarService.openSnackBar(this.responseMessage, '');
    });
  }

  openChangePassword() {
    const dialogRef = this.dialog.open(ChangePasswordModalComponent, {
      width: '400px', data: {
        image: this.profilePhoto
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

}
