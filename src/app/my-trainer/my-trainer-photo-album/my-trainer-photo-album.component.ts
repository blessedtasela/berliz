import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription, take } from 'rxjs';
import { MediaOwnerType } from 'src/app/models/Media.enum';
import { PhotoResponse } from 'src/app/models/Media.interface';
import { TrainerPhotoAlbum } from 'src/app/models/trainers.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { StrapiService } from 'src/app/services/strapi.service';
import { TrainerService } from 'src/app/services/trainer.service';
import { selectMyTrainerPhotoAlbum } from 'src/app/state/trainer/trainer.selector';
import { genericError } from 'src/validators/form-validators.module';

// Each slot tracks raw file, preview, cropped blob, upload status
interface PhotoSlot {
  rawFile: File | null;
  previewUrl: string;          // shown in grid (raw or cropped)
  croppedBlob: Blob | null;    // set after crop, null if skipped
  uploaded: boolean;           // true after Strapi upload
  uploadedResponse: PhotoResponse | null;
  uploading: boolean;
  touched: boolean;          // user interacted (for validation)
}

type CropStep = 'idle' | 'cropping' | 'uploading-all';

@Component({
  selector: 'app-my-trainer-photo-album',
  templateUrl: './my-trainer-photo-album.component.html',
  styleUrls: ['./my-trainer-photo-album.component.css']
})

export class MyTrainerPhotoAlbumComponent implements OnInit, OnChanges, OnDestroy {

  @Input() trainerPhotoAlbum!: TrainerPhotoAlbum | null;
  @Output() emitEvent = new EventEmitter();

  // ── Form ──────────────────────────────────────────────────────────────────
  updateTrainerPhotoAlbumForm!: FormGroup;
  invalidForm = false;
  originalValue: any;

  // ── Constants ─────────────────────────────────────────────────────────────
  readonly MAX_PHOTOS = 15;
  readonly MIN_PHOTOS = 9;

  // ── Slots ─────────────────────────────────────────────────────────────────
  slots: PhotoSlot[] = [];

  // ── Crop state ────────────────────────────────────────────────────────────
  cropStep: CropStep = 'idle';
  cropQueueIndex = -1;          // which slot is being cropped right now
  cropImageBase64 = '';         // fed to image-cropper
  croppedBlob: Blob | null = null;
  cropAspectRatio = 1;          // default 1:1, user can switch
  showPreviewModal = false;
  previewModalUrl = '';

  // ── Upload state ──────────────────────────────────────────────────────────
  uploadingAll = false;
  uploadProgress = 0;           // 0-100

  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private loader: NgxUiLoaderService,
    private snackbar: SnackBarService,
    private trainerService: TrainerService,
    private store: Store,
    private strapiService: StrapiService,
    private datePipe: DatePipe,
    private cdr: ChangeDetectorRef
  ) { }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['trainerPhotoAlbum']?.currentValue) {
      this.initSlots();
      this.initForm();
      this.cdr.detectChanges();
    }
  }

  ngOnInit(): void {
    // ngOnInit is a safety net — ngOnChanges already handled it
    // if trainerPhotoAlbum was set before OnInit fires
    if (!this.updateTrainerPhotoAlbumForm) {
      this.initSlots();
      this.initForm();
    }
  }

  private initSlots(): void {
    this.slots = Array.from({ length: this.MAX_PHOTOS }, () => this.emptySlot());

    if (this.trainerPhotoAlbum?.photos?.length) {
      this.trainerPhotoAlbum.photos.forEach((p, i) => {
        if (i < this.MAX_PHOTOS) {
          this.slots[i].previewUrl = this.resolvePhotoUrl(p.photoUrl ?? '');
          this.slots[i].uploaded = true;
          this.slots[i].uploadedResponse = p;
          this.slots[i].touched = false
        }
      });
    }
  }

  private initForm(): void {
    if (this.updateTrainerPhotoAlbumForm) {
      this.updateTrainerPhotoAlbumForm.patchValue({
        id: this.trainerPhotoAlbum?.id,
        comment: this.trainerPhotoAlbum?.comment || '',
        trainerId: this.trainerPhotoAlbum?.trainerId
      });
    } else {
      this.updateTrainerPhotoAlbumForm = this.fb.group({
        id: [this.trainerPhotoAlbum?.id],
        comment: [
          this.trainerPhotoAlbum?.comment || '',
          [Validators.required, Validators.minLength(900)]
        ],
        trainerId: [this.trainerPhotoAlbum?.trainerId]
      });
    }
    this.originalValue = this.updateTrainerPhotoAlbumForm.getRawValue();
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.slots.forEach(s => { if (s.previewUrl?.startsWith('blob:')) URL.revokeObjectURL(s.previewUrl); });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private emptySlot(): PhotoSlot {
    return {
      rawFile: null, previewUrl: '', croppedBlob: null,
      uploaded: false, uploadedResponse: null, uploading: false, touched: false
    };
  }

  get filledSlots(): PhotoSlot[] {
    return this.slots.filter(s => s.previewUrl || s.rawFile);
  }

  get photoCount(): number {
    return this.slots.filter(s => s.previewUrl || s.rawFile).length;
  }

  get uploadedCount(): number {
    return this.slots.filter(s => s.uploaded).length;
  }

  get allUploaded(): boolean {
    return this.slots.filter(s => s.rawFile || s.previewUrl).every(s => s.uploaded);
  }

  get validPhotos(): boolean {
    return this.slots
      .filter(s => s.rawFile || s.previewUrl) // slot is filled
      .every(s =>
        s.uploaded
      ) && !!this.updateTrainerPhotoAlbumForm.get('comment')?.dirty;
  }

  get formReady(): boolean {
    return (
      this.photoCount >= this.MIN_PHOTOS &&
      this.updateTrainerPhotoAlbumForm.valid &&
      !this.uploadingAll
    );
  }

  get canSaveAll(): boolean {
    return (this.formReady && this.hasChanges());
  }

  // ── Photo selection ───────────────────────────────────────────────────────
  onImageSelected(event: any): void {
    const files: FileList = event.target.files;
    if (!files?.length) return;

    const available = this.MAX_PHOTOS - this.photoCount;
    const toAdd = Array.from(files).slice(0, available);

    toAdd.forEach(file => {
      const emptyIdx = this.slots.findIndex(s => !s.rawFile && !s.previewUrl);
      if (emptyIdx === -1) return;

      const url = URL.createObjectURL(file);
      this.slots[emptyIdx].rawFile = file;
      this.slots[emptyIdx].previewUrl = url;
      this.slots[emptyIdx].uploaded = false;
      this.slots[emptyIdx].uploadedResponse = null;
      this.slots[emptyIdx].croppedBlob = null;
      this.slots[emptyIdx].touched = true;
    });

    // Reset input so same files can be re-selected if needed
    (event.target as HTMLInputElement).value = '';
    this.cdr.detectChanges();
  }

  removeSlot(index: number): void {
    const slot = this.slots[index];

    if (slot.previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(slot.previewUrl);
    }

    this.slots[index] = this.emptySlot();
    this.cdr.detectChanges();
  }

  removeAll(): void {
    this.slots.forEach(slot => {
      if (slot.previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(slot.previewUrl);
      }
    });

    this.slots = Array.from(
      { length: this.MAX_PHOTOS },
      () => this.emptySlot()
    );

    this.cdr.detectChanges();
  }

  // ── Crop flow ─────────────────────────────────────────────────────────────

  openCropperForSlot(index: number): void {
    const slot = this.slots[index];
    if (!slot.rawFile && !slot.previewUrl) return;

    this.cropQueueIndex = index;
    this.croppedBlob = null;
    this.cropImageBase64 = '';

    // Load from blob URL or existing URL into base64 for cropper
    const urlToLoad = slot.previewUrl;

    fetch(urlToLoad)
      .then(r => r.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.cropImageBase64 = e.target.result;
          this.cropStep = 'cropping';
          this.cdr.detectChanges();
        };
        reader.readAsDataURL(blob);
      })
      .catch(() => this.snackbar.openSnackBar('Could not load photo for cropping.', 'error'));
  }

  onImageCropped(event: ImageCroppedEvent): void {
    this.croppedBlob = event.blob ?? null;
  }

  onCropLoadFailed(): void {
    this.snackbar.openSnackBar('Could not load image.', 'error');
    this.cropStep = 'idle';
    this.cropQueueIndex = -1;
  }

  setCropRatio(ratio: number): void {
    this.cropAspectRatio = ratio;
    this.cdr.detectChanges();
  }

  confirmCrop(): void {
    if (!this.croppedBlob || this.cropQueueIndex < 0) return;

    const slot = this.slots[this.cropQueueIndex];
    if (slot.previewUrl?.startsWith('blob:')) URL.revokeObjectURL(slot.previewUrl);

    slot.croppedBlob = this.croppedBlob;
    slot.previewUrl = URL.createObjectURL(this.croppedBlob);
    slot.uploaded = false;
    slot.uploadedResponse = null;
    slot.touched = true;

    this.cropStep = 'idle';
    this.cropQueueIndex = -1;
    this.croppedBlob = null;
    this.cropImageBase64 = '';
    this.cdr.detectChanges();
  }

  skipCrop(): void {
    this.cropStep = 'idle';
    this.cropQueueIndex = -1;
    this.croppedBlob = null;
    this.cropImageBase64 = '';
    this.cdr.detectChanges();
  }

  cancelCrop(): void {
    this.skipCrop();
  }

  // ── Preview modal ─────────────────────────────────────────────────────────

  openPreview(url: string): void {
    this.previewModalUrl = url;
    this.showPreviewModal = true;
  }

  // ── Upload all to Strapi ──────────────────────────────────────────────────

  async uploadAllToStrapi(): Promise<boolean> {

    const toUpload = this.slots.filter(s => (s.rawFile || s.croppedBlob) && !s.uploaded);
    if (this.photoCount < this.MIN_PHOTOS) {
      this.snackbar.openSnackBar(`Please select at least ${this.MIN_PHOTOS} photos.`, 'error');
      return false;
    }

    this.uploadingAll = true;
    this.uploadProgress = 0;
    this.cdr.detectChanges();

    let done = 0;
    for (const slot of toUpload) {
      slot.uploading = true;
      this.cdr.detectChanges();

      try {
        // Use cropped blob if available, otherwise raw file
        const fileToUpload = slot.croppedBlob
          ? new File([slot.croppedBlob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' })
          : slot.rawFile!;
        const res: any[] = (await this.strapiService.uploadToStrapi(fileToUpload).pipe(take(1)).toPromise()) ?? [];
        const uploaded = res?.[0];
        if (!uploaded?.url) throw new Error('No URL returned');

        slot.uploadedResponse = {
          id: 0,
          strapiId: uploaded.id,
          photoUrl: uploaded.url,
          name: uploaded.name,
          mimeType: uploaded.mime,
          byteSize: uploaded.size,
          ownerId: 0,
          mediaOwnerType: MediaOwnerType.TRAINER_PHOTO_ALBUM,
          date: new Date(),
          lastUpdate: uploaded.lastUpdate ? new Date(uploaded.lastUpdate) : new Date()
        };

        slot.uploaded = true;
        slot.previewUrl = this.resolvePhotoUrl(uploaded.url);

      } catch (e) {
        this.snackbar.openSnackBar(`Failed to upload photo ${this.slots.indexOf(slot) + 1}. Continuing...`, 'error');
      }

      slot.uploading = false;
      done++;
      this.uploadProgress = Math.round((done / toUpload.length) * 100);
      this.cdr.detectChanges();
    }

    this.uploadingAll = false;
    const failedCount = this.slots.filter(s => (s.rawFile || s.croppedBlob) && !s.uploaded).length;
    if (failedCount > 0) {
      this.snackbar.openSnackBar(
        `${failedCount} photo(s) failed to upload. Retry or remove them.`, 'error');
      return false;
    }
    this.cdr.detectChanges();
    return true;
  }

  // ── Save to backend ───────────────────────────────────────────────────────
  async updateTrainerPhotoAlbum(): Promise<void> {
    if (this.photoCount < this.MIN_PHOTOS) {
      this.invalidForm = true;
      this.snackbar.openSnackBar(`Please select at least ${this.MIN_PHOTOS} photos.`, 'error');
      return;
    }

    if (this.updateTrainerPhotoAlbumForm.get('comment')?.invalid) {
      this.invalidForm = true;
      this.updateTrainerPhotoAlbumForm.markAllAsTouched();
      this.snackbar.openSnackBar('Please add a photo inspiration (min. 500 characters).', 'error');
      return;
    }
    this.loader.start();

    // Upload any new/changed photos first, then save album with returned Strapi IDs
    const uploadSuccess = await this.uploadAllToStrapi();
    if (!uploadSuccess) {
      return;
    }

    // After all uploads finish, gather uploaded photos for payload 
    const uploadedPhotos = this.slots
      .filter(s => s.uploaded && s.uploadedResponse)
      .map(s => s.uploadedResponse!);

    const payload = {
      id: this.updateTrainerPhotoAlbumForm.get('id')?.value,
      trainerId: this.updateTrainerPhotoAlbumForm.get('trainerId')?.value,
      comment: this.updateTrainerPhotoAlbumForm.get('comment')?.value,
      photos: uploadedPhotos
    };


    const request$ = payload.id
      ? this.trainerService.updateTrainerPhotosAlbum(payload)
      : this.trainerService.addTrainerPhotosAlbum(payload);

    request$.pipe(take(1)).subscribe({
      next: (res: any) => {
        this.snackbar.openSnackBar(res?.message || 'Saved successfully', '');
        this.emitEvent.emit();
        this.loader.stop();
        this.clear(res);
      },
      error: (err: any) => {
        this.snackbar.openSnackBar(err?.error?.message || genericError, 'error');
        this.loader.stop();
      }
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private clear(updated: any): void {
    this.updateTrainerPhotoAlbumForm.patchValue({
      id: updated.id,
      comment: updated.comment
    });
    this.updateTrainerPhotoAlbumForm.markAsPristine();
    this.updateTrainerPhotoAlbumForm.markAsUntouched();
    this.originalValue = this.updateTrainerPhotoAlbumForm.getRawValue();
    this.invalidForm = false;
    this.cdr.detectChanges();
    this.markAsSaved(); // update canSaveAll state
  }

  private markAsSaved(): void {
    this.originalValue =
      structuredClone(this.updateTrainerPhotoAlbumForm.getRawValue());

    if (this.trainerPhotoAlbum) {
      this.trainerPhotoAlbum.photos =
        this.slots
          .filter(s => s.uploadedResponse)
          .map(s => s.uploadedResponse!);
    }
  }
  
  private resolvePhotoUrl(url?: string): string {
    if (!url?.trim()) return '';
    if (url.startsWith('blob:') || url.startsWith('http')) return url;
    return `http://localhost:1337${url}`;
  }

  hasChanges(): boolean {

    const formChanged =
      JSON.stringify(this.updateTrainerPhotoAlbumForm.getRawValue()) !==
      JSON.stringify(this.originalValue);

    const photosChanged =
      JSON.stringify(
        this.slots
          .filter(s => s.previewUrl)
          .map(s => s.uploadedResponse?.strapiId ?? 'NEW')
      ) !==
      JSON.stringify(
        (this.trainerPhotoAlbum?.photos || [])
          .map(p => p.strapiId)
      );

    return formChanged || photosChanged;
  }

  formatDate(date: any): string {
    return this.datePipe.transform(new Date(date), 'dd/MM/yyyy') ?? '';
  }

  get commentControl() {
    return this.updateTrainerPhotoAlbumForm.get('comment');
  }
}