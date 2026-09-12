import { ChangeDetectorRef, Component, EventEmitter, Inject } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, ValidatorFn, AbstractControl, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription, take } from 'rxjs';
import { Categories } from 'src/app/models/categories.interface';
import { Centers } from 'src/app/models/centers.interface';
import { CenterService } from 'src/app/services/center.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { genericError } from 'src/validators/form-validators.module';
import { Users } from 'src/app/models/users.interface';
import { Store } from '@ngrx/store';
import { selectUser } from 'src/app/state/user/user.selector';
import { loadActiveCategories } from 'src/app/state/category/category.actions';
import { selectActiveCategories } from 'src/app/state/category/category.selectors';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { StrapiService } from 'src/app/services/strapi.service';
import { PhotoResponse } from 'src/app/models/Media.interface';
import { MediaOwnerType } from 'src/app/models/Media.enum';

@Component({
  selector: 'app-update-center-modal',
  templateUrl: './update-center-modal.component.html',
  styleUrls: ['./update-center-modal.component.css']
})
export class UpdateCenterModalComponent {
  onUpdateCenterEmit = new EventEmitter();
  updateCenterForm!: FormGroup;
  invalidForm: boolean = false;
  categories: Categories[] = [];
  responseMessage: any;
  selectedPhoto: any;
  center!: Centers;
  selectedCategoriesId: any;
  user!: Users | null;
  subscriptions: Subscription[] = []
  previewUrl: string | null = null;
  photoRequest: PhotoResponse | null = null;
  uploadingPhoto: boolean = false;
  imageChangedEvent: any = null;
  croppedImageBlob: Blob | null = null;
  showCropper: boolean = false;

  constructor(private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<UpdateCenterModalComponent>,
    private ngxService: NgxUiLoaderService,
    private store: Store,
    private snackBarService: SnackBarService,
    private cdr: ChangeDetectorRef,
    private centerService: CenterService,
    private strapiService: StrapiService,
    @Inject(MAT_DIALOG_DATA) private data: any) {
    this.center = this.data.centerData;
  }

  ngOnInit(): void {
    this.handleEmitEvent();
    this.selectedCategoriesId = this.center.categoryIds;
    this.previewUrl = this.center.photoResponse?.photoUrl || null;
    this.updateCenterForm = this.formBuilder.group({
      'id': this.center?.id,
      'name': new FormControl(this.center.name, Validators.compose([Validators.required, Validators.minLength(3)])),
      'motto': new FormControl(this.center.motto, Validators.compose([Validators.required, Validators.minLength(10)])),
      'address': new FormControl(this.center.address, Validators.compose([Validators.required, Validators.minLength(10)])),
      'location': new FormControl(this.center.location, Validators.compose([Validators.required, Validators.minLength(10)])),
      'experience': new FormControl(this.center.experience, Validators.compose([Validators.required, Validators.minLength(1)])),
      'likes': new FormControl(this.center.likes, Validators.compose([Validators.required, Validators.minLength(1)])),
      'categoryIds': this.formBuilder.array(this.selectedCategoriesId, this.validateCheckbox()),
    });
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  handleEmitEvent() {
    this.store.dispatch(loadActiveCategories());
    this.subscriptions.push(
      this.store.select(selectActiveCategories).subscribe((activeCategories) => {
        this.categories = activeCategories;
      }),
      this.store.select(selectUser).subscribe((user) => {
        this.user = user;
      }),
    );
  }

  closeDialog() {
    this.dialogRef.close('Dialog closed without completing center aplication')
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

    const file = new File([this.croppedImageBlob], `center_${Date.now()}.jpeg`, {
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
        id: this.center.photoResponse?.id ?? 0,
        strapiId: uploaded.id,
        photoUrl: uploaded.url,
        name: uploaded.name,
        mimeType: uploaded.mime,
        byteSize: uploaded.size,
        ownerId: 0,
        mediaOwnerType: MediaOwnerType.CENTER_PROFILE,
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
    console.log('Checkbox changed:', event.target.checked, event.target.value);
    const categories = this.updateCenterForm.get('categoryIds') as FormArray;

    if (event.target.checked) {
      categories.push(new FormControl(event.target.value));
    } else {
      // Remove the control by its value
      const index = categories.controls.findIndex((control) => control.value === event.target.value);
      categories.removeAt(index);
    }
  }

  updateCenter(): void {
    const selectedCategoryIds = this.updateCenterForm.value.categoryIds;
    const categoryToStrings = selectedCategoryIds.join(',');
    const formData = {
      ...this.updateCenterForm.value,
      categoryIds: categoryToStrings,
      ...(this.photoRequest ? { photoRequest: this.photoRequest } : {}),
    };

    if (this.updateCenterForm.invalid) {
      this.ngxService.start();
      this.invalidForm = true;
      this.responseMessage = "Invalid form. Please complete all sections";
      this.snackBarService.openSnackBar(this.responseMessage, "error");
      this.ngxService.stop();
    } else {
      this.ngxService.start();
      this.centerService.updateCenter(formData)
        .subscribe((response: any) => {
          this.updateCenterForm.reset();
          this.invalidForm = false;
          this.dialogRef.close('center account added successfully');
          this.responseMessage = response?.message;
          this.snackBarService.openSnackBar(this.responseMessage, "");
          this.ngxService.stop();
          this.onUpdateCenterEmit.emit();
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
    this.updateCenterForm.reset();
    this.showCropper = false;
    this.imageChangedEvent = null;
    this.croppedImageBlob = null;
  }

}
