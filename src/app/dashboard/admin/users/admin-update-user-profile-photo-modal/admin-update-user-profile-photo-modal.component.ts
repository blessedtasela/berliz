import { Component, EventEmitter, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { UpdateProfilePhotoModalComponent } from 'src/app/dashboard/user/update-profile-photo-modal/update-profile-photo-modal.component';
import { Users } from 'src/app/models/users.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserService } from 'src/app/services/user.service';
import { fileValidator, genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-admin-update-user-profile-photo-modal',
  templateUrl: './admin-update-user-profile-photo-modal.component.html',
  styleUrls: ['./admin-update-user-profile-photo-modal.component.css']
})
export class AdminUpdateUserProfilePhotoModalComponent {
  onUpdateUserProfilePhoto = new EventEmitter();
  UpdateProfilePhotoForm!: FormGroup;
  responseMessage: any;
  invalidForm: boolean = false;
  selectedImage: any;
  id: any;
  photo: any;

  constructor(private userService: UserService,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService,
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<UpdateProfilePhotoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.id = this.data.id;
    this.photo = this.data.photo;
  }

  onImgSelected(event: any): void {
    this.selectedImage = event.target.files[0];
    console.log("onSelectedImage", this.selectedImage)
  }


  ngOnInit(): void {
    this.UpdateProfilePhotoForm = this.formBuilder.group({
      'id': new FormControl(this.id, Validators.required),
      'profilePhoto': ['', [Validators.required, fileValidator]],
    })
  }

  updateProfilePhoto(): void {
    this.ngxService.start();
    const id = this.id;
    const requestData = new FormData();
    requestData.append('id', id);
    requestData.append('profilePhoto', this.selectedImage);

    if (this.UpdateProfilePhotoForm.invalid) {
      this.invalidForm = true
      this.responseMessage = 'Invalid form';
      this.ngxService.stop();
    } else {
      this.userService.updateProfilePhoto(requestData)
        .subscribe(
          (response: any) => {
            this.dialogRef.close('User\'s profile photo updated successfully');
            this.UpdateProfilePhotoForm.reset();
            this.invalidForm = false;
            this.ngxService.stop();
            this.responseMessage = response?.message;
            this.snackBarService.openSnackBar(this.responseMessage, "");
          this.onUpdateUserProfilePhoto.emit();
          }
          , (error: any) => {
            this.ngxService.stop();
            console.error("error");
            if (error.error?.message) {
              this.responseMessage = error.error?.message;
            } else {
              this.responseMessage = genericError;
            }
            this.snackBarService.openSnackBar(this.responseMessage, 'error');
          });
    }
    this.snackBarService.openSnackBar(this.responseMessage, "error");
  }

  closeDialog() {
    this.dialogRef.close('Dialog closed without updating user\'s profile photo')
  }

  clear() {
    this.UpdateProfilePhotoForm.reset();
  }
}