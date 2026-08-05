import { DatePipe } from '@angular/common';
import {
  ChangeDetectorRef, Component, EventEmitter, Input,
  OnChanges, OnDestroy, OnInit, Output, SimpleChanges
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription, take } from 'rxjs';
import { MediaOwnerType } from 'src/app/models/Media.enum';
import { PhotoResponse } from 'src/app/models/Media.interface';
import { Centers, CenterPhotoAlbum } from 'src/app/models/centers.interface';
import { CenterService } from 'src/app/services/center.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { StrapiService } from 'src/app/services/strapi.service';
import { loadMyCenterPhotoAlbums } from 'src/app/state/center/center.actions';
import { selectMyCenterPhotoAlbums } from 'src/app/state/center/center.selectors';
import { genericError } from 'src/validators/form-validators.module';

interface PhotoSlot {
  rawFile: File | null;
  previewUrl: string;
  uploaded: boolean;
  uploadedResponse: PhotoResponse | null;
  uploading: boolean;
}

@Component({
  selector: 'app-center-photo-album',
  templateUrl: './center-photo-album.component.html',
  styleUrls: ['./center-photo-album.component.css']
})
export class CenterPhotoAlbumComponent implements OnInit, OnChanges, OnDestroy {

  @Input() center!: Centers | null;
  @Output() emitEvent = new EventEmitter();

  centerPhotoAlbum: CenterPhotoAlbum | null = null;
  updateCenterPhotoAlbumForm!: FormGroup;

  readonly MAX_PHOTOS = 15;
  readonly MIN_PHOTOS = 6;
  readonly MIN_COMMENT = 100;
  readonly MAX_COMMENT = 1200;

  slots: PhotoSlot[] = [];

  invalidForm = false;
  originalValue: any;

  uploadingAll = false;
  uploadProgress = 0;

  showPreviewModal = false;
  previewModalUrl = '';

  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private loader: NgxUiLoaderService,
    private snackbar: SnackBarService,
    private centerService: CenterService,
    private strapiService: StrapiService,
    private datePipe: DatePipe,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    if (!this.updateCenterPhotoAlbumForm) {
      this.initSlots();
      this.initForm();
    }
    this.handleEmitEvent();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['center']?.currentValue && this.updateCenterPhotoAlbumForm) {
      this.updateCenterPhotoAlbumForm.patchValue({ centerId: this.center?.id });
      this.originalValue = this.updateCenterPhotoAlbumForm.getRawValue();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.slots.forEach(s => { if (s.previewUrl?.startsWith('blob:')) URL.revokeObjectURL(s.previewUrl); });
  }

  handleEmitEvent(): void {
    this.store.dispatch(loadMyCenterPhotoAlbums());
    this.subscriptions.push(
      this.store.select(selectMyCenterPhotoAlbums).subscribe(albums => {
        this.centerPhotoAlbum = albums?.[0] ?? null;
        this.initSlots();
        this.initForm();
        this.cdr.detectChanges();
      })
    );
  }

  private initSlots(): void {
    this.slots = Array.from({ length: this.MAX_PHOTOS }, () => this.emptySlot());

    this.centerPhotoAlbum?.photos?.forEach((photo, i) => {
      if (i < this.MAX_PHOTOS) {
        this.slots[i].previewUrl = this.resolvePhotoUrl(photo.photoUrl ?? '');
        this.slots[i].uploaded = true;
        this.slots[i].uploadedResponse = photo;
      }
    });
  }

  private initForm(): void {
    if (this.updateCenterPhotoAlbumForm) {
      this.updateCenterPhotoAlbumForm.patchValue({
        id: this.centerPhotoAlbum?.id ?? null,
        centerId: this.centerPhotoAlbum?.centerId ?? this.center?.id ?? null,
        comment: this.centerPhotoAlbum?.comment ?? ''
      });
    } else {
      this.updateCenterPhotoAlbumForm = this.fb.group({
        id: [this.centerPhotoAlbum?.id ?? null],
        centerId: [this.centerPhotoAlbum?.centerId ?? this.center?.id ?? null],
        comment: [
          this.centerPhotoAlbum?.comment ?? '',
          [Validators.required, Validators.minLength(this.MIN_COMMENT), Validators.maxLength(this.MAX_COMMENT)]
        ]
      });
    }

    this.updateCenterPhotoAlbumForm.markAsPristine();
    this.updateCenterPhotoAlbumForm.markAsUntouched();
    this.originalValue = this.updateCenterPhotoAlbumForm.getRawValue();
  }

  private emptySlot(): PhotoSlot {
    return { rawFile: null, previewUrl: '', uploaded: false, uploadedResponse: null, uploading: false };
  }

  get commentControl() {
    return this.updateCenterPhotoAlbumForm?.get('comment');
  }

  get commentLength(): number {
    return this.commentControl?.value?.length || 0;
  }

  get filledSlots(): PhotoSlot[] {
    return this.slots.filter(s => s.previewUrl || s.rawFile);
  }

  get photoCount(): number {
    return this.filledSlots.length;
  }

  onPhotosSelected(event: any): void {
    const files: FileList = event.target.files;
    if (!files?.length) return;

    const available = this.MAX_PHOTOS - this.photoCount;
    Array.from(files).slice(0, available).forEach(file => {
      const idx = this.slots.findIndex(s => !s.rawFile && !s.previewUrl);
      if (idx === -1) return;
      this.slots[idx].rawFile = file;
      this.slots[idx].previewUrl = URL.createObjectURL(file);
      this.slots[idx].uploaded = false;
      this.slots[idx].uploadedResponse = null;
    });

    (event.target as HTMLInputElement).value = '';
    this.cdr.detectChanges();
  }

  removeSlot(index: number): void {
    const slot = this.slots[index];
    if (slot.previewUrl?.startsWith('blob:')) URL.revokeObjectURL(slot.previewUrl);
    this.slots[index] = this.emptySlot();
    this.cdr.detectChanges();
  }

  openPreview(url: string): void {
    this.previewModalUrl = url;
    this.showPreviewModal = true;
  }

  hasChanges(): boolean {
    if (!this.updateCenterPhotoAlbumForm) return false;

    const formChanged =
      JSON.stringify(this.updateCenterPhotoAlbumForm.getRawValue()) !== JSON.stringify(this.originalValue);

    const photosChanged =
      JSON.stringify(this.filledSlots.map(s => s.uploadedResponse?.strapiId ?? 'NEW')) !==
      JSON.stringify((this.centerPhotoAlbum?.photos ?? []).map(p => p.strapiId));

    return formChanged || photosChanged;
  }

  get canSave(): boolean {
    return this.photoCount >= this.MIN_PHOTOS
      && !!this.updateCenterPhotoAlbumForm?.valid
      && !this.uploadingAll
      && this.hasChanges();
  }

  private async uploadAllToStrapi(): Promise<boolean> {
    const toUpload = this.slots.filter(s => s.rawFile && !s.uploaded);
    if (toUpload.length === 0) return true;

    this.uploadingAll = true;
    this.uploadProgress = 0;
    this.cdr.detectChanges();

    let done = 0;

    for (const slot of toUpload) {
      slot.uploading = true;
      this.cdr.detectChanges();

      try {
        const res: any[] = (await this.strapiService.uploadToStrapi(slot.rawFile!).pipe(take(1)).toPromise()) ?? [];
        const uploaded = res?.[0];
        if (!uploaded?.url) throw new Error('No URL returned from Strapi');

        slot.uploadedResponse = {
          id: 0,
          strapiId: uploaded.id,
          photoUrl: uploaded.url,
          name: uploaded.name,
          mimeType: uploaded.mime,
          byteSize: uploaded.size,
          ownerId: 0,
          mediaOwnerType: MediaOwnerType.CENTER_PHOTO_ALBUM,
          date: new Date(),
          lastUpdate: new Date()
        };

        slot.uploaded = true;
        slot.previewUrl = this.resolvePhotoUrl(uploaded.url);
        slot.rawFile = null;

      } catch {
        this.snackbar.openSnackBar(
          `Photo ${this.slots.indexOf(slot) + 1} failed to upload. Retry or remove it.`, 'error');
      }

      slot.uploading = false;
      done++;
      this.uploadProgress = Math.round((done / toUpload.length) * 100);
      this.cdr.detectChanges();
    }

    this.uploadingAll = false;

    const failed = this.slots.filter(s => s.rawFile && !s.uploaded).length;
    if (failed > 0) {
      this.snackbar.openSnackBar(`${failed} photo(s) failed to upload.`, 'error');
      return false;
    }

    this.cdr.detectChanges();
    return true;
  }

  async updateCenterPhotoAlbum(): Promise<void> {
    if (this.photoCount < this.MIN_PHOTOS) {
      this.invalidForm = true;
      this.snackbar.openSnackBar(`Please select at least ${this.MIN_PHOTOS} photos.`, 'error');
      return;
    }

    if (this.updateCenterPhotoAlbumForm.invalid) {
      this.invalidForm = true;
      this.updateCenterPhotoAlbumForm.markAllAsTouched();
      this.snackbar.openSnackBar(`Please add a comment (min. ${this.MIN_COMMENT} characters).`, 'error');
      return;
    }

    this.loader.start();

    const uploaded = await this.uploadAllToStrapi();
    if (!uploaded) {
      this.loader.stop();
      return;
    }

    const payload = {
      id: this.updateCenterPhotoAlbumForm.get('id')?.value,
      centerId: this.updateCenterPhotoAlbumForm.get('centerId')?.value,
      comment: this.updateCenterPhotoAlbumForm.get('comment')?.value,
      photos: this.slots.filter(s => s.uploaded && s.uploadedResponse).map(s => s.uploadedResponse!)
    };

    const request$ = payload.id
      ? this.centerService.updatePhotoAlbum(payload)
      : this.centerService.addPhotoAlbum(payload);

    request$.pipe(take(1)).subscribe({
      next: (response: any) => {
        this.snackbar.openSnackBar(response?.message || 'Saved successfully', '');
        this.clear(response?.data ?? response);
        this.store.dispatch(loadMyCenterPhotoAlbums());
        this.emitEvent.emit();
        this.loader.stop();
      },
      error: (err: any) => {
        this.snackbar.openSnackBar(err?.error?.message || genericError, 'error');
        this.loader.stop();
      }
    });
  }

  private clear(updated: CenterPhotoAlbum): void {
    if (updated?.id) {
      this.centerPhotoAlbum = updated;
      this.updateCenterPhotoAlbumForm.patchValue({
        id: updated.id,
        centerId: updated.centerId,
        comment: updated.comment
      });
    }

    if (this.centerPhotoAlbum) {
      this.centerPhotoAlbum.photos =
        this.slots.filter(s => s.uploadedResponse).map(s => s.uploadedResponse!);
    }

    this.invalidForm = false;
    this.updateCenterPhotoAlbumForm.markAsPristine();
    this.updateCenterPhotoAlbumForm.markAsUntouched();
    this.updateCenterPhotoAlbumForm.updateValueAndValidity();
    this.originalValue = this.updateCenterPhotoAlbumForm.getRawValue();
    this.cdr.detectChanges();
  }

  private resolvePhotoUrl(url?: string): string {
    if (!url?.trim()) return '';
    if (url.startsWith('blob:') || url.startsWith('http')) return url;
    return `http://localhost:1337${url}`;
  }

  formatDate(date: any): string {
    return this.datePipe.transform(new Date(date), 'dd/MM/yyyy') ?? '';
  }
}
