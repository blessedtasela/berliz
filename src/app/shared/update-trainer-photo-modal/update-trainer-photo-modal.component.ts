import { Component, EventEmitter, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { UpdateProfilePhotoModalComponent } from 'src/app/dashboard/user/update-profile-photo-modal/update-profile-photo-modal.component';
import { Trainers } from 'src/app/models/trainers.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TrainerService } from 'src/app/services/trainer.service';
import { fileValidator, genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-update-trainer-photo-modal',
  templateUrl: './update-trainer-photo-modal.component.html',
  styleUrls: ['./update-trainer-photo-modal.component.css']
})
export class UpdateTrainerPhotoModalComponent {
  onUpdatePhotoEmit = new EventEmitter();
  updateTrainerPhotoForm!: FormGroup;
  responseMessage: any;
  invalidForm: boolean = false;
  selectedImage: any;
  trainer: Trainers;

  constructor(private trainerService: TrainerService,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService,
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<UpdateTrainerPhotoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.trainer = this.data.trainerData;
  }

  onImgSelected(event: any): void {
    this.selectedImage = event.target.files[0];
    console.log("onSelectedImage", this.selectedImage)
  }


  ngOnInit(): void {
    this.updateTrainerPhotoForm = this.fb.group({
      'photo': ['', [Validators.required, fileValidator]],
      'id': [ this.trainer.id],
    })
  }

  submitForm(): void {
    this.ngxService.start();
    const requestData = new FormData();
    requestData.append('id', this.updateTrainerPhotoForm.get('id')?.value);
    requestData.append('photo', this.selectedImage);

    if (this.updateTrainerPhotoForm.invalid) {
      this.invalidForm = true
      this.responseMessage = 'Invalid form';
      this.ngxService.stop();

    } else {
      this.trainerService.updatePhoto(requestData)
        .subscribe(
          (response: any) => {
            this.dialogRef.close();
            this.updateTrainerPhotoForm.reset();
            this.invalidForm = false;
            this.ngxService.stop();
            this.responseMessage = response?.message;
            this.snackBarService.openSnackBar(this.responseMessage, "");
            this.onUpdatePhotoEmit.emit();
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
    this.updateTrainerPhotoForm.reset();
  }
}
