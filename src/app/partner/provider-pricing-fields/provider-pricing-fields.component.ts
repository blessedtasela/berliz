import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

/** Platform defaults, used until a provider chooses (and shown as the starting values). Mirrors the backend CancellationPolicy. */
export const DEFAULT_FREE_CANCEL_HOURS = 24;
export const DEFAULT_LATE_CANCEL_REFUND_PERCENT = 50;

export const FREE_CANCEL_HOUR_OPTIONS: { value: number; label: string }[] = [
  { value: 0, label: 'No free cancellation' },
  { value: 6, label: '6 hours before' },
  { value: 12, label: '12 hours before' },
  { value: 24, label: '24 hours before' },
  { value: 48, label: '48 hours before' },
  { value: 72, label: '72 hours before' },
];

export const LATE_REFUND_PERCENT_OPTIONS: { value: number; label: string }[] = [
  { value: 100, label: 'Full refund (100%)' },
  { value: 75, label: '75% back' },
  { value: 50, label: '50% back' },
  { value: 25, label: '25% back' },
  { value: 0, label: 'No refund' },
];

/** What a provider's record carries for these settings. */
export interface ProviderPricingSource {
  hourlyRate?: number | null;
  freeCancelHours?: number | null;
  lateCancelRefundPercent?: number | null;
}

/** The three controls, pre-filled from the provider's saved values (or the platform defaults). Add them to the editor's FormGroup. */
export function providerPricingControls(source: ProviderPricingSource | null | undefined): Record<string, FormControl> {
  return {
    hourlyRate: new FormControl<number | null>(source?.hourlyRate ?? null, [Validators.min(0), Validators.max(10000)]),
    freeCancelHours: new FormControl<number>(source?.freeCancelHours ?? DEFAULT_FREE_CANCEL_HOURS),
    lateCancelRefundPercent: new FormControl<number>(source?.lateCancelRefundPercent ?? DEFAULT_LATE_CANCEL_REFUND_PERCENT),
  };
}

/** The same three values as plain numbers, for patching a form after a save or reload. */
export function providerPricingControlValues(source: ProviderPricingSource | null | undefined):
  { hourlyRate: number | null; freeCancelHours: number; lateCancelRefundPercent: number } {
  return {
    hourlyRate: source?.hourlyRate ?? null,
    freeCancelHours: source?.freeCancelHours ?? DEFAULT_FREE_CANCEL_HOURS,
    lateCancelRefundPercent: source?.lateCancelRefundPercent ?? DEFAULT_LATE_CANCEL_REFUND_PERCENT,
  };
}

/**
 * The request fields for these settings. The server treats a missing hourly rate as "leave it alone",
 * so clearing the field is sent as 0 (which clears it); an empty or invalid entry never becomes NaN.
 */
export function providerPricingPayload(value: { hourlyRate?: unknown; freeCancelHours?: unknown; lateCancelRefundPercent?: unknown }):
  { hourlyRate: number; freeCancelHours: number; lateCancelRefundPercent: number } {
  const rate = value.hourlyRate === '' || value.hourlyRate == null ? NaN : Number(value.hourlyRate);
  return {
    hourlyRate: Number.isFinite(rate) && rate > 0 ? rate : 0,
    freeCancelHours: Number(value.freeCancelHours ?? DEFAULT_FREE_CANCEL_HOURS),
    lateCancelRefundPercent: Number(value.lateCancelRefundPercent ?? DEFAULT_LATE_CANCEL_REFUND_PERCENT),
  };
}

/**
 * The money settings a trainer or center controls: their hourly rate (what makes their sessions
 * bookable with in-app payment) and their cancellation policy. Drops into either editor's form --
 * the parent builds the controls with {@link providerPricingControls} and sends
 * {@link providerPricingPayload}.
 */
@Component({
  selector: 'app-provider-pricing-fields',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="md:col-span-2 flex flex-col gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800/40 p-3">
      <div class="flex flex-col gap-1">
        <label class="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Session rate (per hour)</label>
        <div class="relative sm:w-56">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">$</span>
          <input type="number" min="0" max="10000" step="0.01" [formControl]="rateControl" placeholder="e.g. 60"
            class="w-full pl-6 pr-3 py-2 rounded-xl bg-white dark:bg-gray-900 border text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400
                   focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
            [ngClass]="rateControl.invalid ? 'border-red-300 dark:border-red-800' : 'border-gray-200 dark:border-gray-700'" />
        </div>
        <p *ngIf="rateControl.invalid" class="text-red-500 text-[11px]">Enter a rate between $0 and $10,000.</p>
        <p class="text-[11px] text-gray-400 dark:text-gray-500">
          Clients are charged this, prorated by session length, plus any location fee — only after you confirm a booking.
          Leave blank and clients can still request sessions, but nothing is charged in the app.
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div class="flex flex-col gap-1">
          <label class="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Free cancellation</label>
          <select [formControl]="hoursControl"
            class="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100
                   focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition cursor-pointer">
            <option *ngFor="let o of hourOptions" [ngValue]="o.value">{{ o.label }}</option>
          </select>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">If cancelled later</label>
          <select [formControl]="percentControl"
            class="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100
                   focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition cursor-pointer">
            <option *ngFor="let o of percentOptions" [ngValue]="o.value">{{ o.label }}</option>
          </select>
        </div>
      </div>
      <p class="text-[11px] text-gray-400 dark:text-gray-500">{{ policySummary }}</p>
    </div>
  `,
})
export class ProviderPricingFieldsComponent {
  /** The editor's FormGroup, which must contain the controls from {@link providerPricingControls}. */
  @Input({ required: true }) form!: FormGroup;

  readonly hourOptions = FREE_CANCEL_HOUR_OPTIONS;
  readonly percentOptions = LATE_REFUND_PERCENT_OPTIONS;

  get rateControl(): FormControl { return this.form.get('hourlyRate') as FormControl; }
  get hoursControl(): FormControl { return this.form.get('freeCancelHours') as FormControl; }
  get percentControl(): FormControl { return this.form.get('lateCancelRefundPercent') as FormControl; }

  /** A plain-English reading of the two settings, so a provider sees exactly what a client will be told. */
  get policySummary(): string {
    const hours = Number(this.hoursControl.value);
    const percent = Number(this.percentControl.value);
    const late = percent >= 100 ? 'it is refunded in full too'
      : percent <= 0 ? 'nothing is refunded'
      : `${percent}% is refunded and you keep the rest`;
    const free = hours > 0
      ? `Clients cancelling at least ${hours} hours ahead get a full refund. After that, ${late}.`
      : `Every cancellation before the start counts as late: ${late}.`;
    return `${free} Once a session has started nothing is refunded. If you cancel, the client is always refunded in full.`;
  }
}
