import { FormControl, Validators } from '@angular/forms';

/** What the trainer writes for clients before they book: their own trial price, free-text booking
 *  terms, and (BK-37) their own off-list-gym drop-in fee. Trainers only. */
export const MAX_BOOKING_POLICY_LENGTH = 4000;
export const MAX_TRIAL_PRICE = 10000;
/** BK-37: a sanity ceiling, not a product-specified cap -- matches ProviderPricingRules.MAX_OFF_LIST_GYM_FEE on the backend. */
export const MAX_OFF_LIST_GYM_FEE = 100;
/** BK-37: what a trainer charges for a session at a gym they haven't listed, unless they've set their own -- matches ProviderPricingRules.DEFAULT_OFF_LIST_GYM_FEE. */
export const DEFAULT_OFF_LIST_GYM_FEE = 25;

/** Owner directive (Nov 18, 2026): both on by default for every trainer unless they've switched one off. */
export const DEFAULT_WELCOME_BONUS_PERCENT = 50;

export interface TrainerBookingSource {
  trialPrice?: number | null;
  bookingPolicy?: string | null;
  offListGymFee?: number | null;
  freeTrialEnabled?: boolean | null;
  welcomeBonusEnabled?: boolean | null;
  welcomeBonusPercent?: number | null;
}

/** The controls, pre-filled from the trainer's saved values. Add them to the trainer editor's FormGroup. */
export function trainerBookingControls(source: TrainerBookingSource | null | undefined): Record<string, FormControl> {
  return {
    trialPrice: new FormControl<number | null>(source?.trialPrice ?? null, [Validators.min(0), Validators.max(MAX_TRIAL_PRICE)]),
    bookingPolicy: new FormControl<string>(source?.bookingPolicy ?? '', [Validators.maxLength(MAX_BOOKING_POLICY_LENGTH)]),
    offListGymFee: new FormControl<number | null>(source?.offListGymFee ?? null, [Validators.min(0), Validators.max(MAX_OFF_LIST_GYM_FEE)]),
    // null on a never-touched trainer reads as "on" (the platform default) -- see Trainer.freeTrialEnabled.
    freeTrialEnabled: new FormControl<boolean>(source?.freeTrialEnabled !== false),
    welcomeBonusEnabled: new FormControl<boolean>(source?.welcomeBonusEnabled !== false),
    welcomeBonusPercent: new FormControl<number | null>(source?.welcomeBonusPercent ?? null, [Validators.min(0), Validators.max(100)]),
  };
}

/** The same values for patching the form after a save or reload. */
export function trainerBookingControlValues(source: TrainerBookingSource | null | undefined): {
  trialPrice: number | null; bookingPolicy: string; offListGymFee: number | null;
  freeTrialEnabled: boolean; welcomeBonusEnabled: boolean; welcomeBonusPercent: number | null;
} {
  return {
    trialPrice: source?.trialPrice ?? null, bookingPolicy: source?.bookingPolicy ?? '', offListGymFee: source?.offListGymFee ?? null,
    freeTrialEnabled: source?.freeTrialEnabled !== false, welcomeBonusEnabled: source?.welcomeBonusEnabled !== false,
    welcomeBonusPercent: source?.welcomeBonusPercent ?? null,
  };
}

/**
 * The request fields. The server treats a missing value (null, on a field where it checks for that) as
 * "leave it alone" -- NOT as "clear it" -- so every field a trainer can blank out to reset to the platform
 * default (trial price, off-list-gym fee, and now welcome bonus percent) is sent as 0, which the backend's
 * ProviderPricingRules special-cases as the clear signal, same convention for all three. A cleared policy is
 * sent as an empty string (which clears it). The two toggles always send their real current value (the form
 * always has one, true or false -- there's no "untouched" state for a switch the trainer can see and has
 * already loaded pre-filled).
 *
 * welcomeBonusPercent used to be the one exception here -- sent as `null` on the theory that 0 needed to mean
 * a real "0% bonus" distinct from "use the default" -- but TrainerServiceImplement only ever calls
 * setWelcomeBonusPercent() when the request value is non-null, so a `null` here was silently ignored
 * server-side and left the trainer's OLD percent in place instead of resetting it, exactly contradicting the
 * form's own "leave empty to use the platform's default" hint. A trainer who wants no bonus already has
 * welcomeBonusEnabled=false for that, so "enabled with a literal 0%" was never a state worth preserving --
 * reusing 0 as the clear sentinel here, like trialPrice, actually fixes the reset instead of just describing
 * a behavior that didn't happen.
 */
export function trainerBookingPayload(value: {
  trialPrice?: unknown; bookingPolicy?: unknown; offListGymFee?: unknown;
  freeTrialEnabled?: unknown; welcomeBonusEnabled?: unknown; welcomeBonusPercent?: unknown;
}): {
  trialPrice: number; bookingPolicy: string; offListGymFee: number;
  freeTrialEnabled: boolean; welcomeBonusEnabled: boolean; welcomeBonusPercent: number;
} {
  const price = value.trialPrice === '' || value.trialPrice == null ? NaN : Number(value.trialPrice);
  const offListFee = value.offListGymFee === '' || value.offListGymFee == null ? NaN : Number(value.offListGymFee);
  const bonusPercent = value.welcomeBonusPercent === '' || value.welcomeBonusPercent == null ? NaN : Number(value.welcomeBonusPercent);
  return {
    trialPrice: Number.isFinite(price) && price > 0 ? price : 0,
    bookingPolicy: typeof value.bookingPolicy === 'string' ? value.bookingPolicy.trim() : '',
    offListGymFee: Number.isFinite(offListFee) && offListFee > 0 ? offListFee : 0,
    freeTrialEnabled: value.freeTrialEnabled !== false,
    welcomeBonusEnabled: value.welcomeBonusEnabled !== false,
    welcomeBonusPercent: Number.isFinite(bonusPercent) && bonusPercent > 0 ? bonusPercent : 0,
  };
}
