import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { IconsModule } from 'src/app/icons/icons.module';
import { CHALLENGE_METRICS, ChallengeResponse } from 'src/app/models/challenge.interface';
import { ChallengeService } from 'src/app/services/challenge.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

/** Challenge detail + leaderboard. Returns true on close if membership changed. */
@Component({
  selector: 'app-challenge-detail-modal',
  standalone: true,
  imports: [CommonModule, RouterModule, IconsModule],
  template: `
    <div class="bg-white rounded-2xl w-full max-w-md shadow-xl flex flex-col max-h-[80vh]">
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h2 class="text-sm font-bold text-gray-900 truncate pr-2">{{ challenge?.title || 'Challenge' }}</h2>
        <button type="button" (click)="close()"
          class="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center transition text-gray-400 shrink-0">
          <i-feather name="x" style="width:14px;height:14px;"></i-feather>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        <div *ngIf="loading" class="flex items-center justify-center py-10">
          <i-feather name="loader" class="animate-spin text-gray-300" style="width:18px;height:18px;"></i-feather>
        </div>

        <ng-container *ngIf="!loading && challenge as c">
          <p *ngIf="c.description" class="text-xs text-gray-600 whitespace-pre-line">{{ c.description }}</p>
          <p class="text-[11px] text-gray-400">
            {{ goalLabel(c) }} · {{ c.startsAt | date:'MMM d' }}–{{ c.endsAt | date:'MMM d' }}
            <span *ngIf="!c.active"> · ended</span>
          </p>

          <button type="button" (click)="toggleJoin(c)" [disabled]="busy"
            class="self-start text-[11px] font-semibold px-3 py-1.5 rounded-lg transition"
            [ngClass]="c.joined ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-sky-600 text-white hover:bg-sky-700'">
            {{ c.joined ? 'Leave' : 'Join challenge' }}
          </button>

          <div class="flex flex-col gap-1.5 mt-1">
            <p class="text-[10px] font-bold uppercase tracking-wide text-gray-400">Leaderboard</p>
            <div *ngFor="let p of c.leaderboard; let i = index" class="flex items-center gap-2.5">
              <span class="w-5 text-[11px] font-bold text-gray-400 text-right">{{ i + 1 }}</span>
              <img *ngIf="p.profilePhoto" [src]="'data:image/*;base64,' + p.profilePhoto" alt="" noZoom
                class="w-7 h-7 rounded-full object-cover object-top border border-gray-200 shrink-0" />
              <div *ngIf="!p.profilePhoto" class="w-7 h-7 rounded-full bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0">
                <i-feather name="user" class="text-sky-500" style="width:12px;height:12px;"></i-feather>
              </div>
              <span class="text-xs font-bold text-gray-900 capitalize truncate flex-1">{{ p.name }}</span>
              <span class="text-[11px] font-semibold shrink-0" [class.text-emerald-600]="p.completed" [class.text-gray-500]="!p.completed">
                {{ p.progress }} / {{ c.goal }}
                <i-feather *ngIf="p.completed" name="check" style="width:11px;height:11px;" class="inline"></i-feather>
              </span>
            </div>
            <p *ngIf="!c.leaderboard?.length" class="text-xs text-gray-400">No participants yet.</p>
          </div>
        </ng-container>
      </div>
    </div>
  `,
})
export class ChallengeDetailModalComponent {
  challenge?: ChallengeResponse;
  loading = true;
  busy = false;
  private changed = false;

  constructor(
    public dialogRef: MatDialogRef<ChallengeDetailModalComponent>,
    private challengeService: ChallengeService,
    private snackBar: SnackBarService,
    @Inject(MAT_DIALOG_DATA) public data: { id: number },
  ) {
    this.load();
  }

  private load(): void {
    this.loading = true;
    this.challengeService.get(this.data.id).pipe(take(1)).subscribe({
      next: res => { this.loading = false; this.challenge = res.data; },
      error: () => { this.loading = false; },
    });
  }

  toggleJoin(c: ChallengeResponse): void {
    if (this.busy) return;
    this.busy = true;
    const req$: Observable<unknown> = c.joined
      ? this.challengeService.leave(c.id)
      : this.challengeService.join(c.id);
    req$.pipe(take(1)).subscribe({
      next: () => { this.busy = false; this.changed = true; this.load(); },
      error: () => { this.busy = false; this.snackBar.openSnackBar('Could not update', 'error'); },
    });
  }

  goalLabel(c: ChallengeResponse): string {
    const m = CHALLENGE_METRICS.find(x => x.value === c.metric);
    return `${c.goal} ${m?.unit ?? ''}`.trim();
  }

  close(): void {
    this.dialogRef.close(this.changed);
  }
}
