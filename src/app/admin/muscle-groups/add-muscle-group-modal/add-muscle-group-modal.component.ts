import { ChangeDetectorRef, Component, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription, take } from 'rxjs';
import { Exercises } from 'src/app/models/exercise.interface';
import { BodyParts } from 'src/app/models/muscle-groups.interface';
import { MuscleGroupService } from 'src/app/services/muscle-group.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { genericError } from 'src/validators/form-validators.module';
import { ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
  selector: 'app-add-muscle-group-modal',
  templateUrl: './add-muscle-group-modal.component.html',
  styleUrls: ['./add-muscle-group-modal.component.css']
})
export class AddMuscleGroupModalComponent {
  onAddMuscleGroupEmit = new EventEmitter()
  addMuscleGroupForm!: FormGroup;
  invalidForm: boolean = false;
  responseMessage: any;
  selectedImage: any;
  subscription = new Subscription;
  bodyParts: BodyParts[] = [];
  displayPhoto: any = "../../../assets/icons/user.png";
  imageChangedEvent: any = null;
  croppedImageBlob: Blob | null = null;
  showCropper: boolean = false;

  constructor(private formBuilder: FormBuilder,
    private muscleGroupService: MuscleGroupService,
    public dialogRef: MatDialogRef<AddMuscleGroupModalComponent>,
    private ngxService: NgxUiLoaderService,
    private cd: ChangeDetectorRef,
    private snackbarService: SnackBarService) {
    this.bodyParts = this.muscleGroupService.getBodyParts();
  }

  ngOnInit(): void {
    this.addMuscleGroupForm = this.formBuilder.group({
      'name': ['', [Validators.required, Validators.minLength(2)]],
      'bodyPart': ['', [Validators.required, Validators.minLength(2)]],
      'image': ['', [Validators.required, Validators.minLength(2)]],
      'description': ['', [Validators.required, Validators.minLength(20)]],
    });
  }

  ngOnDestroy() {
  }

  onImgSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.imageChangedEvent = event;
      this.showCropper = true;
    }
  }

  imageCropped(event: ImageCroppedEvent): void {
    this.croppedImageBlob = event.blob || null;
  }

  loadImageFailed(): void {
    this.snackbarService.openSnackBar('Failed to load image', 'error');
    this.showCropper = false;
    this.imageChangedEvent = null;
  }

  cancelCrop(): void {
    if (this.imageChangedEvent?.target) {
      this.imageChangedEvent.target.value = '';
    }
    this.addMuscleGroupForm.patchValue({ image: '' });
    this.showCropper = false;
    this.imageChangedEvent = null;
    this.croppedImageBlob = null;
  }

  confirmCrop(): void {
    if (!this.croppedImageBlob) {
      this.snackbarService.openSnackBar('Please crop the image first', 'error');
      return;
    }

    const file = new File([this.croppedImageBlob], `muscle-group_${Date.now()}.jpeg`, {
      type: this.croppedImageBlob.type || 'image/jpeg'
    });

    this.selectedImage = file;
    this.displayPhoto = URL.createObjectURL(file);

    this.showCropper = false;
    this.imageChangedEvent = null;
    this.croppedImageBlob = null;
  }

  addMuscleGroup(): void {
    this.ngxService.start();
    if (this.addMuscleGroupForm.invalid) {
      this.invalidForm = true
      this.responseMessage = "Invalid form"
      this.snackbarService.openSnackBar(this.responseMessage, "error");
      this.ngxService.stop();
    } else {
      const requestData = new FormData();
      requestData.append('name', this.addMuscleGroupForm.get('name')?.value);
      requestData.append('bodyPart', this.addMuscleGroupForm.get('bodyPart')?.value);
      requestData.append('description', this.addMuscleGroupForm.get('description')?.value);
      requestData.append('image', this.selectedImage);
      this.muscleGroupService.addMuscleGroup(requestData)
        .subscribe((response: any) => {
          this.onAddMuscleGroupEmit.emit();
          this.addMuscleGroupForm.reset();
          this.invalidForm = false;
          this.dialogRef.close('muscleGroup added successfully');
          this.responseMessage = response?.message;
          this.snackbarService.openSnackBar(this.responseMessage, "");
          this.ngxService.stop();
        }, (error: any) => {
          this.ngxService.stop();
          console.error("error");
          if (error.error?.message) {
            this.responseMessage = error.error?.message;
          } else {
            this.responseMessage = genericError;
          }
          this.snackbarService.openSnackBar(this.responseMessage, "error");
        });
    }
  }

  closeDialog() {
    this.dialogRef.close('Dialog closed without adding a muscleGroup');
  }

  clear() {
    this.addMuscleGroupForm.reset();
    this.selectedImage = null;
    this.displayPhoto = "../../../assets/icons/user.png";
    this.showCropper = false;
    this.imageChangedEvent = null;
    this.croppedImageBlob = null;
  }


}


