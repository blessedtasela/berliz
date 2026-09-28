import { Component, OnDestroy, OnInit } from '@angular/core';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';

import { take } from 'rxjs/operators';
import { DAY_NAMES_SHORT } from 'src/app/models/availability.model';
import { AvailabilityService } from 'src/app/services/availability.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import {
  loadMyAvailability,
  setMyAvailability,
  setMyAvailabilityFailure,
  setMyAvailabilitySuccess
} from 'src/app/state/availability/availability.actions';
import { selectAvailabilityLoading, selectMyAvailability } from 'src/app/state/availability/availability.selectors';

import { genericError } from 'src/validators/form-validators.module';

interface TimeBlock {
  startTime: string;
  endTime: string;
  invalid: boolean;
}

interface DayRow {
  dayOfWeek: number;
  name: string;
  /** Empty = day off. Any number of non-overlapping blocks otherwise -- a split shift like 5-6am, 11am-3pm, 9pm-midnight is three blocks on the same day. */
  blocks: TimeBlock[];
}

/**
 * Weekly schedule editor — 7 rows, one per day of week. Each day can hold any
 * number of independent time blocks (add/remove freely) rather than a single
 * start/end pair, so a split shift doesn't need to be approximated as one
 * contiguous window. "Save" always sends the whole week at once (bulk
 * replace-the-week, matching how the backend stores it) -- one entry per
 * block, so two blocks on the same day are just two entries with the same
 * dayOfWeek.
 */
@Component({
  selector: 'app-my-availability-editor',
  templateUrl: './my-availability-editor.component.html',
  styleUrls: ['./my-availability-editor.component.css']
})
export class MyAvailabilityEditorComponent implements OnInit, OnDestroy {

  days: DayRow[] = this.buildDefaultDays();
  loading = false;
  saving = false;

  /** Shown so a trainer/center understands their hours are zone-aware -- see AvailabilityService.setMyAvailability's own doc comment for the bug this closes. */
  get detectedTimezone(): string {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return 'your local time';
    }
  }

  /** The platform default every provider starts on until they override it — mirrors the backend's own AvailabilityServiceImplement.DEFAULT_LEAD_TIME_MINUTES. */
  readonly defaultLeadTimeMinutes = 60;
  /** null = using the platform default; a number = this provider's own override. Bound to the input as a string so the field can sit genuinely empty rather than showing a stray 0. */
  leadTimeMinutes: number | null = null;
  leadTimeLoading = true;
  leadTimeSaving = false;

  /** The platform default every provider starts on until they override it — mirrors the backend's own AvailabilityServiceImplement.DEFAULT_SLOT_MINUTES. */
  readonly defaultSlotDurationMinutes = 60;
  /** null = using the platform default; a number = this provider's own override. */
  slotDurationMinutes: number | null = null;
  slotDurationLoading = true;
  slotDurationSaving = false;

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private actions$: Actions,
    private availabilityService: AvailabilityService,
    private snackBar: SnackBarService,
  ) { }

  ngOnInit(): void {
    this.store.dispatch(loadMyAvailability());
    this.loadLeadTime();
    this.loadSlotDuration();

    this.store.select(selectAvailabilityLoading)
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.loading = loading);

    this.store.select(selectMyAvailability)
      .pipe(takeUntil(this.destroy$))
      .subscribe(rows => {
        if (!rows || rows.length === 0) return;
        this.days = this.buildDefaultDays().map(defaultDay => {
          const matches = rows
            .filter(r => r.dayOfWeek === defaultDay.dayOfWeek && r.isActive)
            .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
          if (matches.length === 0) return defaultDay;
          return {
            ...defaultDay,
            blocks: matches.map(r => ({
              startTime: (r.startTime || '09:00').slice(0, 5),
              endTime: (r.endTime || '17:00').slice(0, 5),
              invalid: false,
            })),
          };
        });
      });

    this.actions$
      .pipe(ofType(setMyAvailabilitySuccess), takeUntil(this.destroy$))
      .subscribe(() => {
        this.saving = false;
        this.snackBar.openSnackBar('Your availability has been saved.', '');
      });

    this.actions$
      .pipe(ofType(setMyAvailabilityFailure), takeUntil(this.destroy$))
      .subscribe(({ error }) => {
        this.saving = false;
        this.snackBar.openSnackBar(error || genericError, 'error');
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildDefaultDays(): DayRow[] {
    return DAY_NAMES_SHORT.map((name, dayOfWeek) => ({
      dayOfWeek,
      name,
      blocks: [],
    }));
  }

  get activeCount(): number {
    return this.days.filter(d => d.blocks.length > 0).length;
  }

  get hasErrors(): boolean {
    return this.days.some(d => d.blocks.some(b => b.invalid || !b.startTime || !b.endTime || b.startTime >= b.endTime));
  }

  /** Angular template expressions can't contain arrow functions -- this replaces
   *  an inline `day.blocks.some(b => b.invalid)` in the template. */
  dayHasInvalidBlock(day: DayRow): boolean {
    return day.blocks.some(b => b.invalid);
  }

  /** Turns a closed day into one default 9-5 block, or clears every block to close it. */
  toggleDay(day: DayRow): void {
    day.blocks = day.blocks.length > 0 ? [] : [this.newBlock(day)];
  }

  /** Defaults the new block to start right where the day's last block ends (a one-hour block), so adding a second block for a split shift doesn't require retyping a start time that's obviously wrong. The very first block for a day defaults to a plain 9-5. */
  private newBlock(day: DayRow): TimeBlock {
    const last = day.blocks[day.blocks.length - 1];
    if (!last) return { startTime: '09:00', endTime: '17:00', invalid: false };

    const startHour = Math.min(23, parseInt(last.endTime.slice(0, 2), 10));
    const endHour = Math.min(23, startHour + 1);
    const pad = (n: number) => String(n).padStart(2, '0');
    return { startTime: `${pad(startHour)}:00`, endTime: `${pad(endHour)}:00`, invalid: false };
  }

  addBlock(day: DayRow): void {
    day.blocks.push(this.newBlock(day));
  }

  removeBlock(day: DayRow, index: number): void {
    day.blocks.splice(index, 1);
  }

  clearBlockError(block: TimeBlock): void {
    block.invalid = false;
  }

  /** Sorts a day's blocks by start time and flags any two that overlap (touching back-to-back, e.g. 9-12 then 12-15, is fine). */
  private validateDay(day: DayRow): boolean {
    let ok = true;
    for (const b of day.blocks) {
      b.invalid = !b.startTime || !b.endTime || b.startTime >= b.endTime;
      if (b.invalid) ok = false;
    }
    const sorted = [...day.blocks].filter(b => !b.invalid).sort((a, b) => a.startTime.localeCompare(b.startTime));
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].startTime < sorted[i - 1].endTime) {
        sorted[i].invalid = true;
        sorted[i - 1].invalid = true;
        ok = false;
      }
    }
    return ok;
  }

  save(): void {
    if (this.saving) return;

    let hasError = false;
    for (const day of this.days) {
      if (!this.validateDay(day)) hasError = true;
    }
    if (hasError) {
      this.snackBar.openSnackBar('Fix the highlighted time blocks — each needs a start before its end, and blocks on the same day can\'t overlap.', 'error');
      return;
    }

    this.saving = true;
    this.store.dispatch(setMyAvailability({
      days: this.days.flatMap(day => day.blocks.map(b => ({
        dayOfWeek: day.dayOfWeek,
        isActive: true,
        startTime: b.startTime,
        endTime: b.endTime,
      })))
    }));
  }

  // ── Lead time ────────────────────────────────────────────────────────────
  // Plain service calls rather than NgRx -- this is one lightweight value with
  // no other slice of state to coordinate with, unlike the weekly days above.

  private loadLeadTime(): void {
    this.leadTimeLoading = true;
    this.availabilityService.getMyLeadTime()
      .pipe(take(1))
      .subscribe({
        next: res => {
          this.leadTimeMinutes = res?.data ?? null;
          this.leadTimeLoading = false;
        },
        error: () => { this.leadTimeLoading = false; },
      });
  }

  saveLeadTime(): void {
    if (this.leadTimeSaving) return;
    if (this.leadTimeMinutes != null && this.leadTimeMinutes < 0) {
      this.snackBar.openSnackBar('Lead time can\'t be negative.', 'error');
      return;
    }

    this.leadTimeSaving = true;
    this.availabilityService.setMyLeadTime(this.leadTimeMinutes)
      .pipe(take(1))
      .subscribe({
        next: res => {
          this.leadTimeSaving = false;
          this.snackBar.openSnackBar(res?.message || 'Lead time updated.', '');
        },
        error: (err: any) => {
          this.leadTimeSaving = false;
          this.snackBar.openSnackBar(err?.error?.message || genericError, 'error');
        },
      });
  }

  /** Clears the override so this provider goes back to the platform default. */
  resetLeadTime(): void {
    this.leadTimeMinutes = null;
    this.saveLeadTime();
  }

  // ── Slot duration ───────────────────────────────────────────────────────
  // Same plain-service-call pattern as lead time above.

  private loadSlotDuration(): void {
    this.slotDurationLoading = true;
    this.availabilityService.getMySlotDuration()
      .pipe(take(1))
      .subscribe({
        next: res => {
          this.slotDurationMinutes = res?.data ?? null;
          this.slotDurationLoading = false;
        },
        error: () => { this.slotDurationLoading = false; },
      });
  }

  saveSlotDuration(): void {
    if (this.slotDurationSaving) return;
    if (this.slotDurationMinutes != null && (this.slotDurationMinutes < 5 || this.slotDurationMinutes > 480)) {
      this.snackBar.openSnackBar('Session length must be between 5 and 480 minutes.', 'error');
      return;
    }

    this.slotDurationSaving = true;
    this.availabilityService.setMySlotDuration(this.slotDurationMinutes)
      .pipe(take(1))
      .subscribe({
        next: res => {
          this.slotDurationSaving = false;
          this.snackBar.openSnackBar(res?.message || 'Session length updated.', '');
        },
        error: (err: any) => {
          this.slotDurationSaving = false;
          this.snackBar.openSnackBar(err?.error?.message || genericError, 'error');
        },
      });
  }

  /** Clears the override so this provider goes back to the platform default. */
  resetSlotDuration(): void {
    this.slotDurationMinutes = null;
    this.saveSlotDuration();
  }
}
