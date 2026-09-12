import { ChangeDetectorRef, Component, EventEmitter, Inject } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, ValidatorFn, AbstractControl, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Categories } from 'src/app/models/categories.interface';
import { Trainers } from 'src/app/models/trainers.interface';
import { Users } from 'src/app/models/users.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TrainerService } from 'src/app/services/trainer.service';
import { selectUser } from 'src/app/state/user/user.selector';
import { genericError } from 'src/validators/form-validators.module';
import { loadActiveCategories } from 'src/app/state/category/category.actions';
import { selectActiveCategories } from 'src/app/state/category/category.selectors';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { take } from 'rxjs';
import { StrapiService } from 'src/app/services/strapi.service';
import { PhotoResponse } from 'src/app/models/Media.interface';
import { MediaOwnerType } from 'src/app/models/Media.enum';

@Component({
  selector: 'app-update-trainer-modal',
  templateUrl: './update-trainer-modal.component.html',
  styleUrls: ['./update-trainer-modal.component.css']
})
export class UpdateTrainerModalComponent {
  onUpdateTrainerEmit = new EventEmitter();
  updateTrainerForm!: FormGroup;
  invalidForm: boolean = false;
  categories: Categories[] = [];
  responseMessage: any;
  selectedPhoto: any;
  trainer!: Trainers;
  selectedCategoriesId: any;
  user!: Users | null;
  previewUrl: string | null = null;
  photoRequest: PhotoResponse | null = null;
  uploadingPhoto: boolean = false;
  imageChangedEvent: any = null;
  croppedImageBlob: Blob | null = null;
  showCropper: boolean = false;

  constructor(private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<UpdateTrainerModalComponent>,
    private ngxService: NgxUiLoaderService,
    private store: Store,
    private snackBarService: SnackBarService,
    private cdr: ChangeDetectorRef,
    private trainerService: TrainerService,
    private strapiService: StrapiService,
    @Inject(MAT_DIALOG_DATA) private data: any) {
    this.trainer = this.data.trainerData;
  }

  ngOnInit(): void {
    this.selectedCategoriesId = this.trainer.categories.map(category => category.id);
    this.previewUrl = this.trainer.photoResponse?.photoUrl || null;
    this.updateTrainerForm = this.formBuilder.group({
      'id': this.trainer?.id,
      'name': new FormControl(this.trainer.name, Validators.compose([Validators.required, Validators.minLength(3)])),
      'motto': new FormControl(this.trainer.motto, Validators.compose([Validators.required, Validators.minLength(10)])),
      'address': new FormControl(this.trainer.address, Validators.compose([Validators.required, Validators.minLength(10)])),
      'experience': new FormControl(this.trainer.experience, Validators.compose([Validators.required, Validators.minLength(1)])),
      'likes': new FormControl(this.trainer.likes, Validators.compose([Validators.required, Validators.minLength(1)])),
      'categoryIds': this.formBuilder.array(this.selectedCategoriesId, this.validateCheckbox()),
    });

    this.handleEmitEvent();
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  handleEmitEvent() {
    this.store.dispatch(loadActiveCategories());
    this.store.select(selectActiveCategories).subscribe((activeCategories) => {
      this.categories = activeCategories;
    });
    this.store.select(selectUser).subscribe((user) => {
      this.user = user;
    })
  }

  closeDialog() {
    this.dialogRef.close('Dialog closed without completing trainer aplication')
  }

  onPhotoSelected(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;

    this.imageChangedEvent = event;
    this.showCropper = true;
  }

  imageCropped(event: ImageCroppedEvent): void {
    this.croppedImageBlob = event.blob || null;
  }

  loadImageFailed(): void {
    this.snackBarService.openSnackBar('Failed to load image', 'error');
    this.showCropper = false;
    this.imageChangedEvent = null;
  }

  cancelCrop(): void {
    if (this.imageChangedEvent?.target) {
      this.imageChangedEvent.target.value = '';
    }
    this.showCropper = false;
    this.imageChangedEvent = null;
    this.croppedImageBlob = null;
  }

  async confirmCrop(): Promise<void> {
    if (!this.croppedImageBlob) {
      this.snackBarService.openSnackBar('Please crop the image first', 'error');
      return;
    }

    const file = new File([this.croppedImageBlob], `trainer_${Date.now()}.jpeg`, {
      type: this.croppedImageBlob.type || 'image/jpeg'
    });

    this.showCropper = false;
    this.imageChangedEvent = null;
    this.croppedImageBlob = null;

    this.previewUrl = URL.createObjectURL(file);

    try {
      this.uploadingPhoto = true;
      const res = (await this.strapiService.uploadToStrapi(file).pipe(take(1)).toPromise()) ?? [];
      const uploaded = res[0];
      if (!uploaded) {
        throw new Error('No file returned from Strapi');
      }

      this.photoRequest = {
        id: this.trainer.photoResponse?.id ?? 0,
        strapiId: uploaded.id,
        photoUrl: uploaded.url,
        name: uploaded.name,
        mimeType: uploaded.mime,
        byteSize: uploaded.size,
        ownerId: 0,
        mediaOwnerType: MediaOwnerType.TRAINER,
        date: new Date(),
        lastUpdate: new Date(),
      };
    } catch (err: any) {
      this.snackBarService.openSnackBar(err?.error?.message || err?.message || 'Photo upload failed', 'error');
    } finally {
      this.uploadingPhoto = false;
    }
  }

  validateCheckbox(): ValidatorFn {
    return (formArray: AbstractControl) => {
      const checkboxes = formArray.value;
      const isChecked = checkboxes.length > 0;

      return isChecked ? null : { noCheckboxChecked: true };
    };
  }

  onCheckboxChanged(event: any) {
    const categories = this.updateTrainerForm.get('categoryIds') as FormArray;
    const categoryId = Number(event.target.value);

    if (event.target.checked) {
      categories.push(new FormControl(categoryId));
    } else {
      // Remove the control by its value
      const index = categories.controls.findIndex((control) => Number(control.value) === categoryId);
      categories.removeAt(index);
    }
  }

  updateTrainer(): void {
    // TrainerRequest.categoryIds is a List<Integer> on the backend, not a
    // comma-separated string (that's the Center convention, not Trainer's).
    const selectedCategoryIds = this.updateTrainerForm.value.categoryIds.map((id: any) => Number(id));
    const formData = {
      ...this.updateTrainerForm.value,
      categoryIds: selectedCategoryIds,
      ...(this.photoRequest ? { photoRequest: this.photoRequest } : {}),
    };
    if (this.updateTrainerForm.invalid) {
      this.ngxService.start();
      this.invalidForm = true;
      this.responseMessage = "Invalid form. Please complete all sections";
      this.snackBarService.openSnackBar(this.responseMessage, "error");
      this.ngxService.stop();
    } else {
      this.ngxService.start();
      this.trainerService.updateTrainer(formData)
        .subscribe((response: any) => {
          this.updateTrainerForm.reset();
          this.invalidForm = false;
          this.dialogRef.close('Trainer account added successfully');
          this.responseMessage = response?.message;
          this.snackBarService.openSnackBar(this.responseMessage, "");
          this.ngxService.stop();
          this.onUpdateTrainerEmit.emit();
        }, (error: any) => {
          this.ngxService.start();
          console.error("error");
          if (error.error?.message) {
            this.responseMessage = error.error?.message;
          } else {
            this.responseMessage = genericError;
          }
          this.snackBarService.openSnackBar(this.responseMessage, "error");
          this.ngxService.stop();
        })
    }
  }

  clear() {
    this.updateTrainerForm.reset();
    this.showCropper = false;
    this.imageChangedEvent = null;
    this.croppedImageBlob = null;
  }

}
