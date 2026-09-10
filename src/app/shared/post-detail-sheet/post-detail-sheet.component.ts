import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';

import { IconsModule } from 'src/app/icons/icons.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { PostResponse } from 'src/app/models/post.interface';
import { PostCommentsComponent } from 'src/app/shared/post-comments/post-comments.component';

/**
 * Instagram/TikTok-style bottom sheet for a post: the media pinned at the
 * top, the post text and the full comment thread scrolling below it. Opens at
 * a half height, drags up to (nearly) full, and a downward drag/flick past
 * the halfway point dismisses it. Replaces the old full-screen
 * `app-post-media-viewer` lightbox for post images everywhere.
 *
 * Only the grabber + header are draggable, so scrolling the comments never
 * moves the sheet. Honours `prefers-reduced-motion` by opening straight at
 * full with no transitions.
 */
@Component({
  selector: 'app-post-detail-sheet',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconsModule, SharedModule, PostCommentsComponent],
  templateUrl: './post-detail-sheet.component.html',
  styleUrls: ['./post-detail-sheet.component.css'],
})
export class PostDetailSheetComponent implements OnInit, OnDestroy {
  @Input({ required: true }) post!: PostResponse;
  @Input() profileRoutePrefix = '/dashboard/user';

  @Output() closed = new EventEmitter<void>();

  private readonly FULL_RATIO = 0.92;
  private readonly HALF_RATIO = 0.55;
  private readonly FLICK = 0.6; // px/ms

  /** translateY of the sheet in px -- 0 = full, `hiddenAtHalf` = half, > that = dragging toward close. */
  translate = 0;
  snap: 'half' | 'full' = 'half';
  dragging = false;
  reducedMotion = false;

  /** Full sheet height in px -- also the template's [style.height.px]. */
  fullPx = 0;
  private halfPx = 0;
  private hiddenAtHalf = 0;

  private startY = 0;
  private startTranslate = 0;
  private lastY = 0;
  private lastT = 0;
  private velocity = 0;
  private closing = false;

  get mediaUrl(): string | null {
    return this.post?.photoUrl ?? null;
  }

  get isVideo(): boolean {
    return /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(this.mediaUrl ?? '');
  }

  ngOnInit(): void {
    this.reducedMotion = typeof window !== 'undefined'
      && !!window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.recompute();
    // Start just off the bottom, then animate up to the resting snap point.
    this.translate = this.fullPx + 60;
    if (this.reducedMotion) {
      this.snap = 'full';
      this.applySnap();
    } else {
      requestAnimationFrame(() => {
        this.snap = 'half';
        this.applySnap();
      });
    }
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  @HostListener('window:resize')
  onResize(): void {
    this.recompute();
    if (!this.dragging && !this.closing) this.applySnap();
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    this.close();
  }

  private recompute(): void {
    const vh = (typeof window !== 'undefined' && window.innerHeight) || 800;
    this.fullPx = vh * this.FULL_RATIO;
    this.halfPx = vh * this.HALF_RATIO;
    this.hiddenAtHalf = this.fullPx - this.halfPx;
  }

  private applySnap(): void {
    this.translate = this.snap === 'full' ? 0 : this.hiddenAtHalf;
  }

  /** Double-tap / click the grabber to jump between half and full. */
  toggleSnap(): void {
    this.snap = this.snap === 'full' ? 'half' : 'full';
    this.applySnap();
  }

  onDragStart(e: PointerEvent): void {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    this.dragging = true;
    this.closing = false;
    this.startY = e.clientY;
    this.startTranslate = this.translate;
    this.lastY = e.clientY;
    this.lastT = performance.now();
    this.velocity = 0;
  }

  onDragMove(e: PointerEvent): void {
    if (!this.dragging) return;
    const dy = e.clientY - this.startY;
    this.translate = Math.min(this.fullPx + 60, Math.max(0, this.startTranslate + dy));

    const now = performance.now();
    const dt = now - this.lastT;
    if (dt > 0) this.velocity = (e.clientY - this.lastY) / dt;
    this.lastY = e.clientY;
    this.lastT = now;
  }

  onDragEnd(): void {
    if (!this.dragging) return;
    this.dragging = false;

    const flungDown = this.velocity > this.FLICK;
    const flungUp = this.velocity < -this.FLICK;
    const closeThreshold = this.hiddenAtHalf + this.halfPx * 0.4;

    if ((flungDown && this.translate > this.hiddenAtHalf * 0.5) || this.translate > closeThreshold) {
      this.close();
      return;
    }
    if (flungUp) { this.snap = 'full'; this.applySnap(); return; }
    if (flungDown) { this.snap = 'half'; this.applySnap(); return; }

    this.snap = this.translate < this.hiddenAtHalf / 2 ? 'full' : 'half';
    this.applySnap();
  }

  close(): void {
    if (this.closing) return;
    this.closing = true;
    this.translate = this.fullPx + 60;
    if (this.reducedMotion) {
      this.closed.emit();
    } else {
      setTimeout(() => this.closed.emit(), 260);
    }
  }
}
