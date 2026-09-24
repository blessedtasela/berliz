import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, take } from 'rxjs';

import { SnackBarService } from 'src/app/services/snack-bar.service';
import { SessionCreditService } from 'src/app/services/session-credit.service';
import { PromotionService } from 'src/app/services/promotion.service';
import { DraftService } from 'src/app/services/draft.service';
import { DraftEntry } from 'src/app/models/draft.model';
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
import { SessionCredit, PromoOffer } from 'src/app/models/promo-offer.model';

import { genericError } from 'src/validators/form-validators.module';

/** Exactly one of trainerId / centerId is set — a booking is with one or the other. */
export interface BookingFormData {
  trainerId?: number;
  centerId?: number;
  providerName: string;
}

/** Everything DraftService needs to fully restore an in-progress booking. */
interface BookingDraftData {
  selectedDate: string;
  selectedSlot: AvailableSlot | null;
  manualDate: string;
  manualTime: string;
  durationMinutes: number;
  notes: string;
  reward: string;
}

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

  /**
   * A client can't grab a slot starting inside this window -- the provider
   * needs lead time to see the request and get ready. Only bites on today's
   * slots; every future day is entirely bookable. Starts at the platform
   * default and is overwritten with this specific provider's own value once
   * the slots response comes back (see AvailableSlotsResponse.leadTimeMinutes
   * -- they may have set a longer or shorter notice window in their own
   * availability settings). The backend is the real gate either way; this
   * just keeps an un-bookable time off the picker so a client doesn't pick
   * one and get a rejection.
   */
  minLeadTimeMinutes = 60;

  // ── Calendar / slot-picker state ──────────────────────────────────────
  selectedDate: string = this.formatDateLocal(new Date());
  selectedSlot: AvailableSlot | null = null;

  slots: AvailableSlot[] = [];
  slotDurationMinutes = 60;
  slotsLoading = false;

  /** The earliest a slot may start given the lead-time rule -- recomputed on read so it stays current as the dialog sits open. */
  private get earliestBookableTime(): number {
    return Date.now() + this.minLeadTimeMinutes * 60_000;
  }

  /** `slots` minus any that start inside the lead-time window (only ever trims today). */
  get visibleSlots(): AvailableSlot[] {
    const cutoff = this.earliestBookableTime;
    return this.slots.filter(s => {
      const start = new Date(`${this.selectedDate}T${s.startTime}`).getTime();
      return isNaN(start) || start >= cutoff;
    });
  }

  /** True when the day has slots but the lead-time rule hid all of them -- distinct from "genuinely fully booked". */
  get allSlotsWithinLeadTime(): boolean {
    return this.slots.length > 0 && this.visibleSlots.length === 0;
  }

  /** null = not yet known (first response pending). */
  availabilityConfigured: boolean | null = null;
  slotsMessage = '';

  /** True once we know this provider has no availability configured — falls
   *  back to the old manual date/time entry rather than a broken calendar. */
  get useManualEntry(): boolean {
    return this.availabilityConfigured === false;
  }

  /** "trainer" or "center" -- this same form/dialog serves both booking contexts. */
  get providerKind(): string {
    return this.data.centerId != null ? 'center' : 'trainer';
  }

  // ── Redemption enforcement: an available reward the client can attach ──
  availableCredits: SessionCredit[] = [];
  providerPromotions: PromoOffer[] = [];

  /** One booking draft per provider -- a client could plausibly be mid-booking with one provider while browsing another. */
  private get draftId(): string {
    return String(this.data.trainerId ?? this.data.centerId ?? 'unknown');
  }

  /** Set on init when a previous session left this exact provider's booking mid-draft. */
  pendingDraft: DraftEntry<BookingDraftData> | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private actions$: Actions,
    private snackBar: SnackBarService,
    private sessionCreditService: SessionCreditService,
    private promotionService: PromotionService,
    private draftService: DraftService,
    public dialogRef: MatDialogRef<BookingFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BookingFormData
  ) { }

  ngOnInit(): void {
    this.loadRewardOptions();
    this.bookingForm = this.fb.group({
      date: ['', Validators.required],
      time: ['', Validators.required],
      durationMinutes: [60, Validators.required],
      notes: ['', Validators.maxLength(this.maxNotesLength)],
      // '' = none, otherwise 'credit:<id>' or 'promo:<id>' -- at most one reward per booking.
      reward: ['']
    });

    this.pendingDraft = this.draftService.get<BookingDraftData>('booking', this.draftId);
    this.bookingForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => this.saveDraft());

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
        this.minLeadTimeMinutes = response.leadTimeMinutes ?? 60;
        this.slotsMessage = response.message ?? '';
        this.selectedSlot = null;
      });

    this.fetchSlotsForSelectedDate();

    this.actions$
      .pipe(ofType(createBookingSuccess), takeUntil(this.destroy$))
      .subscribe(({ response }) => {
        this.submitting = false;
        this.draftService.discard('booking', this.draftId);
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

  private loadRewardOptions(): void {
    this.sessionCreditService.getMine().pipe(take(1)).subscribe({
      next: (res) => { this.availableCredits = (res?.data ?? []).filter(c => c.status === 'available'); },
      error: () => { this.availableCredits = []; }
    });

    const provider$ = this.data.centerId != null
      ? this.promotionService.getPublicForCenter(this.data.centerId)
      : this.promotionService.getPublicForTrainer(this.data.trainerId!);
    provider$.pipe(take(1)).subscribe({
      next: (res) => { this.providerPromotions = res?.data ?? []; },
      error: () => { this.providerPromotions = []; }
    });
  }

  creditLabel(c: SessionCredit): string {
    switch (c.type) {
      case 'percentage': return `${c.value ?? ''}% off`;
      case 'fixed': return `$${c.value ?? ''} off`;
      default: return 'Free session';
    }
  }

  promoLabel(p: PromoOffer): string {
    switch (p.type) {
      case 'percentage': return `${p.value ?? ''}% off -- ${p.title}`;
      case 'fixed': return `$${p.value ?? ''} off -- ${p.title}`;
      default: return p.title;
    }
  }

  /** Parses the form's `reward` control into the request fields createBooking needs. */
  private get rewardPayload(): { sessionCreditId?: number; promotionId?: number } {
    const selected: string = this.bookingForm.value.reward;
    if (!selected) return {};
    const [kind, idStr] = selected.split(':');
    const id = Number(idStr);
    return kind === 'credit' ? { sessionCreditId: id } : { promotionId: id };
  }

  get remaining(): number {
    const value: string = this.bookingForm?.get('notes')?.value ?? '';
    return this.maxNotesLength - value.length;
  }

  private formatDateLocal(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  selectDate(dateValue: string): void {
    if (this.selectedDate === dateValue) return;
    this.selectedDate = dateValue;
    this.selectedSlot = null;
    this.fetchSlotsForSelectedDate();
    this.saveDraft();
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
    this.saveDraft();
  }

  // ── Draft (unfinished booking) ──────────────────────────────────────────

  /** "Continue" on the resume banner. */
  resumeDraft(): void {
    if (!this.pendingDraft) return;
    const d = this.pendingDraft.data;
    this.selectedDate = d.selectedDate;
    this.selectedSlot = d.selectedSlot;
    this.bookingForm.patchValue({
      date: d.manualDate,
      time: d.manualTime,
      durationMinutes: d.durationMinutes,
      notes: d.notes,
      reward: d.reward,
    });
    this.fetchSlotsForSelectedDate();
    this.pendingDraft = null;
  }

  /** "Start fresh" on the resume banner -- throws the saved draft away, leaves the (already-default) form as-is. */
  discardPendingDraft(): void {
    this.draftService.discard('booking', this.draftId);
    this.pendingDraft = null;
  }

  /** Called on every meaningful edit (date/slot picks directly, everything else via bookingForm.valueChanges). */
  private saveDraft(): void {
    const value = this.bookingForm?.value ?? {};
    const hasContent = !!this.selectedSlot || !!value.date || !!value.time || !!(value.notes ?? '').trim() || !!value.reward;
    if (!hasContent) {
      this.draftService.discard('booking', this.draftId);
      return;
    }
    this.draftService.save<BookingDraftData>('booking', {
      selectedDate: this.selectedDate,
      selectedSlot: this.selectedSlot,
      manualDate: value.date ?? '',
      manualTime: value.time ?? '',
      durationMinutes: value.durationMinutes ?? 60,
      notes: value.notes ?? '',
      reward: value.reward ?? '',
    }, {
      id: this.draftId,
      label: `Booking with ${this.data.providerName}`,
      preview: this.selectedSlot ? `${this.selectedDate} · ${this.slotLabel(this.selectedSlot)}` : (value.date ? `${value.date} ${value.time || ''}`.trim() : undefined),
      route: '/dashboard/find-providers',
    });
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
    if (isNaN(scheduledAt.getTime()) || scheduledAt.getTime() < this.earliestBookableTime) {
      this.snackBar.openSnackBar(
        `Pick a slot at least ${this.minLeadTimeMinutes} minutes out — the provider needs time to confirm.`,
        'error'
      );
      this.selectedSlot = null;
      this.fetchSlotsForSelectedDate();
      return;
    }

    const payload = {
      id: null,
      trainerId: this.data.trainerId ?? null,
      centerId: this.data.centerId ?? null,
      scheduledAt: scheduledAt.toISOString(),
      // The server re-resolves the booking's instant from these instead of
      // trusting scheduledAt above -- it's the same day/time the slot was
      // generated against, so it can't drift outside the provider's
      // availability window from a browser-vs-server timezone mismatch
      // (scheduledAt is still sent so the request satisfies the "required" check).
      localDate: this.selectedDate,
      localTime: this.selectedSlot.startTime,
      durationMinutes: this.slotDurationMinutes,
      notes: (this.bookingForm.value.notes ?? '').trim(),
      ...this.rewardPayload
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

    if (isNaN(scheduledAt.getTime()) || scheduledAt.getTime() < this.earliestBookableTime) {
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
      notes: (value.notes ?? '').trim(),
      ...this.rewardPayload
    };

    this.invalidForm = false;
    this.submitting = true;
    this.store.dispatch(createBooking({ data: payload }));
  }

  closeDialog(): void {
    this.dialogRef.close(false);
  }
}
