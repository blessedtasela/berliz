import { DatePipe } from '@angular/common';
import {
  ChangeDetectorRef, Component, EventEmitter,
  Input, OnDestroy, OnInit, Output
} from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription, take } from 'rxjs';
import { TrainerFeatureVideo } from 'src/app/models/trainers.interface';
import { VideoResponse } from 'src/app/models/Media.interface';
import { MediaOwnerType } from 'src/app/models/Media.enum';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TrainerStateService } from 'src/app/services/trainer-state.service';
import { TrainerService } from 'src/app/services/trainer.service';
import { StrapiService } from 'src/app/services/strapi.service';
import { genericError } from 'src/validators/form-validators.module';
import { environment } from 'src/environments/environment';

type EditorStep = 'idle' | 'trimming' | 'previewing' | 'size-warning' | 'uploading';

export interface VideoSlot {
  savedId: number | null;
  previewUrl: string;
  uploaded: boolean;          // Strapi upload done this session
  videoResponse: VideoResponse | null;
  originalMotivation: string;
  touched: boolean;          // ← true once the user starts editing this slot
}

const TOTAL_SLOTS = 4;
@Component({
  selector: 'app-my-trainer-feature-videos',
  templateUrl: './my-trainer-feature-videos.component.html',
  styleUrls: ['./my-trainer-feature-videos.component.css']
})
export class MyTrainerFeatureVideosComponent {
  @Input() trainerFeatureVideos: TrainerFeatureVideo[] = [];
  @Output() emitEvent = new EventEmitter();

  featureVideosForm!: FormGroup;
  invalidForm = false;
  slots: VideoSlot[] = [];

  readonly defaultVideo = 'assets/videos/demo_ok.mp4';
  readonly MIN_DURATION = 15;
  readonly MAX_DURATION = 30;
  readonly MAX_FILE_MB = 50;
  readonly Math = Math;

  activeSlot: number | null = null;
  editorStep: EditorStep = 'idle';
  showPreviewModal = false;
  previewVideoUrl = '';
  processingVideo = false;
  optimizing = false;

  rawFile: File | null = null;
  processedFile: File | null = null;
  videoPreviewUrl = '';
  editorPreviewUrl = '';

  videoDuration = 0;
  trimStart = 0;
  trimEnd = 30;
  trimError = '';
  overSizeMB = 0;

  readonly motivationPlaceholders = [
    'Describe what drives your training philosophy and what clients can expect from working with you. Share your passion for fitness and why this style of training transforms lives. (300–500 characters)',
    'Tell clients about a specific result or transformation you\'ve witnessed. What makes your approach unique? What commitment do you bring to every session? (300–500 characters)',
    'Highlight a key discipline, technique, or skill you\'re showcasing in this video. Why does mastering this matter for long-term results? (300–500 characters)',
    'Share a personal message to prospective clients — what inspires you, what you stand for, and what they can achieve when they commit to the process. (300–500 characters)',
  ];

  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private loader: NgxUiLoaderService,
    private snackbar: SnackBarService,
    private trainerService: TrainerService,
    private trainerStateService: TrainerStateService,
    private strapiService: StrapiService,
    private datePipe: DatePipe,
    private cdr: ChangeDetectorRef
  ) { }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.initSlots();
    this.buildForm();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.revokeBlobUrl(this.editorPreviewUrl);
    this.slots.forEach(s => this.revokeBlobUrl(s.previewUrl));
  }

  // ── Init ──────────────────────────────────────────────────────────────────

  private initSlots(): void {
    const sorted = [...(this.trainerFeatureVideos || [])]
      .sort((a, b) => (a.position ?? 99) - (b.position ?? 99))
      .slice(0, TOTAL_SLOTS);

    this.slots = Array.from({ length: TOTAL_SLOTS }, (_, i) => {
      const existing = sorted[i];
      if (existing) {
        return {
          savedId: existing.id ?? null,
          previewUrl: this.resolveVideoUrl(existing.videoResponse?.videoUrl),
          uploaded: false,
          videoResponse: existing.videoResponse ? this.mapVideoToResponse(existing.videoResponse) : null,
          originalMotivation: existing.motivation ?? '',
          touched: false   // already saved — not dirty yet
        };
      }
      return { savedId: null, previewUrl: '', uploaded: false, videoResponse: null, originalMotivation: '', touched: false };
    });
  }

  private buildForm(): void {
    const controls: Record<string, any> = {};
    this.slots.forEach((slot, i) => {
      controls[`motivation_${i}`] = [
        slot.originalMotivation,
        [Validators.required, Validators.minLength(300), Validators.maxLength(500)]
      ];
    });
    this.featureVideosForm = this.fb.group(controls);

    // Mark slot as touched whenever the motivation field changes
    this.slots.forEach((_, i) => {
      this.getMotivationControl(i)?.valueChanges.subscribe(() => {
        if (!this.slots[i].touched) {
          this.slots[i].touched = true;
        }
        this.cdr.markForCheck();
      });
    });
  }

  // ── Slot validity helpers ─────────────────────────────────────────────────

  /**
   * A slot is considered "touched" (user started working on it) when:
   *   - a video was uploaded this session, OR
   *   - the motivation text has been edited, OR
   *   - a video already existed from the backend (savedId set)
   *
   * Once touched, BOTH video AND motivation must be valid.
   */
  slotIsTouched(i: number): boolean {
    return this.slots[i].touched
      || this.slots[i].uploaded
      || !!this.slots[i].savedId;
  }

  slotTouched(i: number): boolean {
    return this.slots[i].touched
  }

  get anySlotTouched(): boolean {
    return this.slots.some((_, i) => this.slotIsTouched(i));
  }

  get hasTouchedInvalidSlot(): boolean {
    return this.slots.some((_, i) => this.slotIsTouched(i) && !this.slotIsValid(i));
  }

  slotHasVideo(i: number): boolean {
    return this.slots[i].uploaded || !!this.slots[i].savedId;
  }

  slotMotivationValid(i: number): boolean {
    return this.getMotivationControl(i)?.valid ?? false;
  }



  /**
   * A touched slot is only valid when BOTH conditions are met:
   *   1. A video exists (uploaded or already saved)
   *   2. Motivation is 300–500 characters
   */
  slotIsValid(i: number): boolean {
    if (!this.slotIsTouched(i)) return true;   // untouched = neutral, not blocking
    return this.slotHasVideo(i) && this.slotMotivationValid(i);
  }

  /**
   * Whether the slot has unsaved changes worth saving.
   */
  slotHasChanges(i: number): boolean {
    const current = this.getMotivationControl(i)?.value ?? '';
    const motChanged = current !== this.slots[i].originalMotivation;
    return this.slots[i].uploaded || motChanged;
  }

  /**
   * True if the slot has been touched but is missing one of the two required fields.
   */
  slotHasError(i: number): boolean {
    return this.slotIsTouched(i) && !this.slotIsValid(i);
  }

  /**
   * Global save guard: need ≥2 saved/uploaded slots, ALL touched slots must be valid.
   */
  get canSaveAll(): boolean {
    const hasAnyInteraction = this.slots.some((_, i) => this.slotTouched(i));
    if (!hasAnyInteraction) return false;
    return this.slots.every((_, i) => this.slotIsValid(i));
  }

  get uploadedCount(): number {
    return this.slots.filter(s => s.uploaded || !!s.savedId).length;
  }

  getMotivationControl(i: number): AbstractControl | null {
    return this.featureVideosForm.get(`motivation_${i}`);
  }

  get registeredDate(): Date | null {
    if (!this.trainerFeatureVideos?.length) return null;

    return this.trainerFeatureVideos[this.trainerFeatureVideos.length - 1].date;
  }
  // ── Editor ────────────────────────────────────────────────────────────────

  openEditorForSlot(i: number): void {
    this.activeSlot = i;
    const input = document.getElementById(`videoInput_${i}`) as HTMLInputElement;
    input?.click();
  }

  openPreview(url: string): void {
    this.previewVideoUrl = url;
    this.showPreviewModal = true;
  }

  cancelEditor(): void {
    this.activeSlot = null;
    this.editorStep = 'idle';
    this.rawFile = null;
    this.processedFile = null;
    this.revokeBlobUrl(this.editorPreviewUrl);
    this.editorPreviewUrl = '';
    this.cdr.detectChanges();
  }

  // ── File selection ────────────────────────────────────────────────────────

  onVidSelected(event: any, slotIndex: number): void {
    const file: File = event.target.files?.[0];
    if (!file) return;

    // Mark this slot as touched as soon as a file is chosen
    this.slots[slotIndex].touched = true;

    this.activeSlot = slotIndex;
    this.revokeBlobUrl(this.editorPreviewUrl);
    this.rawFile = file;
    this.processedFile = null;
    this.trimStart = 0;
    this.trimEnd = this.MAX_DURATION;
    this.trimError = '';
    this.editorPreviewUrl = URL.createObjectURL(file);
    this.editorStep = 'trimming';
    this.cdr.detectChanges();
  }

  // ── Trim ──────────────────────────────────────────────────────────────────

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
    if (dur < this.MIN_DURATION) this.trimError = `Minimum ${this.MIN_DURATION}s required. Currently ${dur}s.`;
    else if (dur > this.MAX_DURATION) this.trimError = `Maximum ${this.MAX_DURATION}s allowed. Currently ${dur}s.`;
    else this.trimError = '';
  }

  get trimDuration(): number {
    return parseFloat((this.trimEnd - this.trimStart).toFixed(1));
  }

  get trimValid(): boolean {
    return !this.trimError
      && this.trimDuration >= this.MIN_DURATION
      && this.trimDuration <= this.MAX_DURATION;
  }

  // ── Process (MediaRecorder) ───────────────────────────────────────────────

  async processAndPreview(): Promise<void> {
    if (!this.rawFile || !this.trimValid) return;

    const videoEl = document.getElementById('editorVideoPreview') as HTMLVideoElement | null;
    if (!videoEl) { this.snackbar.openSnackBar('Video element not ready.', 'error'); return; }

    const canCapture = 'captureStream' in videoEl || 'mozCaptureStream' in videoEl;
    if (!canCapture) {
      this.processedFile = this.rawFile;
      this.videoPreviewUrl = URL.createObjectURL(this.rawFile);
      this.editorStep = 'previewing';
      this.cdr.detectChanges();
      return;
    }

    try {
      this.processingVideo = true;
      this.editorStep = 'previewing';
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
        this.editorStep = 'trimming';
        return;
      }

      const ext = mimeType.includes('webm') ? 'webm' : 'mp4';
      this.processedFile = new File([blob], `feature_${Date.now()}.${ext}`, { type: mimeType });
      this.revokeBlobUrl(this.videoPreviewUrl);
      this.videoPreviewUrl = URL.createObjectURL(this.processedFile);

      if (outputMB > this.MAX_FILE_MB) {
        this.overSizeMB = outputMB;
        this.editorStep = 'size-warning';
      } else {
        this.editorStep = 'previewing';
      }

    } catch (e) {
      console.error('[Trim]', e);
      this.processedFile = this.rawFile;
      this.videoPreviewUrl = URL.createObjectURL(this.rawFile!);
      this.editorStep = 'previewing';
    } finally {
      this.processingVideo = false;
      this.cdr.detectChanges();
    }
  }

  backToTrim(): void {
    this.editorStep = 'trimming';
    this.processedFile = null;
    this.cdr.detectChanges();
  }

  // ── Optimize ──────────────────────────────────────────────────────────────

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
        videoEl.onended = () => {
          videoEl.pause();
          recorder.stop();
          stream.getTracks().forEach(t => t.stop());
        };
      });

      const newMB = blob.size / 1024 / 1024;
      if (newMB > this.MAX_FILE_MB) {
        this.overSizeMB = newMB;
        this.snackbar.openSnackBar(`Still too large (${newMB.toFixed(1)} MB). Upload a new video.`, 'error');
        return;
      }

      const ext = mimeType.includes('webm') ? 'webm' : 'mp4';
      this.processedFile = new File([blob], `feature_opt_${Date.now()}.${ext}`, { type: mimeType });
      this.revokeBlobUrl(this.videoPreviewUrl);
      this.videoPreviewUrl = URL.createObjectURL(this.processedFile);
      this.editorStep = 'previewing';
      this.snackbar.openSnackBar(`Optimized to ${newMB.toFixed(1)} MB ✓`, '');

    } catch { this.snackbar.openSnackBar('Optimization failed.', 'error'); }
    finally { this.optimizing = false; this.cdr.detectChanges(); }
  }

  rejectAndUploadNew(): void {
    this.processedFile = null;
    this.rawFile = null;
    this.editorPreviewUrl = '';
    this.editorStep = 'idle';
    this.cdr.detectChanges();
  }

  // ── Strapi upload ─────────────────────────────────────────────────────────

  uploadToStrapi(): void {
    if (!this.processedFile || this.activeSlot === null) return;

    const outputMB = this.processedFile.size / 1024 / 1024;
    if (outputMB > this.MAX_FILE_MB) {
      this.overSizeMB = outputMB;
      this.editorStep = 'size-warning';
      this.cdr.detectChanges();
      return;
    }

    this.editorStep = 'uploading';
    this.loader.start();
    this.cdr.detectChanges();

    this.strapiService.uploadToStrapi(this.processedFile)
      .pipe(take(1))
      .subscribe({
        next: (res: any[]) => {
          const uploaded = res?.[0];
          if (!uploaded?.url) {
            this.snackbar.openSnackBar('Strapi returned no file URL.', 'error');
            this.editorStep = 'previewing';
            this.loader.stop();
            this.cdr.detectChanges();
            return;
          }

          const videoResponse: VideoResponse = {
            id: 0, strapiId: uploaded.id, videoUrl: uploaded.url,
            name: uploaded.name, mimeType: uploaded.mime,
            byteSize: uploaded.size, ownerId: 0,
            mediaOwnerType: MediaOwnerType.TRAINER_FEATURE_VIDEO
          };

          const slotIdx = this.activeSlot!;
          this.revokeBlobUrl(this.slots[slotIdx].previewUrl);
          this.slots[slotIdx].previewUrl = this.resolveVideoUrl(uploaded.url);
          this.slots[slotIdx].uploaded = true;
          this.slots[slotIdx].videoResponse = videoResponse;
          this.slots[slotIdx].touched = true;  // video uploaded = slot is now touched

          this.editorStep = 'idle';
          this.activeSlot = null;
          this.snackbar.openSnackBar(`Video ${slotIdx + 1} uploaded. Add motivation and save.`, '');
          this.loader.stop();
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          this.snackbar.openSnackBar(err?.error?.message || 'Upload failed.', 'error');
          this.editorStep = 'previewing';
          this.loader.stop();
          this.cdr.detectChanges();
        }
      });
  }

  // ── Per-slot save ─────────────────────────────────────────────────────────

  saveSlot(i: number): void {
    const slot = this.slots[i];
    const motivation = this.getMotivationControl(i)?.value ?? '';

    // Both must be present for a touched slot
    if (!this.slotHasVideo(i)) {
      this.snackbar.openSnackBar(`Video ${i + 1}: please upload a video first.`, 'error');
      return;
    }

    const motCtrl = this.getMotivationControl(i);
    if (motCtrl?.invalid) {
      motCtrl.markAsDirty();
      this.snackbar.openSnackBar(`Video ${i + 1}: motivation must be 300–500 characters.`, 'error');
      return;
    }

    const payload = {
      id: slot.savedId ?? undefined,
      trainerId: this.trainerFeatureVideos?.[0]?.trainerId,
      motivation,
      position: i,
      videoRequest: slot.videoResponse
    };

    this.loader.start();

    const request$ = slot.savedId
      ? this.trainerService.updateTrainerFeatureVideo(payload)
      : this.trainerService.addTrainerFeatureVideo(payload);

    request$.pipe(take(1)).subscribe({
      next: (res: any) => {
        this.slots[i].savedId = res?.id ?? slot.savedId;
        this.slots[i].uploaded = false;
        this.slots[i].originalMotivation = motivation;
        this.slots[i].touched = false;   // reset after successful save
        this.snackbar.openSnackBar(res?.message || `Video ${i + 1} saved`, '');
        this.emitEvent.emit();
        this.loader.stop();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.snackbar.openSnackBar(err?.error?.message || genericError, 'error');
        this.loader.stop();
      }
    });
  }

  // ── Save all ──────────────────────────────────────────────────────────────

  saveAll(): void {
    this.invalidForm = false;

    // Check global minimum
    if (this.uploadedCount < 2) {
      this.invalidForm = true;
      this.snackbar.openSnackBar('Please upload at least 2 feature videos.', 'error');
      return;
    }

    // Check every touched slot — both fields must be valid
    const invalidSlots = this.slots
      .map((_, i) => i)
      .filter(i => this.slotIsTouched(i) && !this.slotIsValid(i));

    if (invalidSlots.length > 0) {
      this.invalidForm = true;
      // Mark motivation controls dirty so errors show in the UI
      invalidSlots.forEach(i => this.getMotivationControl(i)?.markAsDirty());

      const missing = invalidSlots.map(i => {
        const noVideo = !this.slotHasVideo(i);
        const noMot = !this.slotMotivationValid(i);
        if (noVideo && noMot) return `Video ${i + 1}: missing video and motivation`;
        if (noVideo) return `Video ${i + 1}: missing video`;
        return `Video ${i + 1}: motivation must be 300–500 characters`;
      });

      this.snackbar.openSnackBar(missing[0], 'error');
      return;
    }

    // All valid — save slots with changes
    this.slots.forEach((slot, i) => {
      if (this.slotHasChanges(i) && (slot.uploaded || slot.savedId)) {
        this.saveSlot(i);
      }
    });
  }

  // ── Delete slot ───────────────────────────────────────────────────────────

  deleteSlot(i: number): void {
    const slot = this.slots[i];
    if (!slot.savedId) return;

    this.loader.start();
    this.trainerService.deleteTrainerFeatureVideo(slot.savedId)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.revokeBlobUrl(slot.previewUrl);
          this.slots[i] = {
            savedId: null, previewUrl: '', uploaded: false,
            videoResponse: null, originalMotivation: '', touched: false
          };
          this.getMotivationControl(i)?.setValue('');
          this.snackbar.openSnackBar(`Video ${i + 1} deleted`, '');
          this.emitEvent.emit();
          this.loader.stop();
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          this.snackbar.openSnackBar(err?.error?.message || genericError, 'error');
          this.loader.stop();
        }
      });
  }

  // ── Utilities ─────────────────────────────────────────────────────────────

  private resolveVideoUrl(url?: string): string {
    if (!url) return this.defaultVideo;
    const cleanUrl = url.trim();
    if (!cleanUrl) return this.defaultVideo;
    if (cleanUrl.startsWith('blob:') || cleanUrl.startsWith('http')) {
      return cleanUrl;
    }
    const base = environment.strapiUrl.replace(/\/$/, '');
    const path = cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;

    return `${base}${path}`;
  }

  private revokeBlobUrl(url: string): void {
    if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
  }

  private mapVideoToResponse(video: any): VideoResponse {
    return {
      id: video.id, strapiId: video.strapiId, videoUrl: video.videoUrl,
      name: video.name, mimeType: video.mimeType, byteSize: video.byteSize,
      ownerId: video.ownerId, mediaOwnerType: video.mediaOwnerType
    };
  }

  onVideoError(event: any): void {
    (event.target as HTMLVideoElement).src = this.defaultVideo;
  }

  formatDate(date: any): string {
    return this.datePipe.transform(new Date(date), 'dd/MM/yyyy') ?? '';
  }
}