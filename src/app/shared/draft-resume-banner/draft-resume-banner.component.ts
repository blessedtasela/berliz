import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconsModule } from 'src/app/icons/icons.module';
import { DraftEntry } from 'src/app/models/draft.model';

/**
 * Shown atop a form/composer when DraftService already has an unfinished
 * draft for this exact flow -- lets the user choose to pick up where they
 * left off or discard it and start clean, rather than silently restoring
 * (which can be more surprising than helpful if they'd actually meant to
 * abandon it) or silently losing it (the whole reason this exists).
 */
@Component({
    selector: 'app-draft-resume-banner',
    imports: [CommonModule, IconsModule],
    template: `
    <div *ngIf="draft" class="flex items-start gap-2.5 rounded-xl border px-3.5 py-3"
      [ngClass]="dark ? 'border-amber-900/50 bg-amber-950/30' : 'border-amber-200 bg-amber-50'">
      <i-feather name="clock" [ngClass]="dark ? 'text-amber-500' : 'text-amber-600'" class="shrink-0 mt-0.5" style="width:14px;height:14px;"></i-feather>
      <div class="min-w-0 flex-1">
        <p class="text-xs font-bold" [ngClass]="dark ? 'text-amber-300' : 'text-amber-900'">
          Unfinished {{ itemLabel }} from {{ relativeTime }}
        </p>
        <p *ngIf="draft.preview" class="text-[11px] mt-0.5 truncate" [ngClass]="dark ? 'text-amber-400/80' : 'text-amber-700'">{{ draft.preview }}</p>
        <div class="flex items-center gap-2 mt-2">
          <button type="button" (click)="resume.emit(draft)"
            class="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white transition"
            [ngClass]="dark ? 'bg-amber-600 hover:bg-amber-500' : 'bg-amber-600 hover:bg-amber-700'">
            Continue
          </button>
          <button type="button" (click)="startFresh.emit()"
            class="px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition"
            [ngClass]="dark ? 'border-amber-800 text-amber-400 hover:bg-amber-950/50' : 'border-amber-300 text-amber-700 hover:bg-amber-100'">
            Start fresh
          </button>
        </div>
      </div>
    </div>
  `
})
export class DraftResumeBannerComponent {
  @Input() draft: DraftEntry | null = null;
  /** Human word for what's in progress, e.g. "post", "booking" -- read as "Unfinished {{itemLabel}} from...". */
  @Input() itemLabel = 'draft';
  /** GN-76: a brand-dark skin for a screen that's always dark regardless of the user's light/dark toggle. */
  @Input() dark = false;

  @Output() resume = new EventEmitter<DraftEntry>();
  @Output() startFresh = new EventEmitter<void>();

  get relativeTime(): string {
    if (!this.draft) return '';
    const diffMs = Date.now() - this.draft.savedAt;
    const minutes = Math.round(diffMs / 60_000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    const days = Math.round(hours / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  }
}
