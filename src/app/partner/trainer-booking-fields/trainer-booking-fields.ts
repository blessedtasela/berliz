import { FormControl, Validators } from '@angular/forms';

/** What the trainer writes for clients before they book: their own trial price, and free-text booking terms. Trainers only. */
export const MAX_BOOKING_POLICY_LENGTH = 4000;
export const MAX_TRIAL_PRICE = 10000;

export interface TrainerBookingSource {
  trialPrice?: number | null;
  bookingPolicy?: string | null;
}

/** The two controls, pre-filled from the trainer's saved values. Add them to the trainer editor's FormGroup. */
export function trainerBookingControls(source: TrainerBookingSource | null | undefined): Record<string, FormControl> {
  return {
    trialPrice: new FormControl<number | null>(source?.trialPrice ?? null, [Validators.min(0), Validators.max(MAX_TRIAL_PRICE)]),
    bookingPolicy: new FormControl<string>(source?.bookingPolicy ?? '', [Validators.maxLength(MAX_BOOKING_POLICY_LENGTH)]),
  };
}

/** The same values for patching the form after a save or reload. */
export function trainerBookingControlValues(source: TrainerBookingSource | null | undefined): { trialPrice: number | null; bookingPolicy: string } {
  return { trialPrice: source?.trialPrice ?? null, bookingPolicy: source?.bookingPolicy ?? '' };
}

/**
 * The request fields. The server treats a missing value as "leave it alone", so a cleared trial price is sent as 0
 * (which clears it, so the platform's default trial applies) and a cleared policy as an empty string (which clears it).
 */
export function trainerBookingPayload(value: { trialPrice?: unknown; bookingPolicy?: unknown }): { trialPrice: number; bookingPolicy: string } {
  const price = value.trialPrice === '' || value.trialPrice == null ? NaN : Number(value.trialPrice);
  return {
    trialPrice: Number.isFinite(price) && price > 0 ? price : 0,
    bookingPolicy: typeof value.bookingPolicy === 'string' ? value.bookingPolicy.trim() : '',
  };
}
