import { ChangeDetectorRef, Component, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, AbstractControl, ValidatorFn, FormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TagService } from 'src/app/services/tag.service';
import { genericError, imageValidator } from 'src/validators/form-validators.module';
import { CategoryService } from 'src/app/services/category.service';
import { Tags } from 'src/app/models/tags.interface';
import { Subscription, take } from 'rxjs';
import { Store } from '@ngrx/store';
import { loadActiveTags } from 'src/app/state/tag/tag.actions';
import { selectActiveTags } from 'src/app/state/tag/tag.selectors';
import { StrapiService } from 'src/app/services/strapi.service';
import { PhotoResponse } from 'src/app/models/Media.interface';
import { MediaOwnerType } from 'src/app/models/Media.enum';
import { ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
  selector: 'app-add-category-modal',
  templateUrl: './add-category-modal.component.html',
  styleUrls: ['./add-category-modal.component.css']
})
export class AddCategoryModalComponent implements OnInit {
  onAddCategoryEmit = new EventEmitter();
  addCategoryForm!: FormGroup;
  invalidForm: boolean = false;
  responseMessage: any;
  tags!: Tags[];
  subscription = new Subscription;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  photoRequest: PhotoResponse | null = null;
  uploadingPhoto: boolean = false;
  imageChangedEvent: any = null;
  croppedImageBlob: Blob | null = null;
  showCropper: boolean = false;

  constructor(private formBuilder: FormBuilder,
    private categoryService: CategoryService,
    private store: Store,
    public dialogRef: MatDialogRef<AddCategoryModalComponent>,
    private ngxService: NgxUiLoaderService,
    private cd: ChangeDetectorRef,
    private strapiService: StrapiService,
    private snackbarService: SnackBarService) {
  }

  ngOnInit(): void {
    this.addCategoryForm = this.formBuilder.group({
      'name': ['', [Validators.required, Validators.minLength(2)]],
      'description': ['', [Validators.required, Validators.minLength(20)]],
      'likes': ['0',],
      'photo': ['', [Validators.required, imageValidator()]],
      'tagIds': this.formBuilder.array([], this.validateCheckbox()),
    });

    this.handleEmitEvent();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe()
  }

  handleEmitEvent() {
    this.store.dispatch(loadActiveTags());
    this.subscription.add(
      this.store.select(selectActiveTags).subscribe((tags) => {
        this.tags = tags;
        this.cd.detectChanges(); // Manually trigger change detection
      })
    );
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

    this.selectedFile = file;
    this.previewUrl = URL.createObjectURL(file);

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
    const tags = this.addCategoryForm.get('tagIds') as FormArray;
    if (event.target.checked) {
      tags.push(this.formBuilder.group({ tagIds: event.target.value }));
    } else {
      const index = tags.controls.findIndex((control) => control.value.tagIds === event.target.value);
      tags.removeAt(index);
    }
  }

  validateCheckbox(): ValidatorFn {
    return (formArray: AbstractControl) => {
      const checkboxes = formArray.value;
      const isChecked = checkboxes.length > 0;
      return isChecked ? null : { noCheckboxChecked: true };
    };
  }

  addCategory(): void {
    this.ngxService.start();
    if (this.addCategoryForm.invalid || !this.photoRequest) {
      this.invalidForm = true
      this.responseMessage = this.photoRequest ? "Invalid form" : "Please select a photo"
      this.snackbarService.openSnackBar(this.responseMessage, "error");
      this.ngxService.stop();
    } else {
      // Get the selected tagIds values as an array
      const selectedTagIds = this.addCategoryForm.value.tagIds.map((tag: any) => tag.tagIds);
      const tagIdsString = selectedTagIds.join(',');
      const { photo, ...formValue } = this.addCategoryForm.value;
      const formData = {
        ...formValue,
        tagIds: tagIdsString,
        photoRequest: this.photoRequest,
      };
      this.categoryService.addCategory(formData)
        .subscribe((response: any) => {
          this.onAddCategoryEmit.emit();
          this.addCategoryForm.reset();
          this.invalidForm = false;
          this.dialogRef.close('Category added successfully');
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
    this.dialogRef.close('Dialog closed without adding a category');
  }

  clear() {
    this.addCategoryForm.reset();
    this.selectedFile = null;
    this.previewUrl = null;
    this.photoRequest = null;
    this.showCropper = false;
    this.imageChangedEvent = null;
    this.croppedImageBlob = null;
    this.onCheckboxChanged(event)
  }


}

