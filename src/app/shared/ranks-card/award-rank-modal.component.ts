import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { take } from 'rxjs/operators';

import { IconsModule } from 'src/app/icons/icons.module';
import { RankService } from 'src/app/services/rank.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

export interface AwardRankData {
  userId: number;
  userName: string;
}

/** Trainer / center: promote a member to a new rank in a discipline. */
@Component({
  selector: 'app-award-rank-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  template: `
    <div class="bg-white rounded-2xl w-full max-w-sm shadow-xl flex flex-col">
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h2 class="text-sm font-bold text-gray-900">Award a rank</h2>
        <button type="button" (click)="dialogRef.close(false)"
          class="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center transition text-gray-400">
          <i-feather name="x" style="width:14px;height:14px;"></i-feather>
        </button>
      </div>

      <div class="p-4 flex flex-col gap-3">
        <p class="text-[11px] text-gray-500">Promoting <span class="font-bold text-gray-800">{{ data.userName }}</span>.</p>

        <label class="text-[10px] font-bold uppercase tracking-wide text-gray-400">Discipline</label>
        <input [(ngModel)]="discipline" placeholder="e.g. Brazilian Jiu-Jitsu"
          class="text-xs rounded-lg px-3 py-2 border border-gray-200 focus:outline-none focus:ring-1 focus:border-sky-400 focus:ring-sky-400/30" />

        <label class="text-[10px] font-bold uppercase tracking-wide text-gray-400">New rank</label>
        <input [(ngModel)]="rank" placeholder="e.g. Blue Belt · 2 stripes"
          class="text-xs rounded-lg px-3 py-2 border border-gray-200 focus:outline-none focus:ring-1 focus:border-sky-400 focus:ring-sky-400/30" />

        <label class="text-[10px] font-bold uppercase tracking-wide text-gray-400">Note (optional)</label>
        <textarea [(ngModel)]="note" rows="2" placeholder="A word about the promotion"
          class="text-xs rounded-lg px-3 py-2 border border-gray-200 resize-none focus:outline-none focus:ring-1 focus:border-sky-400 focus:ring-sky-400/30"></textarea>

        <div class="flex items-center gap-2 justify-end pt-1">
          <button type="button" (click)="dialogRef.close(false)"
            class="px-3 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 transition">Cancel</button>
          <button type="button" (click)="submit()" [disabled]="saving || !discipline.trim() || !rank.trim()"
            class="px-4 py-2 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white transition disabled:opacity-40 disabled:cursor-not-allowed">
            {{ saving ? 'Awarding…' : 'Award' }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class AwardRankModalComponent {
  discipline = '';
  rank = '';
  note = '';
  saving = false;

  constructor(
    public dialogRef: MatDialogRef<AwardRankModalComponent>,
    private rankService: RankService,
    private snackBar: SnackBarService,
    @Inject(MAT_DIALOG_DATA) public data: AwardRankData,
  ) {}

  submit(): void {
    if (this.saving || !this.discipline.trim() || !this.rank.trim()) return;
    this.saving = true;
    this.rankService.award({
      userId: this.data.userId,
      discipline: this.discipline.trim(),
      rank: this.rank.trim(),
      note: this.note.trim() || undefined,
    }).pipe(take(1)).subscribe({
      next: () => {
        this.saving = false;
        this.snackBar.openSnackBar('Rank awarded', '');
        this.dialogRef.close(true);
      },
      error: err => {
        this.saving = false;
        this.snackBar.openSnackBar(err?.error?.message || 'Could not award this rank', 'error');
      },
    });
  }
}
