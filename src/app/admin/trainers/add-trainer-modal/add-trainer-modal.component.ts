import { ChangeDetectorRef, Component, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl, FormArray } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Categories } from 'src/app/models/categories.interface';
import { Partner } from 'src/app/models/partners.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TrainerService } from 'src/app/services/trainer.service';
import { fileValidator, genericError } from 'src/validators/form-validators.module';
import { Store } from '@ngrx/store';
import { loadActivePartners } from 'src/app/state/partner/partner.actions';
import { selectActivePartners } from 'src/app/state/partner/partner.selectors';
import { loadActiveCategories } from 'src/app/state/category/category.actions';
import { selectActiveCategories } from 'src/app/state/category/category.selectors';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { take } from 'rxjs';
import { StrapiService } from 'src/app/services/strapi.service';
import { PhotoResponse } from 'src/app/models/Media.interface';
import { MediaOwnerType } from 'src/app/models/Media.enum';

@Component({
  selector: 'app-add-trainer-modal',
  templateUrl: './add-trainer-modal.component.html',
  styleUrls: ['./add-trainer-modal.component.css']
})
export class AddTrainerModalComponent {
  onAddTrainerEmit = new EventEmitter();
  addTrainerForm!: FormGroup;
  invalidForm: boolean = false;
  categories: Categories[] = [];
  responseMessage: any;
  selectedPhoto: any;
  activePartners: Partner[] = [];
  displayPhoto: any = "../../../assets/icons/user.png";
  imageChangedEvent: any = null;
  croppedImageBlob: Blob | null = null;
  showCropper: boolean = false;
  photoRequest: PhotoResponse | null = null;
  uploadingPhoto: boolean = false;

  constructor(private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<AddTrainerModalComponent>,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService,
    private cdr: ChangeDetectorRef,
    private trainerService: TrainerService,
    private strapiService: StrapiService,
    private store: Store) { }


  ngOnInit(): void {
    this.addTrainerForm = this.formBuilder.group({
      'id': ['', Validators.compose([Validators.required, Validators.minLength(1)])],
      'name': ['', Validators.compose([Validators.required, Validators.minLength(3)])],
      'motto': ['', Validators.compose([Validators.required, Validators.minLength(10)])],
      'address': ['', Validators.compose([Validators.required, Validators.minLength(10)])],
      'experience': ['', Validators.compose([Validators.required, Validators.minLength(1)])],
      'photo': ['', Validators.compose([Validators.required, fileValidator])],
      'categoryIds': this.formBuilder.array([], this.validateCheckbox()),
    });

    this.onEmit();
  }


  onEmit(): void {
    this.store.dispatch(loadActiveCategories());
    this.store.select(selectActiveCategories).subscribe((activeCategories) => {
      this.categories = activeCategories;
    });
    this.store.dispatch(loadActivePartners());
    this.store.select(selectActivePartners).subscribe((activePartners) => {
      this.activePartners = activePartners;
    });
  }


  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }


  closeDialog() {
    this.dialogRef.close('Dialog closed without completing trainer aplication')
  }

  onPhotoSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.imageChangedEvent = event;
      this.showCropper = true;
    }
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
    this.addTrainerForm.patchValue({ photo: '' });
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

    this.selectedPhoto = file;
    this.displayPhoto = URL.createObjectURL(file);

    this.showCropper = false;
    this.imageChangedEvent = null;
    this.croppedImageBlob = null;

    try {
      this.uploadingPhoto = true;
      const res = (await this.strapiService.uploadToStrapi(file).pipe(take(1)).toPromise()) ?? [];
      const uploaded = res[0];
      if (!uploaded) {
        throw new Error('No file returned from Strapi');
      }

      this.photoRequest = {
        id: 0,
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
    const categories = this.addTrainerForm.get('categoryIds') as FormArray;
    const categoryId = Number(event.target.value);

    if (event.target.checked) {
      categories.push(this.formBuilder.group({ categoryIds: categoryId }));
    } else {
      // Remove the control by its value
      const index = categories.controls.findIndex((control) => control.value.categoryIds === categoryId);
      categories.removeAt(index);
    }
  }

  addTrainer(): void {
    // TrainerRequest.categoryIds is a List<Integer> on the backend, not a
    // comma-separated string (that's the Center convention, not Trainer's).
    const selectedCategoryIds = this.addTrainerForm.value.categoryIds.map((categories: any) => categories.categoryIds);

    if (this.addTrainerForm.invalid || !this.photoRequest) {
      this.ngxService.start();
      this.invalidForm = true;
      this.responseMessage = this.photoRequest ? "Invalid form. Please complete all sections" : "Please select a photo";
      this.snackBarService.openSnackBar(this.responseMessage, "error");
      this.ngxService.stop();
    } else {
      this.ngxService.start();
      const requestData = {
        partnerId: this.addTrainerForm.get('id')?.value,
        name: this.addTrainerForm.get('name')?.value,
        motto: this.addTrainerForm.get('motto')?.value,
        address: this.addTrainerForm.get('address')?.value,
        experience: this.addTrainerForm.get('experience')?.value,
        categoryIds: selectedCategoryIds,
        photoRequest: this.photoRequest,
      };
      this.trainerService.addTrainer(requestData)
        .subscribe((response: any) => {
          this.addTrainerForm.reset();
          this.invalidForm = false;
          this.dialogRef.close('Trainer account added successfully');
          this.responseMessage = response?.message;
          this.snackBarService.openSnackBar(this.responseMessage, "");
          this.ngxService.stop();
          this.onAddTrainerEmit.emit();
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
    this.addTrainerForm.reset();
    this.selectedPhoto = null;
    this.displayPhoto = "../../../assets/icons/user.png";
    this.photoRequest = null;
    this.showCropper = false;
    this.imageChangedEvent = null;
    this.croppedImageBlob = null;
  }
}
