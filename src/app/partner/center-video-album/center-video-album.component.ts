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
import { VideoResponse } from 'src/app/models/Media.interface';
import { Centers, CenterVideoAlbum } from 'src/app/models/centers.interface';
import { CenterService } from 'src/app/services/center.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { StrapiService } from 'src/app/services/strapi.service';
import { resolveStrapiUrl } from 'src/app/utils/strapi-url.util';
import { loadMyCenterVideoAlbums } from 'src/app/state/center/center.actions';
import { selectMyCenterVideoAlbums } from 'src/app/state/center/center.selectors';
import { genericError } from 'src/validators/form-validators.module';

interface VideoSlot {
  rawFile: File | null;
  previewUrl: string;
  uploaded: boolean;
  uploadedResponse: VideoResponse | null;
  uploading: boolean;
}

@Component({
  selector: 'app-center-video-album',
  templateUrl: './center-video-album.component.html',
  styleUrls: ['./center-video-album.component.css']
})
export class CenterVideoAlbumComponent implements OnInit, OnChanges, OnDestroy {

  @Input() center!: Centers | null;
  @Output() emitEvent = new EventEmitter();

  centerVideoAlbum: CenterVideoAlbum | null = null;
  updateCenterVideoAlbumForm!: FormGroup;

  readonly MAX_VIDEOS = 12;
  readonly MIN_VIDEOS = 3;
  readonly MAX_FILE_MB = 100;
  readonly MIN_COMMENT = 100;
  readonly MAX_COMMENT = 1200;

  slots: VideoSlot[] = [];

  invalidForm = false;
  originalValue: any;

  uploadingAll = false;
  uploadProgress = 0;

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
    if (!this.updateCenterVideoAlbumForm) {
      this.initSlots();
      this.initForm();
    }
    this.handleEmitEvent();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['center']?.currentValue && this.updateCenterVideoAlbumForm) {
      this.updateCenterVideoAlbumForm.patchValue({ centerId: this.center?.id });
      this.originalValue = this.updateCenterVideoAlbumForm.getRawValue();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.slots.forEach(s => { if (s.previewUrl?.startsWith('blob:')) URL.revokeObjectURL(s.previewUrl); });
  }

  handleEmitEvent(): void {
    this.store.dispatch(loadMyCenterVideoAlbums());
    this.subscriptions.push(
      this.store.select(selectMyCenterVideoAlbums).subscribe(albums => {
        this.centerVideoAlbum = albums?.[0] ?? null;
        this.initSlots();
        this.initForm();
        this.cdr.detectChanges();
      })
    );
  }

  private initSlots(): void {
    this.slots = Array.from({ length: this.MAX_VIDEOS }, () => this.emptySlot());

    this.centerVideoAlbum?.videos?.forEach((video, i) => {
      if (i < this.MAX_VIDEOS) {
        this.slots[i].previewUrl = this.resolveVideoUrl(video.videoUrl ?? '');
        this.slots[i].uploaded = true;
        this.slots[i].uploadedResponse = video;
      }
    });
  }

  private initForm(): void {
    if (this.updateCenterVideoAlbumForm) {
      this.updateCenterVideoAlbumForm.patchValue({
        id: this.centerVideoAlbum?.id ?? null,
        centerId: this.centerVideoAlbum?.centerId ?? this.center?.id ?? null,
        comment: this.centerVideoAlbum?.comment ?? ''
      });
    } else {
      this.updateCenterVideoAlbumForm = this.fb.group({
        id: [this.centerVideoAlbum?.id ?? null],
        centerId: [this.centerVideoAlbum?.centerId ?? this.center?.id ?? null],
        comment: [
          this.centerVideoAlbum?.comment ?? '',
          [Validators.required, Validators.minLength(this.MIN_COMMENT), Validators.maxLength(this.MAX_COMMENT)]
        ]
      });
    }

    this.updateCenterVideoAlbumForm.markAsPristine();
    this.updateCenterVideoAlbumForm.markAsUntouched();
    this.originalValue = this.updateCenterVideoAlbumForm.getRawValue();
  }

  private emptySlot(): VideoSlot {
    return { rawFile: null, previewUrl: '', uploaded: false, uploadedResponse: null, uploading: false };
  }

  get commentControl() {
    return this.updateCenterVideoAlbumForm?.get('comment');
  }

  get commentLength(): number {
    return this.commentControl?.value?.length || 0;
  }

  get filledSlots(): VideoSlot[] {
    return this.slots.filter(s => s.previewUrl || s.rawFile);
  }

  get videoCount(): number {
    return this.filledSlots.length;
  }

  onVideosSelected(event: any): void {
    const files: FileList = event.target.files;
    if (!files?.length) return;

    const available = this.MAX_VIDEOS - this.videoCount;

    Array.from(files).slice(0, available).forEach(file => {
      const fileMB = file.size / 1024 / 1024;
      if (fileMB > this.MAX_FILE_MB) {
        this.snackbar.openSnackBar(
          `${file.name} is too large (${fileMB.toFixed(1)} MB). Max is ${this.MAX_FILE_MB} MB.`, 'error');
        return;
      }

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

  slotIndex(slot: VideoSlot): number {
    return this.slots.indexOf(slot);
  }

  hasChanges(): boolean {
    if (!this.updateCenterVideoAlbumForm) return false;

    const formChanged =
      JSON.stringify(this.updateCenterVideoAlbumForm.getRawValue()) !== JSON.stringify(this.originalValue);

    const videosChanged =
      JSON.stringify(this.filledSlots.map(s => s.uploadedResponse?.strapiId ?? 'NEW')) !==
      JSON.stringify((this.centerVideoAlbum?.videos ?? []).map(v => v.strapiId));

    return formChanged || videosChanged;
  }

  get canSave(): boolean {
    return this.videoCount >= this.MIN_VIDEOS
      && !!this.updateCenterVideoAlbumForm?.valid
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
          publicId: '',
          videoUrl: uploaded.url,
          secureUrl: uploaded.url,
          playbackUrl: uploaded.url,
          name: uploaded.name ?? slot.rawFile!.name,
          mimeType: uploaded.mime ?? slot.rawFile!.type,
          format: uploaded.mime ?? slot.rawFile!.type,
          byteSize: uploaded.size ?? slot.rawFile!.size,
          duration: 0,
          mediaOwnerType: MediaOwnerType.CENTER_VIDEO_ALBUM,
          ownerId: 0,
          date: new Date(),
          lastUpdate: new Date()
        };

        slot.uploaded = true;
        slot.previewUrl = this.resolveVideoUrl(uploaded.url);
        slot.rawFile = null;

      } catch {
        this.snackbar.openSnackBar(
          `Video ${this.slots.indexOf(slot) + 1} failed to upload. Retry or remove it.`, 'error');
      }

      slot.uploading = false;
      done++;
      this.uploadProgress = Math.round((done / toUpload.length) * 100);
      this.cdr.detectChanges();
    }

    this.uploadingAll = false;

    const failed = this.slots.filter(s => s.rawFile && !s.uploaded).length;
    if (failed > 0) {
      this.snackbar.openSnackBar(`${failed} video(s) failed to upload.`, 'error');
      return false;
    }

    this.cdr.detectChanges();
    return true;
  }

  async updateCenterVideoAlbum(): Promise<void> {
    if (this.videoCount < this.MIN_VIDEOS) {
      this.invalidForm = true;
      this.snackbar.openSnackBar(`Please select at least ${this.MIN_VIDEOS} videos.`, 'error');
      return;
    }

    if (this.updateCenterVideoAlbumForm.invalid) {
      this.invalidForm = true;
      this.updateCenterVideoAlbumForm.markAllAsTouched();
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
      id: this.updateCenterVideoAlbumForm.get('id')?.value,
      centerId: this.updateCenterVideoAlbumForm.get('centerId')?.value,
      comment: this.updateCenterVideoAlbumForm.get('comment')?.value,
      videos: this.slots.filter(s => s.uploaded && s.uploadedResponse).map(s => s.uploadedResponse!)
    };

    const request$ = payload.id
      ? this.centerService.updateVideoAlbum(payload)
      : this.centerService.addVideoAlbum(payload);

    request$.pipe(take(1)).subscribe({
      next: (response: any) => {
        this.snackbar.openSnackBar(response?.message || 'Saved successfully', '');
        this.clear(response?.data ?? response);
        this.store.dispatch(loadMyCenterVideoAlbums());
        this.emitEvent.emit();
        this.loader.stop();
      },
      error: (err: any) => {
        this.snackbar.openSnackBar(err?.error?.message || genericError, 'error');
        this.loader.stop();
      }
    });
  }

  private clear(updated: CenterVideoAlbum): void {
    if (updated?.id) {
      this.centerVideoAlbum = updated;
      this.updateCenterVideoAlbumForm.patchValue({
        id: updated.id,
        centerId: updated.centerId,
        comment: updated.comment
      });
    }

    if (this.centerVideoAlbum) {
      this.centerVideoAlbum.videos =
        this.slots.filter(s => s.uploadedResponse).map(s => s.uploadedResponse!);
    }

    this.invalidForm = false;
    this.updateCenterVideoAlbumForm.markAsPristine();
    this.updateCenterVideoAlbumForm.markAsUntouched();
    this.updateCenterVideoAlbumForm.updateValueAndValidity();
    this.originalValue = this.updateCenterVideoAlbumForm.getRawValue();
    this.cdr.detectChanges();
  }

  onVideoError(event: any): void {
    (event.target as HTMLVideoElement).poster = 'assets/avatar.png';
  }

  private resolveVideoUrl(url?: string): string {
    return resolveStrapiUrl(url);
  }

  formatDate(date: any): string {
    return this.datePipe.transform(new Date(date), 'dd/MM/yyyy') ?? '';
  }
}
