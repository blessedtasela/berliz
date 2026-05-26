import { DatePipe } from '@angular/common';
import {
  ChangeDetectorRef, Component, ElementRef, EventEmitter,
  Input, OnDestroy, OnInit, Output, ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription, take } from 'rxjs';
import { TrainerFeatureVideo } from 'src/app/models/trainers.interface';
import { VideoResponse } from 'src/app/models/Media.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TrainerStateService } from 'src/app/services/trainer-state.service';
import { TrainerService } from 'src/app/services/trainer.service';
import { VideoCropperService } from 'src/app/services/video-cropper.service';
import { genericError } from 'src/validators/form-validators.module';
import { environment } from 'src/environments/environment';

export type EditorStep =
  | 'idle'
  | 'trimming'
  | 'cropping'
  | 'previewing'
  | 'size-warning'
  | 'uploading';

@Component({
  selector: 'app-trainer-feature-videos',
  templateUrl: './trainer-feature-videos.component.html',
  styleUrls: ['./trainer-feature-videos.component.css']
})
export class TrainerFeatureVideosComponent implements OnInit, OnDestroy {

  @Input() trainerFeatureVideo!: TrainerFeatureVideo;
  @Output() emitEvent = new EventEmitter();

  @ViewChild('cropCanvasEl') cropCanvasEl!: ElementRef<HTMLCanvasElement>;
  @ViewChild('cropVideoEl') cropVideoEl!: ElementRef<HTMLVideoElement>;

  // ── Form ──────────────────────────────────────────────────────────────────
  updateTrainerFeatureVideoForm!: FormGroup;
  invalidForm = false;
  isChecked = false;
  originalValue: any;

  // ── Service constants exposed for template ────────────────────────────────
  get MIN_DURATION() { return this.cropper.MIN_DURATION; }
  get MAX_DURATION() { return this.cropper.MAX_DURATION; }
  get MAX_FILE_MB() { return this.cropper.MAX_FILE_MB; }
  get CANVAS_DISPLAY_W() { return this.cropper.CANVAS_DISPLAY_W; }
  get CANVAS_DISPLAY_H() { return this.cropper.CANVAS_DISPLAY_H; }

  // ── Service state proxies exposed for template ────────────────────────────
  get cropOffsetX() { return this.cropper.cropOffsetX; }
  get cropOffsetY() { return this.cropper.cropOffsetY; }
  get isDragging() { return this.cropper.isDragging; }

  readonly Math = Math;

  // ── Editor state (owned by component — drives template) ──────────────────
  readonly defaultVideo = 'assets/videos/demo_ok.mp4';

  editorStep: EditorStep = 'idle';
  showPreviewModal = false;
  processingVideo = false;
  optimizing = false;

  rawFile: File | null = null;
  processedFile: File | null = null;
  uploadedVideoResponse: VideoResponse | null = null;

  videoPreviewUrl = '';
  editorPreviewUrl = '';

  // Trim
  videoDuration = 0;
  trimStart = 0;
  trimEnd = 30;
  trimError = '';
  overSizeMB = 0;

  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private loader: NgxUiLoaderService,
    private snackbar: SnackBarService,
    private trainerService: TrainerService,
    private trainerStateService: TrainerStateService,
    public cropper: VideoCropperService,   // public — template uses it for drag handlers
    private datePipe: DatePipe,
    private cdr: ChangeDetectorRef
  ) { }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.trainerFeatureVideo = this.trainerFeatureVideo || {};

    this.updateTrainerFeatureVideoForm = this.fb.group({
      id: [this.trainerFeatureVideo?.id],
      motivation: [
        this.trainerFeatureVideo.motivation || '',
        [Validators.required, Validators.minLength(500)]
      ],
      video: [null, Validators.required]
    });

    this.originalValue = this.updateTrainerFeatureVideoForm.getRawValue();
    this.videoPreviewUrl = this.cropper.resolveVideoUrl(
      this.trainerFeatureVideo?.video?.videoUrl,
      this.defaultVideo
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.cropper.stopCropCanvas();
    this.cropper.revokeBlobUrl(this.editorPreviewUrl);
  }

  // ── File selection ────────────────────────────────────────────────────────

  onVidSelected(event: any): void {
    const file: File = event.target.files?.[0];
    if (!file) return;

    this.cropper.revokeBlobUrl(this.editorPreviewUrl);
    this.rawFile = file;
    this.processedFile = null;
    this.uploadedVideoResponse = null;
    this.trimStart = 0;
    this.trimEnd = this.MAX_DURATION;
    this.trimError = '';
    this.cropper.resetCropOffsets();
    this.editorPreviewUrl = URL.createObjectURL(file);
    this.editorStep = 'trimming';
    this.cdr.detectChanges();
  }

  onCurrentVideoSelected(event: any): void {
    if (!event.target.checked) { this.resetEditor(); return; }

    const videoUrl = this.trainerFeatureVideo?.video?.videoUrl;
    if (!videoUrl) return;

    this.loader.start();
    fetch(videoUrl)
      .then(r => { if (!r.ok) throw new Error(); return r.blob(); })
      .then(blob => {
        const file = new File([blob], 'current.mp4', { type: 'video/mp4' });
        this.cropper.revokeBlobUrl(this.editorPreviewUrl);
        this.rawFile = file;
        this.processedFile = null;
        this.uploadedVideoResponse = null;
        this.cropper.resetCropOffsets();
        this.editorPreviewUrl = URL.createObjectURL(file);
        this.isChecked = true;
        this.editorStep = 'trimming';
        this.loader.stop();
        this.cdr.detectChanges();
      })
      .catch(() => {
        this.loader.stop();
        this.snackbar.openSnackBar('Could not load current video', 'error');
      });
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
    if (dur < this.MIN_DURATION) {
      this.trimError = `Minimum ${this.MIN_DURATION}s required. Currently ${dur}s.`;
    } else if (dur > this.MAX_DURATION) {
      this.trimError = `Maximum ${this.MAX_DURATION}s allowed. Currently ${dur}s.`;
    } else {
      this.trimError = '';
    }
  }

  get trimDuration(): number {
    return parseFloat((this.trimEnd - this.trimStart).toFixed(1));
  }

  get trimValid(): boolean {
    return !this.trimError
      && this.trimDuration >= this.MIN_DURATION
      && this.trimDuration <= this.MAX_DURATION;
  }

  // ── Crop ──────────────────────────────────────────────────────────────────

  proceedToCrop(): void {
    if (!this.trimValid) return;
    this.cropper.resetCropOffsets();
    this.editorStep = 'cropping';
    this.cdr.detectChanges();

    setTimeout(() => {
      const canvas = this.cropCanvasEl?.nativeElement;
      const video = this.cropVideoEl?.nativeElement;
      if (canvas && video) {
        this.cropper.initCropCanvas(canvas, video, this.editorPreviewUrl, this.trimStart);
      }
    }, 80);
  }

  backToTrim(): void {
    this.cropper.stopCropCanvas(this.cropVideoEl?.nativeElement);
    this.editorStep = 'trimming';
    this.processedFile = null;
    this.cdr.detectChanges();
  }

  skipCrop(): void {
    this.cropper.stopCropCanvas(this.cropVideoEl?.nativeElement);
    this.runProcessing(false);
  }

  confirmCrop(): void {
    this.cropper.stopCropCanvas(this.cropVideoEl?.nativeElement);
    this.runProcessing(true);
  }

  // ── Processing (delegated to service) ────────────────────────────────────

  private async runProcessing(withCrop: boolean): Promise<void> {
    if (!this.rawFile) return;

    try {
      this.processingVideo = true;
      this.editorStep = 'previewing';
      this.cdr.detectChanges();

      const result = await this.cropper.processVideo(
        this.rawFile,
        this.editorPreviewUrl,
        this.trimStart,
        this.trimEnd,
        withCrop
      );

      this.processedFile = result.processedFile;
      this.cropper.revokeBlobUrl(this.videoPreviewUrl);
      this.videoPreviewUrl = result.previewUrl;

      if (result.overSizeMB > 0) {
        this.overSizeMB = result.overSizeMB;
        this.editorStep = 'size-warning';
      } else {
        this.editorStep = 'previewing';
      }

    } catch (e) {
      console.error('[Process]', e);
      this.snackbar.openSnackBar('Processing failed. Using original clip.', 'error');
      this.processedFile = this.rawFile;
      this.videoPreviewUrl = URL.createObjectURL(this.rawFile!);
      this.editorStep = 'previewing';
    } finally {
      this.processingVideo = false;
      this.cdr.detectChanges();
    }
  }

  // ── Optimize ──────────────────────────────────────────────────────────────

  async optimizeVideo(): Promise<void> {
    if (!this.processedFile) return;

    try {
      this.optimizing = true;
      this.cdr.detectChanges();

      const result = await this.cropper.optimizeVideo(
        this.processedFile,
        this.videoPreviewUrl
      );

      this.processedFile = result.processedFile;
      this.cropper.revokeBlobUrl(this.videoPreviewUrl);
      this.videoPreviewUrl = result.previewUrl;

      if (result.overSizeMB > 0) {
        this.overSizeMB = result.overSizeMB;
        this.snackbar.openSnackBar(
          `Still too large (${result.overSizeMB.toFixed(1)} MB). Please upload a new video.`,
          'error'
        );
      } else {
        this.editorStep = 'previewing';
        this.snackbar.openSnackBar(
          `Optimized to ${(this.processedFile.size / 1024 / 1024).toFixed(1)} MB ✓`,
          ''
        );
      }

    } catch {
      this.snackbar.openSnackBar('Optimization not supported. Please upload a new video.', 'error');
    } finally {
      this.optimizing = false;
      this.cdr.detectChanges();
    }
  }

  rejectAndUploadNew(): void {
    this.processedFile = null;
    this.rawFile = null;
    this.editorPreviewUrl = '';
    this.editorStep = 'idle';
    this.cdr.detectChanges();
  }

  cancelEditor(): void {
    this.cropper.stopCropCanvas(this.cropVideoEl?.nativeElement);
    this.resetEditor();
  }

  // ── Strapi upload (delegated to service) ──────────────────────────────────

  uploadToStrapi(): void {
    if (!this.processedFile) return;

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

    this.cropper.uploadToStrapi(this.processedFile, environment.strapiUrl)
      .pipe(take(1))
      .subscribe({
        next: ({ videoResponse, resolvedUrl }) => {
          this.uploadedVideoResponse = videoResponse;
          this.updateTrainerFeatureVideoForm.patchValue({ video: videoResponse });
          this.videoPreviewUrl = resolvedUrl;
          this.editorStep = 'idle';
          this.loader.stop();

          if (this.updateTrainerFeatureVideoForm.invalid) {
            this.snackbar.openSnackBar('Video uploaded! Complete the motivation field and save.', '');
          } else {
            this.snackbar.openSnackBar('Video uploaded successfully', '');
            this.submitForm();
          }
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          console.error('[Strapi upload error]', err);
          this.snackbar.openSnackBar(err?.message || 'Upload failed.', 'error');
          this.editorStep = 'previewing';
          this.loader.stop();
          this.cdr.detectChanges();
        }
      });
  }

  // ── Save ──────────────────────────────────────────────────────────────────

  updateTrainerFeatureVideo(): void {
    if (this.updateTrainerFeatureVideoForm.invalid) {
      this.invalidForm = true;
      this.updateTrainerFeatureVideoForm.markAllAsTouched();
      this.snackbar.openSnackBar(
        !this.uploadedVideoResponse && !this.trainerFeatureVideo?.video
          ? 'Please upload a video first, then complete the motivation field.'
          : 'Please complete the motivation field (minimum 500 characters).',
        'error'
      );
      return;
    }

    const videoToSend = this.uploadedVideoResponse ?? this.trainerFeatureVideo?.video;
    if (!videoToSend) {
      this.invalidForm = true;
      this.snackbar.openSnackBar('Please select and upload a video first.', 'error');
      return;
    }

    this.submitForm();
  }

  private submitForm(): void {
    const videoToSend = this.uploadedVideoResponse ?? this.trainerFeatureVideo?.video;
    if (!videoToSend) return;

    const payload = {
      id: this.updateTrainerFeatureVideoForm.get('id')?.value,
      trainerId: this.trainerFeatureVideo?.trainerId,
      motivation: this.updateTrainerFeatureVideoForm.get('motivation')?.value,
      videoRequest: videoToSend
    };

    this.loader.start();

    const request$ = payload.id
      ? this.trainerService.updateTrainerFeatureVideo(payload)
      : this.trainerService.addTrainerFeatureVideo(payload);

    request$.pipe(take(1)).subscribe({
      next: (res: any) => this.handleSuccess(res),
      error: (err: any) => this.handleError(err)
    });
  }

  // ── Response handlers ─────────────────────────────────────────────────────

  private handleSuccess(res: any): void {
    this.snackbar.openSnackBar(res?.message || 'Saved successfully', '');
    this.emitEvent.emit();
    this.loader.stop();
    this.clear(res);
  }

  private handleError(err: any): void {
    this.snackbar.openSnackBar(err?.error?.message || genericError, 'error');
    this.loader.stop();
  }

  private clear(updated: TrainerFeatureVideo): void {
    this.trainerFeatureVideo = { ...this.trainerFeatureVideo, ...updated };

    this.updateTrainerFeatureVideoForm.patchValue({
      id: updated.id,
      motivation: updated.motivation,
      video: updated.video
    });

    this.videoPreviewUrl = this.cropper.resolveVideoUrl(
      updated?.video?.videoUrl, this.defaultVideo
    );
    this.rawFile = null;
    this.processedFile = null;
    this.uploadedVideoResponse = null;
    this.isChecked = false;
    this.invalidForm = false;
    this.editorStep = 'idle';

    this.updateTrainerFeatureVideoForm.markAsPristine();
    this.updateTrainerFeatureVideoForm.markAsUntouched();
    this.updateTrainerFeatureVideoForm.updateValueAndValidity();
    this.originalValue = this.updateTrainerFeatureVideoForm.getRawValue();
    this.cdr.detectChanges();

    this.subscriptions.push(
      this.trainerStateService.getMyTrainerFeatureVideo().subscribe(fv => {
        if (fv) this.trainerStateService.setMyTrainerFeatureVideoSubject(fv);
      })
    );
  }

  private resetEditor(): void {
    this.rawFile = null;
    this.processedFile = null;
    this.uploadedVideoResponse = null;
    this.isChecked = false;
    this.editorStep = 'idle';
    this.cropper.revokeBlobUrl(this.editorPreviewUrl);
    this.editorPreviewUrl = '';
    this.videoPreviewUrl = this.cropper.resolveVideoUrl(
      this.trainerFeatureVideo?.video?.videoUrl, this.defaultVideo
    );
    this.updateTrainerFeatureVideoForm.patchValue({ video: null });
    this.cdr.detectChanges();
  }

  // ── Utilities ─────────────────────────────────────────────────────────────

  onVideoError(event: any): void {
    (event.target as HTMLVideoElement).src = this.defaultVideo;
  }

  hasChanges(): boolean {
    return JSON.stringify(this.updateTrainerFeatureVideoForm.getRawValue())
      !== JSON.stringify(this.originalValue);
  }

  formatDate(date: any): string {
    return this.datePipe.transform(new Date(date), 'dd/MM/yyyy') ?? '';
  }
}