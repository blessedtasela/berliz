import { ChangeDetectorRef, Component, EventEmitter, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, ValidatorFn, AbstractControl, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Categories } from 'src/app/models/categories.interface';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Tags } from 'src/app/models/tags.interface';
import { CategoryService } from 'src/app/services/category.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TagService } from 'src/app/services/tag.service';
import { genericError } from 'src/validators/form-validators.module';
import { Store } from '@ngrx/store';
import { loadActiveTags } from 'src/app/state/tag/tag.actions';
import { selectActiveTags } from 'src/app/state/tag/tag.selectors';
import { take } from 'rxjs';
import { StrapiService } from 'src/app/services/strapi.service';
import { PhotoResponse } from 'src/app/models/Media.interface';
import { MediaOwnerType } from 'src/app/models/Media.enum';
import { ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
  selector: 'app-update-category-modal',
  templateUrl: './update-category-modal.component.html',
  styleUrls: ['./update-category-modal.component.css']
})
export class UpdateCategoryModalComponent {
  onUpdateCategoryEmit = new EventEmitter();
  updateCategoryForm!: FormGroup;
  invalidForm: boolean = false;
  responseMessage: any;
  tags!: Tags[];
  categoryData!: Categories;
  selectedTagsId: any;
  previewUrl: string | null = null;
  photoRequest: PhotoResponse | null = null;
  uploadingPhoto: boolean = false;
  imageChangedEvent: any = null;
  croppedImageBlob: Blob | null = null;
  showCropper: boolean = false;

  constructor(private formBuilder: FormBuilder,
    private categoryService: CategoryService,
    private tagService: TagService,
    private cdr: ChangeDetectorRef,
    public dialogRef: MatDialogRef<UpdateCategoryModalComponent>,
    private ngxService: NgxUiLoaderService,
    private strapiService: StrapiService,
    private snackbarService: SnackBarService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private store: Store) {
    this.categoryData = this.data.categoryData;
  }

  ngOnInit(): void {
    this.handleEmitEvent()
    this.selectedTagsId = this.categoryData.tagIds;
    this.previewUrl = this.categoryData.photoUrl || null;
    this.updateCategoryForm = this.formBuilder.group({
      'id': new FormControl(this.categoryData.id, [Validators.required]),
      'name': new FormControl(this.categoryData.name, [Validators.required, Validators.minLength(2)]),
      'description': new FormControl(this.categoryData.description, [Validators.required, Validators.minLength(20)]),
      'likes': new FormControl(this.categoryData.likes, [Validators.required, Validators.minLength(1)]),
      'tagIds': this.formBuilder.array(this.selectedTagsId, this.validateCheckbox()),
    });
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
    this.snackbarService.openSnackBar('Failed to load image', 'error');
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
      this.snackbarService.openSnackBar('Please crop the image first', 'error');
      return;
    }

    const file = new File([this.croppedImageBlob], `category_${Date.now()}.jpeg`, {
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
        id: this.categoryData.photoId ?? 0,
        strapiId: uploaded.id,
        photoUrl: uploaded.url,
        name: uploaded.name,
        mimeType: uploaded.mime,
        byteSize: uploaded.size,
        ownerId: 0,
        mediaOwnerType: MediaOwnerType.CATEGORY_PHOTO,
        date: new Date(),
        lastUpdate: new Date(),
      };
    } catch (err: any) {
      this.snackbarService.openSnackBar(err?.error?.message || err?.message || 'Photo upload failed', 'error');
    } finally {
      this.uploadingPhoto = false;
    }
  }

  onCheckboxChanged(event: any) {
    console.log('Checkbox changed:', event.target.checked, event.target.value);
    const tags = this.updateCategoryForm.get('tagIds') as FormArray;

    if (event.target.checked) {
      tags.push(new FormControl(event.target.value));
    } else {
      const index = tags.controls.findIndex((control) => control.value === event.target.value);
      tags.removeAt(index);
    }
  }

  handleEmitEvent() {
    this.store.dispatch(loadActiveTags());
    this.store.select(selectActiveTags).subscribe((activeTags) => {
      this.tags = activeTags;
    })
  }

  validateCheckbox(): ValidatorFn {
    return (formArray: AbstractControl) => {
      const checkboxes = formArray.value;
      const isChecked = checkboxes.length > 0;

      return isChecked ? null : { noCheckboxChecked: true };
    };
  }

  updateCategory(): void {
    this.ngxService.start();
    if (this.updateCategoryForm.invalid) {
      this.invalidForm = true
      this.responseMessage = "Invalid form"
      this.ngxService.stop();
    } else {
      // Get the selected tagIds values as an array
      const selectedTagIds = this.updateCategoryForm.value.tagIds

      // Convert the array to a comma-separated string
      const tagIdsArray = selectedTagIds;
      const formData = {
        ...this.updateCategoryForm.value,
        tagIds: tagIdsArray,
        ...(this.photoRequest ? { photoRequest: this.photoRequest } : {}),
      };
      this.categoryService.updateCategory(formData)
        .subscribe((response: any) => {
          this.onUpdateCategoryEmit.emit();
          this.updateCategoryForm.reset();
          this.invalidForm = false;
          this.dialogRef.close('Category updated successfully');
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
    this.dialogRef.close('Dialog closed without updating category');
  }

  clear() {
    this.updateCategoryForm.reset();
    this.showCropper = false;
    this.imageChangedEvent = null;
    this.croppedImageBlob = null;
  }

}

