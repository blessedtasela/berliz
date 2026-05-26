import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import { StrapiService } from './strapi.service';
import { VideoResponse } from 'src/app/models/Media.interface';
import { MediaOwnerType } from 'src/app/models/Media.enum';

// ── Output events emitted to the component ────────────────────────────────────
export interface VideoProcessResult {
  processedFile: File;
  previewUrl:    string;
  overSizeMB:    number;   // 0 = within limit
}

export interface StrapiUploadResult {
  videoResponse: VideoResponse;
  resolvedUrl:   string;
}

// ── Crop / canvas constants ────────────────────────────────────────────────────
const CROP_OUT_WIDTH  = 540;
const CROP_OUT_HEIGHT = 960;

@Injectable({ providedIn: 'root' })
export class VideoCropperService {

  // ── Public constants (read by component for template bindings) ────────────
  readonly MIN_DURATION  = 15;
  readonly MAX_DURATION  = 30;
  readonly MAX_FILE_MB   = 50;

  readonly CANVAS_DISPLAY_W = 270;
  readonly CANVAS_DISPLAY_H = 480;
  readonly CANVAS_RENDER_W  = CROP_OUT_WIDTH;
  readonly CANVAS_RENDER_H  = CROP_OUT_HEIGHT;

  // ── Canvas / crop state (managed here, exposed for template) ─────────────
  cropOffsetX    = 0;
  cropOffsetY    = 0;
  cropMaxOffsetX = 0;
  cropMaxOffsetY = 0;
  cropScaleX     = 1;
  cropScaleY     = 1;

  isDragging        = false;
  private dragStartX       = 0;
  private dragStartY       = 0;
  private dragOffsetStartX = 0;
  private dragOffsetStartY = 0;

  private cropAnimFrame = 0;
  private cropCtx: CanvasRenderingContext2D | null = null;

  constructor(private strapiService: StrapiService) {}

  // ── Canvas lifecycle ──────────────────────────────────────────────────────

  initCropCanvas(
    canvas:          HTMLCanvasElement,
    video:           HTMLVideoElement,
    editorPreviewUrl: string,
    trimStart:        number
  ): void {
    cancelAnimationFrame(this.cropAnimFrame);

    canvas.width  = this.CANVAS_RENDER_W;
    canvas.height = this.CANVAS_RENDER_H;
    this.cropCtx  = canvas.getContext('2d');

    video.src         = editorPreviewUrl;
    video.muted       = true;
    video.volume      = 0;
    video.currentTime = trimStart;

    video.onloadedmetadata = () => {
      const vw = video.videoWidth;
      const vh = video.videoHeight;

      this.cropScaleX     = vw / this.CANVAS_RENDER_W;
      this.cropScaleY     = vh / this.CANVAS_RENDER_H;
      this.cropMaxOffsetX = Math.max(0, vw - this.CANVAS_RENDER_W * this.cropScaleX);
      this.cropMaxOffsetY = Math.max(0, vh - this.CANVAS_RENDER_H * this.cropScaleY);

      video.play().catch(() => {});
      this.drawCropFrame(canvas, video);
    };
  }

  private drawCropFrame(canvas: HTMLCanvasElement, video: HTMLVideoElement): void {
    const ctx = this.cropCtx;
    if (!ctx) return;

    ctx.drawImage(
      video,
      this.cropOffsetX * this.cropScaleX,
      this.cropOffsetY * this.cropScaleY,
      this.CANVAS_RENDER_W * this.cropScaleX,
      this.CANVAS_RENDER_H * this.cropScaleY,
      0, 0,
      this.CANVAS_RENDER_W,
      this.CANVAS_RENDER_H
    );

    this.cropAnimFrame = requestAnimationFrame(() => this.drawCropFrame(canvas, video));
  }

  stopCropCanvas(video?: HTMLVideoElement): void {
    cancelAnimationFrame(this.cropAnimFrame);
    if (video) { video.pause(); video.src = ''; }
    this.cropCtx = null;
  }

  resetCropOffsets(): void {
    this.cropOffsetX = 0;
    this.cropOffsetY = 0;
  }

  // ── Drag handlers ─────────────────────────────────────────────────────────

  onDragStart(event: MouseEvent | TouchEvent): void {
    this.isDragging        = true;
    const pos              = this.getEventPos(event);
    this.dragStartX        = pos.x;
    this.dragStartY        = pos.y;
    this.dragOffsetStartX  = this.cropOffsetX;
    this.dragOffsetStartY  = this.cropOffsetY;
    event.preventDefault();
  }

  onDragMove(event: MouseEvent | TouchEvent): void {
    if (!this.isDragging) return;

    const pos         = this.getEventPos(event);
    const displayScale = this.CANVAS_DISPLAY_W / this.CANVAS_RENDER_W;
    const deltaX      = (pos.x - this.dragStartX) / displayScale;
    const deltaY      = (pos.y - this.dragStartY) / displayScale;

    this.cropOffsetX = Math.max(0, Math.min(
      this.cropMaxOffsetX / this.cropScaleX,
      this.dragOffsetStartX - deltaX
    ));

    this.cropOffsetY = Math.max(0, Math.min(
      this.cropMaxOffsetY / this.cropScaleY,
      this.dragOffsetStartY - deltaY
    ));

    event.preventDefault();
  }

  onDragEnd(): void {
    this.isDragging = false;
  }

  private getEventPos(event: MouseEvent | TouchEvent): { x: number; y: number } {
    if ('touches' in event) {
      return { x: event.touches[0].clientX, y: event.touches[0].clientY };
    }
    return { x: event.clientX, y: event.clientY };
  }

  // ── Video processing (MediaRecorder) ─────────────────────────────────────

  async processVideo(
    rawFile:         File,
    editorPreviewUrl: string,
    trimStart:        number,
    trimEnd:          number,
    withCrop:         boolean
  ): Promise<VideoProcessResult> {

    const recordVideo     = document.createElement('video');
    recordVideo.src       = editorPreviewUrl;
    recordVideo.muted     = true;
    recordVideo.volume    = 0;

    await new Promise<void>(resolve => {
      recordVideo.onloadedmetadata = () => resolve();
    });

    let stream: MediaStream;

    if (withCrop) {
      stream = await this.buildCroppedStream(recordVideo, trimStart);
    } else {
      stream = await this.buildDirectStream(recordVideo, rawFile, trimStart);
      if (!stream) {
        // Browser has no captureStream — return raw file
        return {
          processedFile: rawFile,
          previewUrl:    URL.createObjectURL(rawFile),
          overSizeMB:    rawFile.size / 1024 / 1024 > this.MAX_FILE_MB
                           ? rawFile.size / 1024 / 1024 : 0
        };
      }
    }

    // Strip audio
    stream.getAudioTracks().forEach(t => { t.stop(); stream.removeTrack(t); });

    const { blob, mimeType } = await this.recordStream(stream, recordVideo, trimEnd);

    recordVideo.pause();
    stream.getTracks().forEach(t => t.stop());

    if (blob.size < 5000) {
      throw new Error('Processed video too small — likely corrupt.');
    }

    const ext          = mimeType.includes('webm') ? 'webm' : 'mp4';
    const processedFile = new File(
      [blob],
      `feature_${Date.now()}.${ext}`,
      { type: mimeType }
    );

    const outputMB = processedFile.size / 1024 / 1024;

    return {
      processedFile,
      previewUrl: URL.createObjectURL(processedFile),
      overSizeMB: outputMB > this.MAX_FILE_MB ? outputMB : 0
    };
  }

  private async buildCroppedStream(
    video:      HTMLVideoElement,
    trimStart:  number
  ): Promise<MediaStream> {
    const offscreen = document.createElement('canvas');
    offscreen.width  = this.CANVAS_RENDER_W;
    offscreen.height = this.CANVAS_RENDER_H;
    const ctx        = offscreen.getContext('2d')!;

    const { cropOffsetX, cropOffsetY, cropScaleX, cropScaleY } = this;
    const srcX = cropOffsetX * cropScaleX;
    const srcY = cropOffsetY * cropScaleY;
    const srcW = this.CANVAS_RENDER_W * cropScaleX;
    const srcH = this.CANVAS_RENDER_H * cropScaleY;

    video.currentTime = trimStart;
    await this.waitForSeek(video);
    video.play();

    const drawLoop = () => {
      if (!video.paused && !video.ended) {
        ctx.drawImage(video, srcX, srcY, srcW, srcH, 0, 0, this.CANVAS_RENDER_W, this.CANVAS_RENDER_H);
        requestAnimationFrame(drawLoop);
      }
    };
    drawLoop();

    return (offscreen as any).captureStream(30);
  }

  private async buildDirectStream(
    video:     HTMLVideoElement,
    rawFile:   File,
    trimStart: number
  ): Promise<MediaStream> {
    const canCapture = 'captureStream' in video || 'mozCaptureStream' in video;
    if (!canCapture) return null as any;

    video.currentTime = trimStart;
    await this.waitForSeek(video);
    video.play();

    const stream: MediaStream =
      (video as any).captureStream?.() ??
      (video as any).mozCaptureStream?.();
    stream.getAudioTracks().forEach(t => { t.stop(); stream.removeTrack(t); });

    return stream;
  }

  private waitForSeek(video: HTMLVideoElement): Promise<void> {
    return new Promise<void>((res, rej) => {
      const t = setTimeout(() => rej(new Error('Seek timeout')), 5000);
      video.onseeked = () => { clearTimeout(t); res(); };
    });
  }

  private recordStream(
    stream:     MediaStream,
    video:      HTMLVideoElement,
    trimEnd:    number
  ): Promise<{ blob: Blob; mimeType: string }> {

    const mimeType =
      MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' :
      MediaRecorder.isTypeSupported('video/webm;codecs=vp8') ? 'video/webm;codecs=vp8' :
      MediaRecorder.isTypeSupported('video/webm')             ? 'video/webm' : 'video/mp4';

    const chunks: BlobPart[] = [];
    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 1_500_000
    });

    recorder.ondataavailable = (e: BlobEvent) => {
      if (e.data?.size > 0) chunks.push(e.data);
    };

    return new Promise((resolve, reject) => {
      recorder.onstop  = () => resolve({ blob: new Blob(chunks, { type: mimeType }), mimeType });
      recorder.onerror = reject;

      recorder.start(100);

      const poll = setInterval(() => {
        if (video.currentTime >= trimEnd || video.ended) {
          clearInterval(poll);
          video.pause();
          recorder.stop();
          stream.getTracks().forEach(t => t.stop());
        }
      }, 100);
    });
  }

  // ── Optimize (re-encode at lower bitrate) ─────────────────────────────────

  async optimizeVideo(
    currentFile:    File,
    previewUrl:     string
  ): Promise<VideoProcessResult> {

    const videoEl     = document.createElement('video');
    videoEl.src       = previewUrl;
    videoEl.muted     = true;
    videoEl.volume    = 0;

    await new Promise<void>(resolve => { videoEl.onloadedmetadata = () => resolve(); });

    const canCapture = 'captureStream' in videoEl || 'mozCaptureStream' in videoEl;
    if (!canCapture) throw new Error('captureStream not supported');

    videoEl.currentTime = 0;
    await new Promise<void>(resolve => { videoEl.onseeked = () => resolve(); });

    const stream: MediaStream =
      (videoEl as any).captureStream?.() ??
      (videoEl as any).mozCaptureStream?.();
    stream.getAudioTracks().forEach(t => { t.stop(); stream.removeTrack(t); });

    const mimeType =
      MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9' : 'video/webm';

    const chunks: BlobPart[] = [];
    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 500_000  // aggressive reduction
    });

    recorder.ondataavailable = (e: BlobEvent) => { if (e.data?.size > 0) chunks.push(e.data); };

    const blob = await new Promise<Blob>((resolve, reject) => {
      recorder.onstop  = () => resolve(new Blob(chunks, { type: mimeType }));
      recorder.onerror = reject;

      recorder.start(100);
      videoEl.play();

      videoEl.onended = () => {
        videoEl.pause();
        recorder.stop();
        stream.getTracks().forEach(t => t.stop());
      };
    });

    const ext          = mimeType.includes('webm') ? 'webm' : 'mp4';
    const processedFile = new File(
      [blob],
      `feature_opt_${Date.now()}.${ext}`,
      { type: mimeType }
    );
    const newMB = processedFile.size / 1024 / 1024;

    return {
      processedFile,
      previewUrl: URL.createObjectURL(processedFile),
      overSizeMB: newMB > this.MAX_FILE_MB ? newMB : 0
    };
  }

  // ── Strapi upload ─────────────────────────────────────────────────────────

  uploadToStrapi(
    processedFile: File,
    strapiBaseUrl:  string
  ): Observable<StrapiUploadResult> {

    const subject = new Subject<StrapiUploadResult>();

    this.strapiService.uploadToStrapi(processedFile)
      .pipe(take(1))
      .subscribe({
        next: (res: any[]) => {
          const uploaded = res?.[0];
          if (!uploaded?.url) {
            subject.error(new Error('Strapi returned no file URL.'));
            return;
          }

          const videoResponse: VideoResponse = {
            id:             0,
            strapiId:       uploaded.id,
            videoUrl:       uploaded.url,
            name:           uploaded.name,
            mimeType:       uploaded.mime,
            byteSize:       uploaded.size,
            ownerId:        0,
            mediaOwnerType: MediaOwnerType.TRAINER_FEATURE_VIDEO
          };

          const resolvedUrl = uploaded.url.startsWith('http')
            ? uploaded.url
            : `${strapiBaseUrl}${uploaded.url}`;

          subject.next({ videoResponse, resolvedUrl });
          subject.complete();
        },
        error: err => subject.error(err)
      });

    return subject.asObservable();
  }

  // ── Blob URL helpers (called by component on destroy / reset) ─────────────

  revokeBlobUrl(url: string): void {
    if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
  }

  resolveVideoUrl(url: string | undefined, fallback: string): string {
    if (!url?.trim()) return fallback;
    if (url.startsWith('blob:') || url.startsWith('http')) return url;
    return `http://localhost:1337${url}`;
  }
}