// updated trainer-introduction.component.ts

import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { take } from 'rxjs';

import {
  PhotoResponse
} from 'src/app/models/Media.interface';

import { MediaOwnerType } from 'src/app/models/Media.enum';

import {
  StrapiUploadResponse
} from 'src/app/models/Strapi.interface';

import { SnackBarService } from 'src/app/services/snack-bar.service';
import { StrapiService } from 'src/app/services/strapi.service';
import { TrainerStateService } from 'src/app/services/trainer-state.service';
import { TrainerService } from 'src/app/services/trainer.service';
import { TrainerIntroduction } from 'src/app/models/trainers.interface';

@Component({
  selector: 'app-trainer-introduction',
  templateUrl: './trainer-introduction.component.html',
  styleUrls: ['./trainer-introduction.component.css']
})
export class TrainerIntroductionComponent {

  @Input() trainerIntroduction!: TrainerIntroduction;
  @Output() emitEvent = new EventEmitter();

  updateTrainerIntroductionForm!: FormGroup;

  imageChangedEvent: any = null;
  croppedImageBlob: Blob | null = null;
  selectedFile: File | null = null;

  photoRequest: PhotoResponse | null = null;

  showCropper = false;
  invalidForm = false;
  isChecked = false;
  showPreviewModal = false;
  originalValue: any;

  // 🔥 Stable preview URL used directly in template
  previewUrl: string = 'assets/avatar.png';

  constructor(
    private fb: FormBuilder,
    private loader: NgxUiLoaderService,
    private snackbar: SnackBarService,
    private trainerService: TrainerService,
    private trainerState: TrainerStateService,
    private strapi: StrapiService,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {

    this.updateTrainerIntroductionForm = this.fb.group({
      id: this.trainerIntroduction?.id,
      introduction: [
        this.trainerIntroduction?.introduction || '',
        [
          Validators.required,
          Validators.minLength(900),
          Validators.maxLength(1200)
        ]
      ],
      photoRequest: [
        this.trainerIntroduction?.photoResponse || null,
        Validators.required
      ]
    });

    this.originalValue = this.updateTrainerIntroductionForm.getRawValue();
    this.photoRequest = this.trainerIntroduction?.photoResponse || null;

    // 🔥 Initialize previewUrl once, stable for first render
    if (this.trainerIntroduction?.photoResponse?.photoUrl) {
      this.previewUrl = this.normalizeUrl(this.trainerIntroduction.photoResponse.photoUrl);
    } else {
      this.previewUrl = 'assets/avatar.png';
    }
  }

  // 🔥 Helper to normalize URLs (blob / http / relative)
  private normalizeUrl(url: string): string {
    if (!url) return 'assets/avatar.png';

    if (url.startsWith('blob:')) {
      return url;
    }

    return url.startsWith('http')
      ? url
      : `http://localhost:1337${url}`;
  }

  onImgSelected(event: any): void {
    const file = event.target.files?.[0];

    if (!file) return;

    this.imageChangedEvent = event;
    this.showCropper = true;
  }

  imageCropped(event: ImageCroppedEvent): void {
    this.croppedImageBlob = event.blob || null;
  }

  loadImageFailed(): void {
    this.snackbar.openSnackBar('Failed to load image', 'error');
  }

  cancelUpload(): void {
    this.showCropper = false;
    this.imageChangedEvent = null;
    this.croppedImageBlob = null;
  }

  submitCropToUpload(): void {

    if (!this.croppedImageBlob) {
      this.snackbar.openSnackBar('Please crop image first', 'error');
      return;
    }

    const file = new File(
      [this.croppedImageBlob],
      this.photoRequest?.name || `cropped_${Date.now()}.jpeg`,
      {
        type: this.croppedImageBlob.type || 'image/jpeg'
      }
    );

    this.selectedFile = file;

    this.updateTrainerIntroductionForm.patchValue({
      photoRequest: file
    });

    // 🔥 Update previewUrl with a stable blob URL (next tick)
    setTimeout(() => {
      this.previewUrl = URL.createObjectURL(this.selectedFile!);
    });

    this.showCropper = false;
  }

  // ❌ previewImage() removed – we now use previewUrl directly in template

  onCurrentPhotoSelected(event: any): void {

    if (event.target.checked) {

      this.photoRequest =
        this.trainerIntroduction?.photoResponse || null;

      this.updateTrainerIntroductionForm.patchValue({
        photoRequest: this.photoRequest
      });

      // 🔥 Update previewUrl based on existing photo
      setTimeout(() => {
        if (this.trainerIntroduction?.photoResponse?.photoUrl) {
          this.previewUrl = this.normalizeUrl(this.trainerIntroduction.photoResponse.photoUrl);
        } else {
          this.previewUrl = 'assets/avatar.png';
        }
      });

      this.isChecked = true;

    } else {

      this.photoRequest = null;

      this.updateTrainerIntroductionForm.patchValue({
        photoRequest: null
      });

      // 🔥 Reset preview
      setTimeout(() => {
        this.previewUrl = 'assets/avatar.png';
      });

      this.isChecked = false;
    }
  }

  updateTrainerIntroduction(): void {

    if (this.updateTrainerIntroductionForm.invalid) {

      this.invalidForm = true;

      this.snackbar.openSnackBar(
        'Please complete all required fields',
        'error'
      );

      return;
    }

    this.loader.start();

    if (this.selectedFile) {
      this.uploadNewImage();
    } else {
      this.saveToBackend();
    }
  }

  private uploadNewImage(): void {

    this.strapi.uploadToStrapi(this.selectedFile!)
      .pipe(take(1))
      .subscribe({

        next: (res: StrapiUploadResponse[]) => {

          const file = res?.[0];

          if (!file) {
            throw new Error('No file returned from Strapi');
          }

          // 🔥 Update uploadedPhoto and previewUrl
          this.photoRequest = {
            id: 0,
            strapiId: file.id,
            photoUrl: file.url,
            name: file.name,
            mimeType: file.mime,
            byteSize: file.size,
            ownerId: 0,
            mediaOwnerType: MediaOwnerType.TRAINER_INTRODUCTION
          };

          this.previewUrl = this.normalizeUrl(file.url);

          this.saveToBackend();

        },

        error: err => {

          this.loader.stop();

          this.snackbar.openSnackBar(
            err?.error?.message || 'Strapi upload failed',
            'error'
          );
        }
      });
  }

  private saveToBackend(): void {

    const payload = {
      id: this.updateTrainerIntroductionForm.get('id')?.value,
      trainerId: this.trainerIntroduction?.trainerId,
      introduction: this.updateTrainerIntroductionForm
        .get('introduction')
        ?.value,
      photoRequest: this.photoRequest
    };

    console.log('FINAL PAYLOAD SENT:', payload);

    const request$ = payload.id
      ? this.trainerService.updateTrainerIntroduction(payload)
      : this.trainerService.addTrainerIntroduction(payload);

    request$
      .pipe(take(1))
      .subscribe({

        next: (res: any) => {

          this.snackbar.openSnackBar(res?.message, '');
          this.emitEvent.emit();
          this.loader.stop();
          this.clear(res);
        },

        error: (err: any) => {
          this.loader.stop();
          this.snackbar.openSnackBar(
            err?.error?.message || 'Backend save failed',
            'error'
          );
        }
      });
  }

  clear(updated: TrainerIntroduction): void {

    // 1️⃣ Update local trainerIntroduction with backend response
    this.trainerIntroduction = updated;

    // 2️⃣ Update form with backend response
    this.updateTrainerIntroductionForm.patchValue({
      id: updated.id,
      introduction: updated.introduction,
      photoRequest: updated.photoResponse
    });

    // 3️⃣ Update preview image
    if (updated.photoResponse?.photoUrl) {
      this.previewUrl = this.normalizeUrl(updated.photoResponse.photoUrl);
    } else {
      this.previewUrl = 'assets/avatar.png';
    }

    // 4️⃣ Reset local state
    this.photoRequest = updated.photoResponse || null;
    this.selectedFile = null;
    this.croppedImageBlob = null;
    this.imageChangedEvent = null;
    this.isChecked = false;
    this.invalidForm = false;

    // 5️⃣ Reset form state
    this.updateTrainerIntroductionForm.markAsPristine();
    this.updateTrainerIntroductionForm.markAsUntouched();
    this.updateTrainerIntroductionForm.updateValueAndValidity();
    this.originalValue = this.updateTrainerIntroductionForm.getRawValue();
  }

  formatDate(dateString: any): any {

    const date = new Date(dateString);

    return this.datePipe.transform(
      date,
      'dd/MM/yyyy'
    );
  }

  hasChanges(): boolean {

    const current =
      JSON.stringify(
        this.updateTrainerIntroductionForm.getRawValue()
      );

    const original =
      JSON.stringify(this.originalValue);

    return current !== original;
  }
}
