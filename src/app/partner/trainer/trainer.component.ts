import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription, take } from 'rxjs';

import { UpdateTrainerModalComponent } from 'src/app/admin/trainers/update-trainer-modal/update-trainer-modal.component';
import { MediaOwnerType } from 'src/app/models/Media.enum';
import { PhotoResponse } from 'src/app/models/Media.interface';
import { StrapiUploadResponse } from 'src/app/models/Strapi.interface';
import { Partner } from 'src/app/models/partners.interface';
import { Trainers } from 'src/app/models/trainers.interface';
import { Users } from 'src/app/models/users.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { StrapiService } from 'src/app/services/strapi.service';
import { TrainerService } from 'src/app/services/trainer.service';
import { UpdateTrainerPhotoModalComponent } from 'src/app/shared/update-trainer-photo-modal/update-trainer-photo-modal.component';
import { environment } from 'src/environments/environment';
import { imageValidator, genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-trainer',
  templateUrl: './trainer.component.html',
  styleUrls: ['./trainer.component.css']
})
export class TrainerComponent {

  @Input() trainerData!: Trainers;
  @Input() user!: Users | null;
  @Input() partnerData!: Partner;
  @Output() onEmit = new EventEmitter();

  subscriptions: Subscription[] = [];
  updateTrainerPhotoForm!: FormGroup;
  imageChangedEvent: any = null;
  croppedImageBlob: Blob | null = null;
  selectedFile: File | null = null;
  photoRequest: PhotoResponse | null = null;
  showImageModal = false;
  showCropper = false;
  responseMessage: any;
  previewUrl: string = 'assets/icons/user.png';

  constructor(
    private dialog: MatDialog,
    private ngxService: NgxUiLoaderService,
    private store: Store,
    private datePipe: DatePipe,
    private trainerService: TrainerService,
    private snackBarService: SnackBarService,
    private formbuilder: FormBuilder,
    private strapiService: StrapiService
  ) { }

  ngOnInit(): void {

    this.updateTrainerPhotoForm = this.formbuilder.group({
      photo: ['', [Validators.required, imageValidator]],
      id: [this.trainerData.id],
    });

    this.setInitialImage();
  }

  private setInitialImage(): void {
    const url = this.trainerData?.photoResponse?.photoUrl;

    this.previewUrl = url
      ? this.normalizeUrl(url)
      : 'assets/icons/user.png';
  }

  private normalizeUrl(url: string): string {
    if (!url) return 'assets/icons/user.png';
    if (url.startsWith('http') || url.startsWith('blob:')) return url;
    return `${environment.strapiUrl}${url}`;
  }

  onImgSelected(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;

    this.imageChangedEvent = event;
    this.showCropper = true;
  }

  imageCropped(event: ImageCroppedEvent): void {

    if (!event.blob) return;

    this.croppedImageBlob = event.blob;

    this.selectedFile = new File(
      [event.blob],
      `trainer_${Date.now()}.jpg`,
      { type: event.blob.type || 'image/jpeg' }
    );
  }

  cancelUpload(): void {
    this.showCropper = false;
    this.imageChangedEvent = null;
    this.croppedImageBlob = null;
    this.selectedFile = null;
  }

  async updatePhoto(): Promise<void> {

    if (!this.selectedFile) {
      this.snackBarService.openSnackBar('Please select a photo', 'error');
      return;
    }

    try {

      this.ngxService.start();

      const fileToUpload = this.selectedFile as File;

      const res: any[] =
        (await this.strapiService
          .uploadToStrapi(fileToUpload)
          .pipe(take(1))
          .toPromise()) ?? [];

      const uploaded = res?.[0];

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
        mediaOwnerType: MediaOwnerType.TRAINER_INTRODUCTION,

        date: new Date(),
        lastUpdate: uploaded.lastUpdate
          ? new Date(uploaded.lastUpdate)
          : new Date()
      };

      this.previewUrl = this.normalizeUrl(uploaded.url);

      // Send to backend
      this.savePhotoToBackend();

    } catch (err: any) {
      this.ngxService.stop();
      this.snackBarService.openSnackBar(
        err?.error?.message ||
        err?.message ||
        'Strapi upload failed',
        'error'
      );
    }
  }

  private savePhotoToBackend(): void {

    const payload = {
      id: this.trainerData.id,
      photoRequest: this.photoRequest
    };

    this.trainerService.updateTrainerPhoto(payload)
      .pipe(take(1))
      .subscribe({
        next: (res: any) => {
          this.ngxService.stop();
          this.snackBarService.openSnackBar(res?.message, '');
          this.trainerData.photoResponse = res?.photoResponse;
          this.showCropper = false;
          this.onEmit.emit();
        },

        error: (err: any) => {
          this.ngxService.stop();
          this.snackBarService.openSnackBar(
            err?.error?.message || genericError,
            'error'
          );
        }
      });
  }

  formatDate(dateString: any): any {
    return this.datePipe.transform(new Date(dateString), 'dd/MM/yyyy');
  }

  openUrl(url: any) {
    window.open(url, '_blank');
  }

  openImagePreview() {
    if (!this.previewUrl) return;
    this.showImageModal = true;
  }

  closeImagePreview() {
    this.showImageModal = false;
  }

}