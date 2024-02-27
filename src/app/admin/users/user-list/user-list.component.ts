import { Component, Input } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserService } from 'src/app/services/user.service';
import { dataURItoBlob, genericError } from 'src/validators/form-validators.module';
import { AdminUpdateUserModalComponent } from '../admin-update-user-modal/admin-update-user-modal.component';
import { Users } from 'src/app/models/users.interface';
import { DatePipe } from '@angular/common';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { UserStateService } from 'src/app/services/user-state.service';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { AdminUpdateUserRoleModalComponent } from '../admin-update-user-role-modal/admin-update-user-role-modal.component';
import { UserDetailsModalComponent } from '../user-details-modal/user-details-modal.component';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { UpdateEmailModalComponent } from 'src/app/dashboard/user/update-email-modal/update-email-modal.component';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent {
  @Input() usersData: Users[] = [];
  responseMessage: any;
  showFullData: boolean = false;
  imageChangedEvent: any = '';
  croppedImage: any = '';
  showCropper: boolean = false;
  updatePhotoId: number = 0;

  constructor(private userStateService: UserStateService,
    private userService: UserService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private dialog: MatDialog,
    private datePipe: DatePipe,
    private rxStompService: RxStompService) {
  }

  ngOnInit(): void {
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
          disableClose: true,
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
          width: '500px',
          height: '300px',
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
      this.imageChangedEvent = event;
      this.showCropper = true;
      this.updatePhotoId = id;
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
    this.updatePhotoId = 0;
  }

  updatePhoto(): void {
    this.ngxService.start();
    const id = this.updatePhotoId;
    const photo = this.croppedImage;
    const requestData = new FormData();
    requestData.append('profilePhoto', photo);
    requestData.append('id', id.toString());
    this.userService.updateProfilePhoto(requestData)
      .subscribe(
        (response: any) => {
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
    this.snackbarService.openSnackBar(this.responseMessage, "error");
  }

  removePhoto(id: number): void {
    const user = this.usersData.find(user => user.id === id);
    const dialogConfig = new MatDialogConfig();
    const message = "remove profile photo for this user? - " + user?.email;
    dialogConfig.data = {
      message: message,
      confirmation: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
      this.ngxService.start();
      this.userService.removePhoto(id)
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

  openUpdateEmail(id: number) {
    const user = this.usersData.find(user => user.id === id);
    const dialogRef = this.dialog.open(UpdateEmailModalComponent, {
      width: '600px',
      height: '400px',
      disableClose: true,
      data: {
        userData: user,
      }
    });
    const childComponentInstance = dialogRef.componentInstance as UpdateEmailModalComponent;
    childComponentInstance.onUpdateEMail.subscribe(() => {
      this.handleEmitEvent();
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(`Dialog result: ${result}`);
      } else {
        console.log('Dialog closed without adding a category');
      }
    });
  }

  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }

}