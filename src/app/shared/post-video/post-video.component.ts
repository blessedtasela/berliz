import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';

import { IconsModule } from 'src/app/icons/icons.module';
import { ActiveVideoService } from 'src/app/services/active-video.service';
import { resolveStrapiUrl } from 'src/app/utils/strapi-url.util';

let nextId = 0;

/**
 * Instagram/TikTok-style video for a post: autoplays muted when ~60% in view, pauses when it
 * scrolls away, tap to pause/play, no native controls bar. One shared component so this behaves
 * identically on the feed, profile timelines and Saved — see ActiveVideoService for how only one
 * plays at a time across the whole page. Mobile shipped the equivalent behaviour first (master
 * 37b491b); this mirrors it on web.
 *
 * Not used for the media/comments sheet's own expanded video viewer, or for trainer
 * album/feature videos or center video galleries — those keep their normal `<video controls>`.
 */
@Component({
  selector: 'app-post-video',
  standalone: true,
  imports: [CommonModule, IconsModule],
  templateUrl: './post-video.component.html',
  styleUrls: ['./post-video.component.css'],
})
export class PostVideoComponent implements AfterViewInit, OnDestroy {
  @Input() videoUrl: string | null = null;
  /** Passed straight onto the inner <video> element, so each page keeps its own sizing/border/rounding. */
  @Input() videoClass = '';

  @ViewChild('videoEl') videoElRef?: ElementRef<HTMLVideoElement>;
  @ViewChild('hostEl') hostElRef?: ElementRef<HTMLElement>;

  readonly id = `post-video-${++nextId}`;

  muted = true;
  paused = true;
  errored = false;
  /** True once this clip has been told to autoplay at least once -- preload stays 'metadata' (no network fetch) until then. */
  private armed = false;
  private manuallyPaused = false;
  private inView = false;
  private observer?: IntersectionObserver;

  constructor(private activeVideo: ActiveVideoService) {}

  get resolvedUrl(): string {
    return resolveStrapiUrl(this.videoUrl);
  }

  /** Autoplay never starts for someone who asked for less motion or is saving data -- a static tap-to-play tile instead. */
  get autoplayAllowed(): boolean {
    const reducedMotion = typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dataSaver = !!(navigator as any).connection?.saveData;
    return !reducedMotion && !dataSaver;
  }

  ngAfterViewInit(): void {
    this.activeVideo.register(this.id, {
      top: () => this.hostElRef?.nativeElement.getBoundingClientRect().top ?? Infinity,
      play: () => this.playInternal(),
      pause: () => this.pauseInternal(),
    });

    const target = this.hostElRef?.nativeElement;
    if (!target || typeof IntersectionObserver === 'undefined') {
      return;
    }
    this.observer = new IntersectionObserver(
      entries => this.handleVisibilityRatio(entries[0]?.intersectionRatio ?? 0),
      { threshold: [0, 0.6] },
    );
    this.observer.observe(target);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.activeVideo.unregister(this.id);
  }

  /** Exposed (rather than private) so tests can drive it directly without a real IntersectionObserver. */
  handleVisibilityRatio(ratio: number): void {
    const nowInView = ratio >= 0.6;
    if (nowInView === this.inView) {
      return;
    }
    this.inView = nowInView;
    if (!nowInView) {
      // Scrolling away forgets a manual pause -- coming back into view plays again.
      this.manuallyPaused = false;
      this.activeVideo.setEligible(this.id, false);
      return;
    }
    if (!this.errored && this.autoplayAllowed) {
      this.armed = true;
      this.activeVideo.setEligible(this.id, true);
    }
  }

  onToggle(): void {
    if (this.errored) {
      return;
    }
    this.armed = true;
    if (this.paused) {
      this.manuallyPaused = false;
      this.activeVideo.setEligible(this.id, this.inView);
      // Not yet in view by the observer's own threshold (e.g. a deliberate tap on a static
      // tile for someone with reduced motion) -- play directly rather than waiting on eligibility.
      if (!this.inView) {
        this.playInternal();
      }
    } else {
      this.manuallyPaused = true;
      this.activeVideo.setEligible(this.id, false);
      this.pauseInternal();
    }
  }

  onToggleMute(event: Event): void {
    event.stopPropagation();
    const video = this.videoElRef?.nativeElement;
    if (!video) {
      return;
    }
    video.muted = !video.muted;
    this.muted = video.muted;
  }

  onError(): void {
    this.errored = true;
    this.paused = true;
    this.activeVideo.setEligible(this.id, false);
  }

  onRetry(event: Event): void {
    event.stopPropagation();
    this.errored = false;
    const video = this.videoElRef?.nativeElement;
    if (video) {
      video.load();
    }
    if (this.inView && this.autoplayAllowed) {
      this.activeVideo.setEligible(this.id, true);
    }
  }

  private playInternal(): void {
    const video = this.videoElRef?.nativeElement;
    if (!video || this.manuallyPaused || this.errored) {
      return;
    }
    this.armed = true;
    video.play().catch(() => this.onError());
    this.paused = false;
  }

  private pauseInternal(): void {
    this.videoElRef?.nativeElement.pause();
    this.paused = true;
  }

  /** Lazily widens `preload` from 'metadata' only once this clip is actually about to play. */
  get preload(): 'metadata' | 'auto' {
    return this.armed ? 'auto' : 'metadata';
  }
}
