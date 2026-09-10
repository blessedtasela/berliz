import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { take } from 'rxjs/operators';

import { IconsModule } from 'src/app/icons/icons.module';
import { PostService } from 'src/app/services/post.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

export interface PrCelebrationData {
  /** Human-readable "you just beat this" lines from the log response. */
  bests: string[];
  /** What kind of session set the PB, for the default post text. */
  kind: 'workout' | 'run';
}

/**
 * "🏆 New personal best!" celebration shown right after a log save that beat
 * the user's history. One tap turns it into a MILESTONE post; the draft is
 * pre-filled and editable first.
 */
@Component({
  selector: 'app-pr-celebration-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  template: `
    <div class="bg-white rounded-2xl w-full max-w-sm shadow-xl flex flex-col overflow-hidden">
      <div class="bg-gradient-to-br from-amber-400 to-orange-500 px-5 py-4 text-white">
        <div class="text-3xl">🏆</div>
        <h2 class="text-sm font-extrabold mt-1">New personal best!</h2>
        <p class="text-[11px] text-white/90">Nice work on that {{ data.kind }}.</p>
      </div>

      <div class="p-5 flex flex-col gap-3">
        <ul class="flex flex-col gap-1.5">
          <li *ngFor="let b of data.bests" class="flex items-center gap-2 text-xs font-semibold text-gray-800">
            <i-feather name="award" class="text-amber-500 shrink-0" style="width:14px;height:14px;"></i-feather>
            {{ b }}
          </li>
        </ul>

        <label class="text-[10px] font-bold uppercase tracking-wide text-gray-400">Share as a milestone post</label>
        <textarea [(ngModel)]="draft" rows="3"
          class="w-full text-xs rounded-lg px-3 py-2 border border-gray-200 focus:outline-none focus:ring-1 focus:border-sky-400 focus:ring-sky-400/30 resize-none"></textarea>

        <div class="flex items-center gap-2 justify-end pt-1">
          <button type="button" (click)="dialogRef.close(false)"
            class="px-3 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 transition">
            Not now
          </button>
          <button type="button" (click)="share()" [disabled]="posting || !draft.trim()"
            class="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white transition disabled:opacity-40 disabled:cursor-not-allowed">
            {{ posting ? 'Posting…' : 'Share' }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class PrCelebrationModalComponent {
  draft: string;
  posting = false;

  constructor(
    public dialogRef: MatDialogRef<PrCelebrationModalComponent>,
    private postService: PostService,
    private snackBar: SnackBarService,
    @Inject(MAT_DIALOG_DATA) public data: PrCelebrationData,
  ) {
    this.draft = `New personal best 🏆\n${data.bests.join('\n')}`;
  }

  share(): void {
    const content = this.draft.trim();
    if (!content || this.posting) return;
    this.posting = true;
    this.postService.addPost({ content, activityType: 'MILESTONE' }).pipe(take(1)).subscribe({
      next: () => {
        this.posting = false;
        this.snackBar.openSnackBar('Milestone shared to your timeline', '');
        this.dialogRef.close(true);
      },
      error: () => {
        this.posting = false;
        this.snackBar.openSnackBar('Could not share the post — try again', 'error');
      },
    });
  }
}
