import { HttpHeaders } from '@angular/common/http';
import { Component, EventEmitter, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { delay } from 'rxjs';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserService } from 'src/app/services/user.service';
import { genericError, fileValidator } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-update-profile-photo-modal',
  templateUrl: './update-profile-photo-modal.component.html',
  styleUrls: ['./update-profile-photo-modal.component.css']
})
export class UpdateProfilePhotoModalComponent {
  onUpdateProfilePhoto = new EventEmitter();
  UpdateProfilePhotoForm!: FormGroup;
  responseMessage: any;
  invalidForm: boolean = false;
  selectedImage: any;
  profilePhoto: any;

  constructor(private router: Router,
    private userService: UserService,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService,
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<UpdateProfilePhotoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.profilePhoto = this.data.image;
  }

  onImgSelected(event: any): void {
    this.selectedImage = event.target.files[0];
    console.log("onSelectedImage", this.selectedImage)
  }


  ngOnInit(): void {
    this.UpdateProfilePhotoForm = this.fb.group({
      'profilePhoto': ['', [Validators.required, fileValidator]],
      'id': ['', 0],
    })
  }

  submitForm(): void {
    this.ngxService.start();

    console.log("updateProfilePhotoForm", this.UpdateProfilePhotoForm.value)
    console.log("selectedImage", this.selectedImage)

    const requestData = new FormData();
    requestData.append('id', '0');
    requestData.append('profilePhoto', this.selectedImage);

    console.log("requestMap", requestData)

    if (this.UpdateProfilePhotoForm.invalid) {
      this.invalidForm = true
      this.responseMessage = 'Invalid form';
      this.ngxService.stop();

    } else {
      this.userService.updateProfilePhoto(requestData)
        .subscribe(
          (response: any) => {
            this.dialogRef.close();
            this.UpdateProfilePhotoForm.reset();
            this.invalidForm = false;
            this.ngxService.stop();
            this.responseMessage = response?.message;
            this.snackBarService.openSnackBar(this.responseMessage, "");
            this.onUpdateProfilePhoto.emit();
          }, (error: any) => {
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
    this.dialogRef.close('Dialog closed without updating profile photo')
  }

  clear() {
    this.UpdateProfilePhotoForm.reset();
  }
}


