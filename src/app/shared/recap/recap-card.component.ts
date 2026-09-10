import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { take } from 'rxjs/operators';

import { IconsModule } from 'src/app/icons/icons.module';
import { RecapResponse } from 'src/app/models/recap.interface';
import { RecapService } from 'src/app/services/recap.service';
import { RecapModalComponent } from './recap-modal.component';

/**
 * D2 — a dashboard entry point into the "Your time in Berliz" recap. Loads the
 * trailing-year summary for a teaser; the button opens the full modal.
 */
@Component({
  selector: 'app-recap-card',
  standalone: true,
  imports: [CommonModule, IconsModule],
  template: `
    <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-950 via-gray-900 to-gray-900 p-5 flex flex-col gap-3">
      <div class="pointer-events-none absolute -top-12 -right-10 w-40 h-40 rounded-full bg-red-600/20 blur-3xl"></div>
      <div class="relative flex items-center gap-2">
        <i-feather name="bar-chart-2" class="text-red-400" style="width:15px;height:15px;"></i-feather>
        <span class="text-[10px] font-bold tracking-[0.18em] uppercase text-red-400">Your time in Berliz</span>
      </div>

      <p class="relative text-sm text-zinc-200 font-semibold min-h-[2.5rem]">
        {{ loading ? 'Crunching your last year…' : (recap?.headline || 'Your recap is ready.') }}
      </p>

      <div *ngIf="!loading && recap" class="relative flex gap-4 text-zinc-300">
        <span class="text-[11px]"><span class="font-extrabold text-white">{{ recap.activeDays }}</span> active days</span>
        <span class="text-[11px]"><span class="font-extrabold text-white">{{ recap.workoutCount + recap.runCount }}</span> sessions</span>
        <span *ngIf="recap.longestStreakDays > 1" class="text-[11px]">
          <span class="font-extrabold text-white">{{ recap.longestStreakDays }}</span>-day streak
        </span>
      </div>

      <button type="button" (click)="open()"
        class="relative self-start mt-1 text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition flex items-center gap-1.5">
        See your recap
        <i-feather name="arrow-right" style="width:12px;height:12px;"></i-feather>
      </button>
    </div>
  `,
})
export class RecapCardComponent implements OnInit {
  recap?: RecapResponse;
  loading = true;

  constructor(private recapService: RecapService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.recapService.getMyRecap('year').pipe(take(1)).subscribe({
      next: res => { this.recap = res.data; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  open(): void {
    this.dialog.open(RecapModalComponent, {
      width: '540px',
      maxWidth: '95vw',
      data: { period: 'year' },
    });
  }
}
