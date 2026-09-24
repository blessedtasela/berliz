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

interface DayRow {
  dayOfWeek: number;
  name: string;
  isActive: boolean;
  startTime: string;
  endTime: string;
  invalid: boolean;
}

/**
 * Weekly schedule editor — 7 rows, one per day of week, each toggleable
 * active/inactive with a start/end time. "Save" always sends the whole week
 * at once (bulk replace-the-week, matching how the backend stores it).
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

    this.store.select(selectAvailabilityLoading)
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.loading = loading);

    this.store.select(selectMyAvailability)
      .pipe(takeUntil(this.destroy$))
      .subscribe(rows => {
        if (!rows || rows.length === 0) return;
        this.days = this.buildDefaultDays().map(defaultDay => {
          const match = rows.find(r => r.dayOfWeek === defaultDay.dayOfWeek);
          if (!match) return defaultDay;
          return {
            ...defaultDay,
            isActive: !!match.isActive,
            startTime: (match.startTime || defaultDay.startTime).slice(0, 5),
            endTime: (match.endTime || defaultDay.endTime).slice(0, 5),
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
      isActive: false,
      startTime: '09:00',
      endTime: '17:00',
      invalid: false,
    }));
  }

  toggleDay(day: DayRow): void {
    day.isActive = !day.isActive;
    day.invalid = false;
  }

  get hasErrors(): boolean {
    return this.days.some(d => d.isActive && d.startTime >= d.endTime);
  }

  get activeCount(): number {
    return this.days.filter(d => d.isActive).length;
  }

  save(): void {
    if (this.saving) return;

    let hasError = false;
    for (const d of this.days) {
      d.invalid = d.isActive && (!d.startTime || !d.endTime || d.startTime >= d.endTime);
      if (d.invalid) hasError = true;
    }
    if (hasError) {
      this.snackBar.openSnackBar('Fix the highlighted days — start time must be before end time.', 'error');
      return;
    }

    this.saving = true;
    this.store.dispatch(setMyAvailability({
      days: this.days.map(d => ({
        dayOfWeek: d.dayOfWeek,
        isActive: d.isActive,
        startTime: d.startTime,
        endTime: d.endTime,
      }))
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
}
