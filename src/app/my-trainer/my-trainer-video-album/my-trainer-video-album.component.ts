import { DatePipe } from '@angular/common';
import {
  ChangeDetectorRef, Component, EventEmitter, Input,
  OnChanges, OnDestroy, OnInit, Output, SimpleChanges
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription, take } from 'rxjs';
import { TrainerVideoAlbum } from 'src/app/models/trainers.interface';
import { MediaOwnerType } from 'src/app/models/Media.enum';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TrainerService } from 'src/app/services/trainer.service';
import { StrapiService } from 'src/app/services/strapi.service';
import { resolveStrapiUrl } from 'src/app/utils/strapi-url.util';
import { genericError } from 'src/validators/form-validators.module';
import { VideoResponse } from 'src/app/models/Media.interface';
import { Store } from '@ngrx/store';

interface VideoSlotItem {
  rawFile: File | null;
  previewUrl: string;
  uploaded: boolean;
  uploadedResponse: VideoResponse | null;
  uploading: boolean;
  touched: boolean;
}

type TrimStep = 'idle' | 'trimming' | 'previewing' | 'size-warning' | 'uploading-single';

@Component({
  selector: 'app-my-trainer-video-album',
  templateUrl: './my-trainer-video-album.component.html',
  styleUrls: ['./my-trainer-video-album.component.css']
})
export class MyTrainerVideoAlbumComponent implements OnInit, OnChanges, OnDestroy {

  @Input() trainerVideoAlbum!: TrainerVideoAlbum | null;
  @Output() emitEvent = new EventEmitter();

  // ── Form ──────────────────────────────────────────────────────────────────
  updateTrainerVideoAlbumForm!: FormGroup;
  invalidForm = false;
  originalValue: any;

  // ── Constants ─────────────────────────────────────────────────────────────
  readonly MAX_VIDEOS = 12;
  readonly MIN_VIDEOS = 6;
  readonly MAX_FILE_MB = 100;
  readonly MIN_DURATION = 15;
  readonly MAX_DURATION = 30;
  readonly Math = Math;

  // ── Slots ─────────────────────────────────────────────────────────────────
  slots: VideoSlotItem[] = [];

  // ── Preview modal ─────────────────────────────────────────────────────────
  showPreviewModal = false;
  previewModalUrl = '';

  // ── Trim / editor state ───────────────────────────────────────────────────
  trimStep: TrimStep = 'idle';
  activeSlotIndex = -1;           // which slot is being trimmed
  trimRawFile: File | null = null;    // original selected file
  processedFile: File | null = null;  // result of trim
  editorPreviewUrl = '';           // blob url shown in trim player
  videoPreviewUrl = '';           // blob url shown in preview step
  videoDuration = 0;
  trimStart = 0;
  trimEnd = 30;
  trimError = '';
  overSizeMB = 0;
  processingVideo = false;
  optimizing = false;

  // ── Upload-all state ──────────────────────────────────────────────────────
  uploadingAll = false;
  uploadProgress = 0;

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
    if (changes['trainerVideoAlbum']?.currentValue) {
      this.initSlots();
      this.initForm();
      this.cdr.detectChanges();
    }
  }

  ngOnInit(): void {
    if (!this.updateTrainerVideoAlbumForm) {
      this.initSlots();
      this.initForm();
    }
  }

  private initSlots(): void {
    this.slots = Array.from({ length: this.MAX_VIDEOS }, () => this.emptySlot());

    if (this.trainerVideoAlbum?.videos?.length) {
      this.trainerVideoAlbum.videos.forEach((v, i) => {
        if (i < this.MAX_VIDEOS) {
          this.slots[i].previewUrl = this.resolveVideoUrl(v.videoUrl ?? '');
          this.slots[i].uploaded = true;
          this.slots[i].uploadedResponse = v;
          this.slots[i].touched = false;
        }
      });
    }
  }

  private initForm(): void {
    if (this.updateTrainerVideoAlbumForm) {
      this.updateTrainerVideoAlbumForm.patchValue({
        id: this.trainerVideoAlbum?.id,
        comment: this.trainerVideoAlbum?.comment || '',
        trainerId: this.trainerVideoAlbum?.trainerId
      });
    } else {
      this.updateTrainerVideoAlbumForm = this.fb.group({
        id: [this.trainerVideoAlbum?.id],
        comment: [
          this.trainerVideoAlbum?.comment || '',
          [Validators.required, Validators.minLength(900)]
        ],
        trainerId: [this.trainerVideoAlbum?.trainerId]
      });
    }
    this.originalValue = this.updateTrainerVideoAlbumForm.getRawValue();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.slots.forEach(s => { if (s.previewUrl?.startsWith('blob:')) URL.revokeObjectURL(s.previewUrl); });
    this.revokeBlobUrl(this.editorPreviewUrl);
    this.revokeBlobUrl(this.videoPreviewUrl);
  }

  // ── Slot helpers ──────────────────────────────────────────────────────────

  private emptySlot(): VideoSlotItem {
    return { rawFile: null, previewUrl: '', uploaded: false, uploadedResponse: null, uploading: false, touched: false };
  }

  get videoCount(): number { return this.slots.filter(s => s.previewUrl || s.rawFile).length; }
  get uploadedCount(): number { return this.slots.filter(s => s.uploaded).length; }

  get allUploaded(): boolean {
    return this.slots.filter(s => s.rawFile || s.previewUrl).every(s => s.uploaded);
  }

  get formReady(): boolean {
    return this.videoCount >= this.MIN_VIDEOS &&
      this.updateTrainerVideoAlbumForm.valid &&
      !this.uploadingAll;
  }

  get canSaveAll(): boolean { return this.formReady && this.hasChanges(); }

  // ── File selection (triggers trimmer) ────────────────────────────────────

  onVideoSelected(event: any, slotIndex: number): void {
    const file: File = event.target.files?.[0];
    if (!file) return;

    const fileMB = file.size / 1024 / 1024;
    if (fileMB > this.MAX_FILE_MB) {
      this.snackbar.openSnackBar(
        `${file.name} is too large (${fileMB.toFixed(1)} MB). Max is ${this.MAX_FILE_MB} MB.`, 'error');
      (event.target as HTMLInputElement).value = '';
      return;
    }

    // Open trimmer for this slot
    this.activeSlotIndex = slotIndex;
    this.trimRawFile = file;
    this.processedFile = null;
    this.trimStart = 0;
    this.trimEnd = this.MAX_DURATION;
    this.trimError = '';
    this.revokeBlobUrl(this.editorPreviewUrl);
    this.editorPreviewUrl = URL.createObjectURL(file);
    this.trimStep = 'trimming';
    this.cdr.detectChanges();

    (event.target as HTMLInputElement).value = '';
  }

  // open trimmer for an already-filled slot (re-trim / replace)
  openTrimmerForSlot(index: number): void {
    const slot = this.slots[index];
    if (!slot.rawFile) return;   // existing saved video — no raw file available

    this.activeSlotIndex = index;
    this.trimRawFile = slot.rawFile;
    this.processedFile = null;
    this.trimStart = 0;
    this.trimEnd = this.MAX_DURATION;
    this.trimError = '';
    this.revokeBlobUrl(this.editorPreviewUrl);
    this.editorPreviewUrl = URL.createObjectURL(slot.rawFile);
    this.trimStep = 'trimming';
    this.cdr.detectChanges();
  }

  // ── Remove ────────────────────────────────────────────────────────────────

  removeSlot(index: number): void {
    const slot = this.slots[index];
    if (slot.previewUrl?.startsWith('blob:')) URL.revokeObjectURL(slot.previewUrl);
    this.slots[index] = this.emptySlot();
    this.cdr.detectChanges();
  }

  removeAll(): void {
    this.slots.forEach(s => { if (s.previewUrl?.startsWith('blob:')) URL.revokeObjectURL(s.previewUrl); });
    this.slots = Array.from({ length: this.MAX_VIDEOS }, () => this.emptySlot());
    this.cdr.detectChanges();
  }

  // ── Preview modal ─────────────────────────────────────────────────────────

  openPreview(url: string): void { this.previewModalUrl = url; this.showPreviewModal = true; }

  onVideoError(event: any): void {
    (event.target as HTMLVideoElement).src = 'assets/videos/demo_ok.mp4';
  }

  // ── Trim helpers ──────────────────────────────────────────────────────────

  onVideoMetaLoaded(event: Event): void {
    const vid = event.target as HTMLVideoElement;
    vid.muted = true;
    vid.volume = 0;
    this.videoDuration = parseFloat(vid.duration.toFixed(1));
    this.trimEnd = Math.min(this.videoDuration, this.MAX_DURATION);
    this.validateTrim();
    this.cdr.detectChanges();
  }

  validateTrim(): void {
    const dur = parseFloat((this.trimEnd - this.trimStart).toFixed(1));
    if (dur < this.MIN_DURATION)
      this.trimError = `Minimum ${this.MIN_DURATION}s required. Currently ${dur}s.`;
    else if (dur > this.MAX_DURATION)
      this.trimError = `Maximum ${this.MAX_DURATION}s allowed. Currently ${dur}s.`;
    else
      this.trimError = '';
  }

  get trimDuration(): number {
    return parseFloat((this.trimEnd - this.trimStart).toFixed(1));
  }

  get trimValid(): boolean {
    return !this.trimError &&
      this.trimDuration >= this.MIN_DURATION &&
      this.trimDuration <= this.MAX_DURATION;
  }

  cancelTrimmer(): void {
    this.trimStep = 'idle';
    this.activeSlotIndex = -1;
    this.trimRawFile = null;
    this.processedFile = null;
    this.revokeBlobUrl(this.editorPreviewUrl);
    this.editorPreviewUrl = '';
    this.cdr.detectChanges();
  }

  backToTrim(): void {
    this.trimStep = 'trimming';
    this.processedFile = null;
    this.cdr.detectChanges();
  }

  // ── Process (MediaRecorder trim + mute) ───────────────────────────────────

  async processAndPreview(): Promise<void> {
    if (!this.trimRawFile || !this.trimValid) return;

    const videoEl = document.getElementById('albumTrimPreview') as HTMLVideoElement | null;
    if (!videoEl) { this.snackbar.openSnackBar('Video element not ready.', 'error'); return; }

    const canCapture = 'captureStream' in videoEl || 'mozCaptureStream' in videoEl;
    if (!canCapture) {
      // Fallback: skip trim, use original
      this.processedFile = this.trimRawFile;
      this.videoPreviewUrl = URL.createObjectURL(this.trimRawFile);
      this.trimStep = 'previewing';
      this.cdr.detectChanges();
      return;
    }

    try {
      this.processingVideo = true;
      this.trimStep = 'previewing';
      this.cdr.detectChanges();

      videoEl.currentTime = this.trimStart;
      videoEl.muted = true;
      videoEl.volume = 0;

      await new Promise<void>((res, rej) => {
        const t = setTimeout(() => rej(new Error('Seek timeout')), 5000);
        videoEl.onseeked = () => { clearTimeout(t); res(); };
      });

      const stream: MediaStream =
        (videoEl as any).captureStream?.() ?? (videoEl as any).mozCaptureStream?.();
      // Strip all audio tracks to enforce mute
      stream.getAudioTracks().forEach(t => { t.stop(); stream.removeTrack(t); });

      const mimeType =
        MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' :
          MediaRecorder.isTypeSupported('video/webm;codecs=vp8') ? 'video/webm;codecs=vp8' :
            MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : 'video/mp4';

      const chunks: BlobPart[] = [];
      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 1_500_000 });
      recorder.ondataavailable = (e: BlobEvent) => { if (e.data?.size > 0) chunks.push(e.data); };

      const done = new Promise<Blob>((res, rej) => {
        recorder.onstop = () => res(new Blob(chunks, { type: mimeType }));
        recorder.onerror = rej;
      });

      recorder.start(100);
      videoEl.play();

      const endAt = this.trimEnd;
      await new Promise<void>(resolve => {
        const poll = setInterval(() => {
          if (videoEl.currentTime >= endAt || videoEl.ended) {
            clearInterval(poll);
            videoEl.pause();
            recorder.stop();
            stream.getTracks().forEach(t => t.stop());
            resolve();
          }
        }, 100);
      });

      const blob = await done;
      const outputMB = blob.size / 1024 / 1024;

      if (blob.size < 5000) {
        this.snackbar.openSnackBar('Trimmed video too small. Try again.', 'error');
        this.trimStep = 'trimming';
        return;
      }

      const ext = mimeType.includes('webm') ? 'webm' : 'mp4';
      this.processedFile = new File([blob], `album_${Date.now()}.${ext}`, { type: mimeType });
      this.revokeBlobUrl(this.videoPreviewUrl);
      this.videoPreviewUrl = URL.createObjectURL(this.processedFile);

      if (outputMB > this.MAX_FILE_MB) {
        this.overSizeMB = outputMB;
        this.trimStep = 'size-warning';
      } else {
        this.trimStep = 'previewing';
      }

    } catch (e) {
      console.error('[AlbumTrim]', e);
      this.processedFile = this.trimRawFile;
      this.videoPreviewUrl = URL.createObjectURL(this.trimRawFile!);
      this.trimStep = 'previewing';
    } finally {
      this.processingVideo = false;
      this.cdr.detectChanges();
    }
  }

  // ── Optimize (reduce bitrate) ─────────────────────────────────────────────

  async optimizeVideo(): Promise<void> {
    if (!this.processedFile) return;
    this.optimizing = true;
    this.cdr.detectChanges();

    try {
      const videoEl = document.createElement('video');
      videoEl.src = this.videoPreviewUrl;
      videoEl.muted = true;
      videoEl.volume = 0;
      await new Promise<void>(res => { videoEl.onloadedmetadata = () => res(); });

      const canCapture = 'captureStream' in videoEl || 'mozCaptureStream' in videoEl;
      if (!canCapture) { this.snackbar.openSnackBar('Optimization not supported.', 'error'); return; }

      videoEl.currentTime = 0;
      await new Promise<void>(res => { videoEl.onseeked = () => res(); });

      const stream: MediaStream =
        (videoEl as any).captureStream?.() ?? (videoEl as any).mozCaptureStream?.();
      stream.getAudioTracks().forEach(t => { t.stop(); stream.removeTrack(t); });

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9' : 'video/webm';

      const chunks: BlobPart[] = [];
      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 500_000 });
      recorder.ondataavailable = (e: BlobEvent) => { if (e.data?.size > 0) chunks.push(e.data); };

      const blob = await new Promise<Blob>((res, rej) => {
        recorder.onstop = () => res(new Blob(chunks, { type: mimeType }));
        recorder.onerror = rej;
        recorder.start(100);
        videoEl.play();
        videoEl.onended = () => { videoEl.pause(); recorder.stop(); stream.getTracks().forEach(t => t.stop()); };
      });

      const newMB = blob.size / 1024 / 1024;
      if (newMB > this.MAX_FILE_MB) {
        this.overSizeMB = newMB;
        this.snackbar.openSnackBar(`Still too large (${newMB.toFixed(1)} MB). Upload a new video.`, 'error');
        return;
      }

      const ext = mimeType.includes('webm') ? 'webm' : 'mp4';
      this.processedFile = new File([blob], `album_opt_${Date.now()}.${ext}`, { type: mimeType });
      this.revokeBlobUrl(this.videoPreviewUrl);
      this.videoPreviewUrl = URL.createObjectURL(this.processedFile);
      this.trimStep = 'previewing';
      this.snackbar.openSnackBar(`Optimized to ${newMB.toFixed(1)} MB ✓`, '');

    } catch { this.snackbar.openSnackBar('Optimization failed.', 'error'); }
    finally { this.optimizing = false; this.cdr.detectChanges(); }
  }

  rejectAndUploadNew(): void {
    this.processedFile = null;
    this.trimRawFile = null;
    this.editorPreviewUrl = '';
    this.trimStep = 'idle';
    this.activeSlotIndex = -1;
    this.cdr.detectChanges();
  }

  // ── Confirm trimmed video → commit to slot ────────────────────────────────

  // In confirmTrimmedVideo — also mark uploaded=false explicitly so it re-uploads
  confirmTrimmedVideo(): void {
    if (!this.processedFile || this.activeSlotIndex < 0) return;

    const slot = this.slots[this.activeSlotIndex];
    if (slot.previewUrl?.startsWith('blob:')) URL.revokeObjectURL(slot.previewUrl);

    slot.rawFile = this.processedFile;
    slot.previewUrl = URL.createObjectURL(this.processedFile);
    slot.uploaded = false;   // ← must be false so upload loop picks it up
    slot.uploadedResponse = null;
    slot.touched = true;

    this.trimStep = 'idle';
    this.activeSlotIndex = -1;
    this.trimRawFile = null;
    this.processedFile = null;
    this.revokeBlobUrl(this.editorPreviewUrl);
    this.revokeBlobUrl(this.videoPreviewUrl);
    this.editorPreviewUrl = '';
    this.videoPreviewUrl = '';
    this.cdr.detectChanges();
  }

  // ── Upload all to Strapi ──────────────────────────────────────────────────

  async uploadAllToStrapi(): Promise<boolean> {
    // Only pick slots that have a NEW local file not yet uploaded
    const toUpload = this.slots.filter(s => s.rawFile != null && !s.uploaded);

    if (this.videoCount < this.MIN_VIDEOS) {
      this.snackbar.openSnackBar(`Please select at least ${this.MIN_VIDEOS} videos.`, 'error');
      return false;
    }

    // Nothing new to upload — all existing/already-uploaded slots
    if (toUpload.length === 0) return true;

    this.uploadingAll = true;
    this.uploadProgress = 0;
    this.cdr.detectChanges();

    let done = 0;

    for (const slot of toUpload) {
      slot.uploading = true;
      this.cdr.detectChanges();

      try {
        // Wrap in firstValueFrom for reliability
        const res = await new Promise<any[]>((resolve, reject) => {
          this.strapiService.uploadToStrapi(slot.rawFile!)
            .pipe(take(1))
            .subscribe({ next: resolve, error: reject });
        });

        // Strapi returns array — grab first item
        const uploaded = Array.isArray(res) ? res[0] : res;

        if (!uploaded) throw new Error('Empty response from Strapi');
        if (!uploaded.url) throw new Error(`No URL in response: ${JSON.stringify(uploaded)}`);

        // Build response — only use fields that definitely exist
        slot.uploadedResponse = {
          id: 0,
          strapiId: uploaded.id,
          videoUrl: uploaded.url,
          name: uploaded.name ?? slot.rawFile!.name,
          mimeType: uploaded.mime ?? slot.rawFile!.type,
          byteSize: uploaded.size ?? slot.rawFile!.size,
          ownerId: 0,
          mediaOwnerType: MediaOwnerType.TRAINER_VIDEO_ALBUM,
          format: uploaded.mime ?? slot.rawFile!.type,
          duration: this.trimDuration,
          publicId: uploaded.publicId ?? '',
          secureUrl: uploaded.secureUrl ?? uploaded.url,
          playbackUrl: uploaded.playbackUrl ?? uploaded.url,
          date: new Date(),
          lastUpdate: uploaded.lastUpdate ? new Date(uploaded.lastUpdate) : new Date()
        };

        slot.uploaded = true;
        slot.previewUrl = this.resolveVideoUrl(uploaded.url);
        slot.rawFile = null;  // ← clear raw file after successful upload

      } catch (e: any) {
        console.error(`[VideoAlbum] Upload failed for slot ${this.slots.indexOf(slot) + 1}:`, e?.message ?? e);
        this.snackbar.openSnackBar(
          `Video ${this.slots.indexOf(slot) + 1} failed to upload. Check console for details.`, 'error');
      }

      slot.uploading = false;
      done++;
      this.uploadProgress = Math.round((done / toUpload.length) * 100);
      this.cdr.detectChanges();
    }

    this.uploadingAll = false;

    const failedCount = this.slots.filter(s => s.rawFile != null && !s.uploaded).length;
    if (failedCount > 0) {
      this.snackbar.openSnackBar(
        `${failedCount} video(s) failed to upload. Check console and retry.`, 'error');
      return false;
    }

    this.cdr.detectChanges();
    return true;
  }

  // ── Save to backend ───────────────────────────────────────────────────────

  async updateTrainerVideoAlbumFn(): Promise<void> {
    if (this.videoCount < this.MIN_VIDEOS) {
      this.invalidForm = true;
      this.snackbar.openSnackBar(`Please select at least ${this.MIN_VIDEOS} videos.`, 'error');
      return;
    }
    if (this.updateTrainerVideoAlbumForm.get('comment')?.invalid) {
      this.invalidForm = true;
      this.updateTrainerVideoAlbumForm.markAllAsTouched();
      this.snackbar.openSnackBar('Please add a comment (min. 500 characters).', 'error');
      return;
    }

    this.loader.start();
    const uploadSuccess = await this.uploadAllToStrapi();
    if (!uploadSuccess) { this.loader.stop(); return; }

    const uploadedVideos = this.slots
      .filter(s => s.uploaded && s.uploadedResponse)
      .map(s => s.uploadedResponse!);

    const payload = {
      id: this.updateTrainerVideoAlbumForm.get('id')?.value,
      trainerId: this.updateTrainerVideoAlbumForm.get('trainerId')?.value,
      comment: this.updateTrainerVideoAlbumForm.get('comment')?.value,
      videos: uploadedVideos,
    };

    const request$ = payload.id
      ? this.trainerService.updateTrainerVideosAlbum(payload)
      : this.trainerService.addTrainerVideosAlbum(payload);

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

  // ── Utilities ─────────────────────────────────────────────────────────────

  private clear(updated: TrainerVideoAlbum): void {
    // Update form
    this.updateTrainerVideoAlbumForm.patchValue({
      id: updated.id,
      comment: updated.comment
    });

    this.updateTrainerVideoAlbumForm.markAsPristine();
    this.updateTrainerVideoAlbumForm.markAsUntouched();
    this.originalValue = this.updateTrainerVideoAlbumForm.getRawValue();
    this.invalidForm = false;

    // ⭐ Replace old videos with the updated ones from backend
    if (this.trainerVideoAlbum) {
      this.trainerVideoAlbum.videos = updated.videos;
    }

    // ⭐ Re-populate slots with updated videos
    this.slots = this.slots.map((slot, index) => ({
      ...slot,
      uploadedResponse: updated.videos[index] ?? null
    }));

    this.cdr.detectChanges();
  }

  private resolveVideoUrl(url?: string): string {
    return resolveStrapiUrl(url) || 'assets/videos/demo_ok.mp4';
  }

  private revokeBlobUrl(url: string): void {
    if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
  }

  hasChanges(): boolean {
    const formChanged =
      JSON.stringify(this.updateTrainerVideoAlbumForm.getRawValue()) !==
      JSON.stringify(this.originalValue);

    const videosChanged =
      JSON.stringify(
        this.slots.filter(s => s.previewUrl).map(s => s.uploadedResponse?.strapiId ?? 'NEW')
      ) !==
      JSON.stringify(
        (this.trainerVideoAlbum?.videos || []).map(v => v.strapiId)
      );

    return formChanged || videosChanged;
  }

  formatDate(date: any): string {
    return this.datePipe.transform(new Date(date), 'dd/MM/yyyy') ?? '';
  }

  get commentControl() { return this.updateTrainerVideoAlbumForm.get('comment'); }

}

