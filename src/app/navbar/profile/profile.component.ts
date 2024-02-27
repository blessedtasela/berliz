import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ChangePasswordModalComponent } from 'src/app/dashboard/user/change-password-modal/change-password-modal.component';
import { UpdateUserModalComponent } from 'src/app/dashboard/user/update-user-modal/update-user-modal.component';
import { Users } from 'src/app/models/users.interface';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserStateService } from 'src/app/services/user-state.service';
import { UserService } from 'src/app/services/user.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})

export class ProfileComponent {
  @Output() isMenuOpen = new EventEmitter<boolean>();
  @Input() userData!: Users;
  profileOpen: boolean = false;
  responseMessage: any;
  @Input() search: boolean = false;
  imageChangedEvent: any = '';
  croppedImage: any = '';
  showCropper: boolean = false;

  constructor(
    private userService: UserService,
    private router: Router,
    private dialog: MatDialog,
    private userStateService: UserStateService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private rxStompService: RxStompService) { }

  ngOnInit(): void {
    this.subscribeToCloseProfileOnClick()
    this.subscribeToCloseProfileOnMouseDown()
    this.subscribeToCloseProfileOnScroll()
  }

  handleEmitEvent() {
    this.userStateService.getUser().subscribe((user) => {
      this.userData = user;
      this.userStateService.setUserSubject(user);
    });
  }

  subscribeToCloseProfileOnClick() {
    document.addEventListener('click', (event) => {
      if (!this.isClickInsideDropdown(event)) {
        this.closeDropdown();
      }
    });
  }

  subscribeToCloseProfileOnMouseDown() {
    document.addEventListener('mousedown', (event) => {
      if (!this.isClickInsideDropdown(event)) {
        this.closeDropdown();
      }
    });
  }

  subscribeToCloseProfileOnScroll() {
    document.addEventListener('scroll', (event) => {
      if (!this.isClickInsideDropdown(event)) {
        this.closeDropdown();
      }
    });
  }

  isClickInsideDropdown(event: Event): any {
    const dropdownElement = document.getElementById('profileDropdown');
    return dropdownElement && dropdownElement.contains(event.target as Node);
  }

  closeDropdown() {
    this.profileOpen = false;
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }

  onImgSelected(event: any): void {
    const selectedImage = event.target.files[0];
    if (selectedImage) {
      this.imageChangedEvent = event;
      this.showCropper = true;
    }
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.blob;
  }

  imageLoaded() {
    // This method is called when the image is loaded in the cropper
    // You can perform any actions you need when the image is loaded, such as displaying the cropper
  }

  cropperReady() {
    // This method is called when the cropper is ready
    // You can perform any actions you need when the cropper is ready
  }

  loadImageFailed() {
    // This method is called if there is an error loading the image in the cropper
    // You can handle the error and display a message to the user
  }

  cancelUpload() {
    this.showCropper = false;
  }

  updatePhoto(): void {
    this.ngxService.start();
    const id = this.userData.id;
    const photo = this.croppedImage;
    const requestData = new FormData();
    requestData.append('profilePhoto', photo);
    requestData.append('id', id.toString());
    this.userService.updateProfilePhoto(requestData)
      .subscribe((response: any) => {
        this.ngxService.stop();
        this.responseMessage = response?.message;
        this.snackbarService.openSnackBar(this.responseMessage, "");
        this.showCropper = false;
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
  }

  removePhoto(): void {
    const user = this.userData;
    const dialogConfig = new MatDialogConfig();
    const message = "remove profile photo for this user? - " + user?.email;
    dialogConfig.data = {
      message: message,
      confirmation: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
      this.ngxService.start();
      this.userService.removePhoto(this.userData.id)
        .subscribe(
          (response: any) => {
            this.ngxService.stop();
            this.responseMessage = response?.message;
            this.snackbarService.openSnackBar(this.responseMessage, "");
            dialogRef.close('Profile photo removed succesfully')
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

}
