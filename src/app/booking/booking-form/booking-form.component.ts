import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';

import { SnackBarService } from 'src/app/services/snack-bar.service';
import {
  createBooking,
  createBookingFailure,
  createBookingSuccess
} from 'src/app/state/booking/booking.actions';
import {
  clearAvailableSlots,
  loadAvailableSlots
} from 'src/app/state/availability/availability.actions';
import { selectAvailabilityLoading, selectAvailableSlots } from 'src/app/state/availability/availability.selectors';
import { AvailableSlot } from 'src/app/models/availability.model';

import { genericError } from 'src/validators/form-validators.module';

/** Exactly one of trainerId / centerId is set — a booking is with one or the other. */
export interface BookingFormData {
  trainerId?: number;
  centerId?: number;
  providerName: string;
}

interface DateStripDay {
  value: string; // yyyy-MM-dd
  dayLabel: string; // "Mon"
  dateLabel: string; // "14"
  isToday: boolean;
}

const DATE_STRIP_LENGTH = 21;
const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

@Component({
  selector: 'app-booking-form',
  templateUrl: './booking-form.component.html',
  styleUrls: ['./booking-form.component.css']
})
export class BookingFormComponent implements OnInit, OnDestroy {

  bookingForm!: FormGroup;
  invalidForm = false;
  submitting = false;
  pastDate = false;

  readonly maxNotesLength = 500;
  readonly durationOptions = [30, 45, 60, 90, 120];

  // ── Calendar / slot-picker state ──────────────────────────────────────
  dateStrip: DateStripDay[] = this.buildDateStrip();
  selectedDate: string = this.dateStrip[0].value;
  selectedSlot: AvailableSlot | null = null;

  slots: AvailableSlot[] = [];
  slotDurationMinutes = 60;
  slotsLoading = false;

  /** null = not yet known (first response pending). */
  availabilityConfigured: boolean | null = null;
  slotsMessage = '';

  /** True once we know this provider has no availability configured — falls
   *  back to the old manual date/time entry rather than a broken calendar. */
  get useManualEntry(): boolean {
    return this.availabilityConfigured === false;
  }

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private actions$: Actions,
    private snackBar: SnackBarService,
    public dialogRef: MatDialogRef<BookingFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BookingFormData
  ) { }

  ngOnInit(): void {
    this.bookingForm = this.fb.group({
      date: ['', Validators.required],
      time: ['', Validators.required],
      durationMinutes: [60, Validators.required],
      notes: ['', Validators.maxLength(this.maxNotesLength)]
    });

    this.store.select(selectAvailabilityLoading)
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.slotsLoading = loading);

    this.store.select(selectAvailableSlots)
      .pipe(takeUntil(this.destroy$))
      .subscribe(response => {
        if (!response) return;
        this.availabilityConfigured = response.availabilityConfigured;
        this.slots = response.slots ?? [];
        this.slotDurationMinutes = response.slotDurationMinutes ?? 60;
        this.slotsMessage = response.message ?? '';
        this.selectedSlot = null;
      });

    this.fetchSlotsForSelectedDate();

    this.actions$
      .pipe(ofType(createBookingSuccess), takeUntil(this.destroy$))
      .subscribe(({ response }) => {
        this.submitting = false;
        this.snackBar.openSnackBar(
          response?.data?.message || response?.message || 'Your booking request has been sent.',
          ''
        );
        this.dialogRef.close(true);
      });

    this.actions$
      .pipe(ofType(createBookingFailure), takeUntil(this.destroy$))
      .subscribe(({ error }) => {
        this.submitting = false;
        this.snackBar.openSnackBar(error || genericError, 'error');
      });
  }

  ngOnDestroy(): void {
    this.store.dispatch(clearAvailableSlots());
    this.destroy$.next();
    this.destroy$.complete();
  }

  get remaining(): number {
    const value: string = this.bookingForm?.get('notes')?.value ?? '';
    return this.maxNotesLength - value.length;
  }

  /** Today's date in yyyy-MM-dd, used as the manual-entry date input's `min`. */
  get minDate(): string {
    return this.formatDateLocal(new Date());
  }

  // ── Date strip ───────────────────────────────────────────────────────
  private buildDateStrip(): DateStripDay[] {
    const days: DateStripDay[] = [];
    const today = new Date();
    for (let i = 0; i < DATE_STRIP_LENGTH; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      days.push({
        value: this.formatDateLocal(d),
        dayLabel: WEEKDAY_LABELS[d.getDay()],
        dateLabel: String(d.getDate()),
        isToday: i === 0
      });
    }
    return days;
  }

  private formatDateLocal(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  selectDate(day: DateStripDay): void {
    if (this.selectedDate === day.value) return;
    this.selectedDate = day.value;
    this.selectedSlot = null;
    this.fetchSlotsForSelectedDate();
  }

  private fetchSlotsForSelectedDate(): void {
    this.store.dispatch(loadAvailableSlots({
      trainerId: this.data.trainerId,
      centerId: this.data.centerId,
      date: this.selectedDate
    }));
  }

  selectSlot(slot: AvailableSlot): void {
    this.selectedSlot = slot;
  }

  slotLabel(slot: AvailableSlot): string {
    return this.formatTimeLabel(slot.startTime);
  }

  private formatTimeLabel(time: string): string {
    const [hStr, mStr] = time.split(':');
    let h = parseInt(hStr, 10);
    const suffix = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    return `${h}:${mStr} ${suffix}`;
  }

  // ── Submit ───────────────────────────────────────────────────────────
  submitForm(): void {
    if (this.submitting) return;

    if (this.useManualEntry) {
      this.submitManual();
    } else {
      this.submitFromSlot();
    }
  }

  private submitFromSlot(): void {
    if (!this.selectedSlot) {
      this.snackBar.openSnackBar('Pick a date and an available time.', 'error');
      return;
    }

    const scheduledAt = new Date(`${this.selectedDate}T${this.selectedSlot.startTime}`);
    if (isNaN(scheduledAt.getTime()) || scheduledAt.getTime() < Date.now()) {
      this.snackBar.openSnackBar('That time has already passed — pick another slot.', 'error');
      this.selectedSlot = null;
      this.fetchSlotsForSelectedDate();
      return;
    }

    const payload = {
      id: null,
      trainerId: this.data.trainerId ?? null,
      centerId: this.data.centerId ?? null,
      scheduledAt: scheduledAt.toISOString(),
      durationMinutes: this.slotDurationMinutes,
      notes: (this.bookingForm.value.notes ?? '').trim()
    };

    this.submitting = true;
    this.store.dispatch(createBooking({ data: payload }));
  }

  private submitManual(): void {
    if (this.bookingForm.invalid) {
      this.invalidForm = true;
      this.bookingForm.markAllAsTouched();
      return;
    }

    const value = this.bookingForm.value;
    const scheduledAt = new Date(`${value.date}T${value.time}`);

    if (isNaN(scheduledAt.getTime()) || scheduledAt.getTime() < Date.now()) {
      this.pastDate = true;
      return;
    }
    this.pastDate = false;

    const payload = {
      id: null,
      trainerId: this.data.trainerId ?? null,
      centerId: this.data.centerId ?? null,
      scheduledAt: scheduledAt.toISOString(),
      durationMinutes: Number(value.durationMinutes),
      notes: (value.notes ?? '').trim()
    };

    this.invalidForm = false;
    this.submitting = true;
    this.store.dispatch(createBooking({ data: payload }));
  }

  closeDialog(): void {
    this.dialogRef.close(false);
  }
}
