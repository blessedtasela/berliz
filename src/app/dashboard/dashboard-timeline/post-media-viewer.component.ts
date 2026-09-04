import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';

import { IconsModule } from 'src/app/icons/icons.module';
import { SharedModule } from 'src/app/shared/shared.module';

/**
 * Full-screen media lightbox for a timeline post — Instagram-style: tap a
 * post's image/video, it opens edge-to-edge on a dark backdrop. Closes on
 * backdrop click, the X button, or Esc. Renders a <video> when the URL looks
 * like a video file, otherwise an <img>.
 */
@Component({
  selector: 'app-post-media-viewer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconsModule, SharedModule],
  template: `
    <div
      class="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-sm flex flex-col"
      (click)="closed.emit()"
    >
      <div class="flex items-center justify-between px-4 py-3 text-white/90 shrink-0">
        <span class="text-xs font-semibold truncate">{{ caption || 'Post' }}</span>
        <button
          type="button"
          (click)="closed.emit(); $event.stopPropagation()"
          class="p-1.5 rounded-full hover:bg-white/10 transition"
          aria-label="Close"
        >
          <i-feather name="x" style="width:20px;height:20px;"></i-feather>
        </button>
      </div>

      <div class="flex-1 min-h-0 flex items-center justify-center p-4">
        <video
          *ngIf="isVideo; else imageTpl"
          [src]="url | strapiUrl"
          class="max-h-full max-w-full rounded-lg"
          controls
          autoplay
          playsinline
          (click)="$event.stopPropagation()"
        ></video>
        <ng-template #imageTpl>
          <img
            [src]="url | strapiUrl"
            alt=""
            class="max-h-full max-w-full object-contain rounded-lg select-none"
            (click)="$event.stopPropagation()"
          />
        </ng-template>
      </div>
    </div>
  `,
})
export class PostMediaViewerComponent {
  /** Raw media URL (Strapi-relative or absolute) — required. */
  @Input({ required: true }) url!: string;
  /** Optional line shown in the top bar (e.g. the author's name). */
  @Input() caption?: string;

  @Output() closed = new EventEmitter<void>();

  get isVideo(): boolean {
    return /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(this.url ?? '');
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    this.closed.emit();
  }
}
