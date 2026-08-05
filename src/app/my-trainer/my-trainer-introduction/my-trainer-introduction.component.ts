import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { take } from 'rxjs';
import { MediaOwnerType } from 'src/app/models/Media.enum';
import { PhotoResponse } from 'src/app/models/Media.interface';
import { StrapiUploadResponse } from 'src/app/models/Strapi.interface';
import { TrainerIntroduction } from 'src/app/models/trainers.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { StrapiService } from 'src/app/services/strapi.service';
import { TrainerService } from 'src/app/services/trainer.service';

@Component({
  selector: 'app-my-trainer-introduction',
  templateUrl: './my-trainer-introduction.component.html',
  styleUrls: ['./my-trainer-introduction.component.css']
})
export class MyTrainerIntroductionComponent implements OnInit, OnChanges {


  @Input() trainerIntroduction!: TrainerIntroduction | null;
  @Output() emitEvent = new EventEmitter();

  updateTrainerIntroductionForm!: FormGroup;

  imageChangedEvent: any = null;
  croppedImageBlob: Blob | null = null;
  selectedFile: File | null = null;

  photo: PhotoResponse | null = null;

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
    private store: Store,
    private strapi: StrapiService,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    if (!this.updateTrainerIntroductionForm) {
      this.initForm();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['trainerIntroduction']?.currentValue) {
      this.initForm();
    }
  }

  private initForm(): void {

    if (this.updateTrainerIntroductionForm) {
      this.updateTrainerIntroductionForm.patchValue({
        id: this.trainerIntroduction?.id,
        introduction: this.trainerIntroduction?.introduction || '',
        photo: this.trainerIntroduction?.photo || null
      });
    } else {
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
        photo: [
          this.trainerIntroduction?.photo || null,
          Validators.required
        ]
      });
    }

    this.originalValue = this.updateTrainerIntroductionForm.getRawValue();
    this.photo = this.trainerIntroduction?.photo || null;

    // 🔥 Initialize previewUrl, stable for first render
    if (this.trainerIntroduction?.photo?.photoUrl) {
      this.previewUrl = this.normalizeUrl(this.trainerIntroduction.photo.photoUrl);
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
      this.photo?.name || `cropped_${Date.now()}.jpeg`,
      {
        type: this.croppedImageBlob.type || 'image/jpeg'
      }
    );

    this.selectedFile = file;

    this.updateTrainerIntroductionForm.patchValue({
      photo: file
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

      this.photo =
        this.trainerIntroduction?.photo || null;

      this.updateTrainerIntroductionForm.patchValue({
        photo: this.photo
      });

      // 🔥 Update previewUrl based on existing photo
      setTimeout(() => {
        if (this.trainerIntroduction?.photo?.photoUrl) {
          this.previewUrl = this.normalizeUrl(this.trainerIntroduction.photo.photoUrl);
        } else {
          this.previewUrl = 'assets/avatar.png';
        }
      });

      this.isChecked = true;

    } else {

      this.photo = null;

      this.updateTrainerIntroductionForm.patchValue({
        photo: null
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

  private async uploadNewImage(): Promise<void> {

    try {

      this.loader.start();

      const fileToUpload = this.selectedFile as File;

      const res: any[] =
        (await this.strapi
          .uploadToStrapi(fileToUpload)
          .pipe(take(1))
          .toPromise()) ?? [];

      const uploaded = res?.[0];

      if (!uploaded) {
        throw new Error('No file returned from Strapi');
      }

      this.photo = {
        id: 0,
        strapiId: uploaded.id,
        photoUrl: uploaded.url,
        name: uploaded.name,
        mimeType: uploaded.mime,
        byteSize: uploaded.size,
        ownerId: 0,
        mediaOwnerType: MediaOwnerType.TRAINER_INTRODUCTION,
        date: new Date(),
        lastUpdate: uploaded.lastUpdate ? new Date(uploaded.lastUpdate) : new Date()
      };

      this.previewUrl = this.normalizeUrl(uploaded.url);

      this.saveToBackend();

    } catch (err: any) {

      this.loader.stop();

      this.snackbar.openSnackBar(
        err?.error?.message || err?.message || 'Strapi upload failed',
        'error'
      );
    }
  }

  private saveToBackend(): void {

    const payload = {
      id: this.updateTrainerIntroductionForm.get('id')?.value,
      trainerId: this.trainerIntroduction?.trainerId,
      introduction: this.updateTrainerIntroductionForm
        .get('introduction')
        ?.value,
      photo: this.photo
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
      photo: updated.photo
    });

    // 3️⃣ Update preview image
    if (updated.photo?.photoUrl) {
      this.previewUrl = this.normalizeUrl(updated.photo.photoUrl);
    } else {
      this.previewUrl = 'assets/avatar.png';
    }

    // 4️⃣ Reset local state
    this.photo = updated.photo || null;
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
