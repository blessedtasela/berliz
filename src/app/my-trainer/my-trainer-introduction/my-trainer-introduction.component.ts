import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { take } from 'rxjs';
import { MediaOwnerType } from 'src/app/models/Media.enum';
import { StrapiUploadResponse } from 'src/app/models/Strapi.interface';
import { PhotoResponse, TrainerIntroduction } from 'src/app/models/trainers.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { StrapiService } from 'src/app/services/strapi.service';
import { TrainerStateService } from 'src/app/services/trainer-state.service';
import { TrainerService } from 'src/app/services/trainer.service';

@Component({
  selector: 'app-my-trainer-introduction',
  templateUrl: './my-trainer-introduction.component.html',
  styleUrls: ['./my-trainer-introduction.component.css']
})
export class MyTrainerIntroductionComponent {

  @Input() trainerIntroduction!: TrainerIntroduction;
  @Output() emitEvent = new EventEmitter();

  updateTrainerIntroductionForm!: FormGroup;

  imageChangedEvent: any = null;
  croppedImageBlob: Blob | null = null;
  selectedFile: File | null = null;

  uploadedPhoto: PhotoResponse | null = null;

  showCropper = false;
  invalidForm = false;
  isChecked = false;
  showPreviewModal = false;

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

    if (!this.trainerIntroduction) {
      console.error('trainerIntroduction input is missing!');
    }

    console.log(this.trainerIntroduction);

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
      coverPhoto: [
        this.trainerIntroduction?.photoResponse || null,
        Validators.required
      ]
    });

    this.uploadedPhoto = this.trainerIntroduction?.photoResponse || null;

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
      'trainer-cover-photo.jpg',
      {
        type: this.croppedImageBlob.type || 'image/jpeg'
      }
    );

    this.selectedFile = file;

    this.updateTrainerIntroductionForm.patchValue({
      coverPhoto: file
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

      this.uploadedPhoto =
        this.trainerIntroduction?.photoResponse || null;

      this.updateTrainerIntroductionForm.patchValue({
        coverPhoto: this.uploadedPhoto
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

      this.uploadedPhoto = null;

      this.updateTrainerIntroductionForm.patchValue({
        coverPhoto: null
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

          // 🔥 Update uploadedPhoto and previewUrl in a stable way
          setTimeout(() => {
            this.uploadedPhoto = {
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
          });

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
      photo: this.uploadedPhoto
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

          this.clear();
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

  clear(): void {

    this.trainerIntroduction = {
      ...this.trainerIntroduction,
      photoResponse: this.uploadedPhoto!
    };

    this.selectedFile = null;
    this.croppedImageBlob = null;
    this.imageChangedEvent = null;

    this.isChecked = false;
    this.invalidForm = false;

    // 🔥 Keep previewUrl in sync with final uploadedPhoto
    setTimeout(() => {
      if (this.uploadedPhoto?.photoUrl) {
        this.previewUrl = this.normalizeUrl(this.uploadedPhoto.photoUrl);
      } else {
        this.previewUrl = 'assets/avatar.png';
      }
    });

    this.updateTrainerIntroductionForm.markAsPristine();
    this.updateTrainerIntroductionForm.markAsUntouched();
    this.updateTrainerIntroductionForm.updateValueAndValidity();

    Object.keys(this.updateTrainerIntroductionForm.controls)
      .forEach(key => {

        const control =
          this.updateTrainerIntroductionForm.get(key);

        control?.setErrors(null);
        control?.markAsPristine();
        control?.markAsUntouched();
        control?.updateValueAndValidity();
      });
  }

  formatDate(dateString: any): any {

    const date = new Date(dateString);

    return this.datePipe.transform(
      date,
      'dd/MM/yyyy'
    );
  }
}
