import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { take } from 'rxjs/operators';

import { IconsModule } from 'src/app/icons/icons.module';
import { RecapPeriod, RecapResponse } from 'src/app/models/recap.interface';
import { RecapService } from 'src/app/services/recap.service';
import { PostService } from 'src/app/services/post.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

const PERIODS: { key: RecapPeriod; label: string }[] = [
  { key: 'month', label: '30 days' },
  { key: 'quarter', label: '90 days' },
  { key: 'year', label: 'Year' },
  { key: 'all', label: 'All time' },
];

/** D2 — the full "Your time in Berliz" recap, with a period switcher and share-as-post. */
@Component({
  selector: 'app-recap-modal',
  standalone: true,
  imports: [CommonModule, RouterModule, IconsModule],
  template: `
    <div class="bg-white rounded-2xl w-full max-w-lg shadow-xl flex flex-col max-h-[85vh]">
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h2 class="text-sm font-bold text-gray-900">Your time in Berliz</h2>
        <button type="button" (click)="dialogRef.close()"
          class="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center transition text-gray-400">
          <i-feather name="x" style="width:14px;height:14px;"></i-feather>
        </button>
      </div>

      <div class="px-4 pt-3">
        <div class="flex gap-1.5 flex-wrap">
          <button *ngFor="let p of periods" type="button" (click)="setPeriod(p.key)"
            class="text-[11px] font-semibold px-2.5 py-1 rounded-lg transition"
            [ngClass]="period === p.key ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'">
            {{ p.label }}
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        <div *ngIf="loading" class="flex items-center justify-center py-12">
          <i-feather name="loader" class="animate-spin text-gray-300" style="width:20px;height:20px;"></i-feather>
        </div>

        <ng-container *ngIf="!loading && recap as r">
          <p class="text-sm font-bold text-gray-900">{{ r.headline }}</p>

          <div class="grid grid-cols-3 gap-2">
            <div class="bg-gray-50 rounded-xl p-3 flex flex-col gap-0.5">
              <span class="text-lg font-extrabold text-gray-900">{{ r.activeDays }}</span>
              <span class="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">Active days</span>
            </div>
            <div class="bg-gray-50 rounded-xl p-3 flex flex-col gap-0.5">
              <span class="text-lg font-extrabold text-gray-900">{{ r.workoutCount }}</span>
              <span class="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">Workouts</span>
            </div>
            <div class="bg-gray-50 rounded-xl p-3 flex flex-col gap-0.5">
              <span class="text-lg font-extrabold text-gray-900">{{ r.runCount }}</span>
              <span class="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">Runs</span>
            </div>
            <div class="bg-gray-50 rounded-xl p-3 flex flex-col gap-0.5">
              <span class="text-lg font-extrabold text-gray-900">{{ r.totalRunKm }}</span>
              <span class="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">km run</span>
            </div>
            <div class="bg-gray-50 rounded-xl p-3 flex flex-col gap-0.5">
              <span class="text-lg font-extrabold text-gray-900">{{ r.longestStreakDays }}</span>
              <span class="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">Best streak</span>
            </div>
            <div class="bg-gray-50 rounded-xl p-3 flex flex-col gap-0.5">
              <span class="text-lg font-extrabold text-gray-900">{{ r.newConnections }}</span>
              <span class="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">New connections</span>
            </div>
          </div>

          <div *ngIf="r.personalBests?.length" class="flex flex-col gap-1.5">
            <p class="text-[10px] font-bold uppercase tracking-wide text-gray-400">Personal bests</p>
            <div *ngFor="let pb of r.personalBests" class="flex items-center gap-2 text-xs text-gray-700">
              <i-feather name="award" class="text-amber-500 shrink-0" style="width:12px;height:12px;"></i-feather>
              {{ pb }}
            </div>
          </div>

          <div *ngIf="r.rankMoves?.length" class="flex flex-col gap-1.5">
            <p class="text-[10px] font-bold uppercase tracking-wide text-gray-400">Rank moves</p>
            <div *ngFor="let m of r.rankMoves" class="text-xs text-gray-700">
              <span class="font-bold">{{ m.rank }}</span> in {{ m.discipline }}
              <span class="text-gray-400">· {{ m.awardedAt | date:'MMM d' }}</span>
            </div>
          </div>

          <div *ngIf="r.topPartners?.length" class="flex flex-col gap-1.5">
            <p class="text-[10px] font-bold uppercase tracking-wide text-gray-400">Top training partners</p>
            <div *ngFor="let p of r.topPartners" class="flex items-center justify-between text-xs">
              <span class="font-bold text-gray-800 capitalize truncate">{{ p.name }}</span>
              <span class="text-gray-400 shrink-0">{{ p.sessionsTogether }} together</span>
            </div>
          </div>

          <p *ngIf="!r.workoutCount && !r.runCount" class="text-xs text-gray-400">
            Nothing logged in this window yet — log a workout or a run and your recap fills in.
          </p>
        </ng-container>
      </div>

      <div class="px-4 py-3 border-t border-gray-100 flex items-center justify-end gap-2">
        <button type="button" (click)="dialogRef.close()"
          class="text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition">
          Close
        </button>
        <button type="button" (click)="shareAsPost()" [disabled]="!recap || sharing"
          class="text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-1.5">
          <i-feather [name]="sharing ? 'loader' : 'share-2'" [class.animate-spin]="sharing" style="width:12px;height:12px;"></i-feather>
          Share as post
        </button>
      </div>
    </div>
  `,
})
export class RecapModalComponent {
  readonly periods = PERIODS;
  period: RecapPeriod = 'year';
  recap?: RecapResponse;
  loading = true;
  sharing = false;

  constructor(
    public dialogRef: MatDialogRef<RecapModalComponent>,
    private recapService: RecapService,
    private postService: PostService,
    private snackBar: SnackBarService,
    @Inject(MAT_DIALOG_DATA) public data: { period?: RecapPeriod } | null,
  ) {
    if (data?.period) this.period = data.period;
    this.load();
  }

  setPeriod(p: RecapPeriod): void {
    if (p === this.period) return;
    this.period = p;
    this.load();
  }

  private load(): void {
    this.loading = true;
    this.recapService.getMyRecap(this.period).pipe(take(1)).subscribe({
      next: res => { this.recap = res.data; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  shareAsPost(): void {
    if (!this.recap || this.sharing) return;
    this.sharing = true;
    this.postService.addPost({ content: this.recap.shareText, activityType: 'MILESTONE' })
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.sharing = false;
          this.snackBar.openSnackBar('Recap shared to your timeline', 'success');
          this.dialogRef.close('shared');
        },
        error: () => {
          this.sharing = false;
          this.snackBar.openSnackBar('Could not share the recap', 'error');
        },
      });
  }
}
