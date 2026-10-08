import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { IconsModule } from 'src/app/icons/icons.module';
import { ProfileTheme, ProfileThemeClasses, profileTheme } from './profile-theme';

/** Platform defaults when a trainer/center hasn't set their own (mirrors the backend). */
export const DEFAULT_FREE_CANCEL_HOURS = 24;
export const DEFAULT_LATE_CANCEL_REFUND_PERCENT = 50;

/**
 * "Booking terms" in plain language: what a session costs, what happens if the
 * client cancels, and how paying works. Everything a client (or the provider
 * checking how they appear) wants to know before booking, in one card.
 */
@Component({
  selector: 'app-provider-terms',
  imports: [CommonModule, IconsModule],
  template: `
    <section [ngClass]="t.card" class="font-sans">
      <div class="flex flex-col gap-1 mb-4">
        <span class="text-[11px] uppercase tracking-wide font-semibold" [ngClass]="t.eyebrow">Before you book</span>
        <h2 class="text-lg font-extrabold leading-tight" [ngClass]="t.heading">Booking <span [ngClass]="t.accent">terms</span></h2>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div [ngClass]="t.tile" class="p-4 flex flex-col gap-1.5">
          <span class="text-[11px] uppercase tracking-wide font-semibold flex items-center gap-1.5" [ngClass]="t.muted">
            <i-feather name="dollar-sign" style="width:12px;height:12px;"></i-feather> Session rate
          </span>
          <span *ngIf="hourlyRate" class="text-lg font-extrabold" [ngClass]="t.heading">
            {{ hourlyRate | currency:'USD':'symbol':'1.0-2' }}<span class="text-[11px] font-medium" [ngClass]="t.muted"> / hour</span>
          </span>
          <span *ngIf="!hourlyRate" class="text-sm font-bold" [ngClass]="t.heading">Agreed with {{ providerLabel }}</span>
          <span class="text-[11px] leading-snug" [ngClass]="t.muted">
            {{ hourlyRate ? 'You see the exact price before you send a request.' : 'No in-app price is set for single sessions.' }}
          </span>
        </div>

        <div [ngClass]="t.tile" class="p-4 flex flex-col gap-1.5">
          <span class="text-[11px] uppercase tracking-wide font-semibold flex items-center gap-1.5" [ngClass]="t.muted">
            <i-feather name="rotate-ccw" style="width:12px;height:12px;"></i-feather> Cancellation
          </span>
          <span class="text-sm font-bold" [ngClass]="t.heading">Free up to {{ freeHours }}h before</span>
          <span class="text-[11px] leading-snug" [ngClass]="t.muted">
            Cancel inside that window and {{ lateRefund === 0 ? 'nothing' : lateRefund + '%' }} is refunded.
          </span>
        </div>

        <div [ngClass]="t.tile" class="p-4 flex flex-col gap-1.5">
          <span class="text-[11px] uppercase tracking-wide font-semibold flex items-center gap-1.5" [ngClass]="t.muted">
            <i-feather name="shield" style="width:12px;height:12px;"></i-feather> Payment
          </span>
          <span class="text-sm font-bold" [ngClass]="t.heading">Pay after it's confirmed</span>
          <span class="text-[11px] leading-snug" [ngClass]="t.muted">
            Nothing is charged until {{ providerLabel }} accepts. You then have 24 hours to pay securely by card.
          </span>
        </div>
      </div>
    </section>
  `
})
export class ProviderTermsComponent {
  @Input() theme: ProfileTheme = 'light';
  @Input() hourlyRate: number | null | undefined = null;
  @Input() freeCancelHours: number | null | undefined = null;
  @Input() lateCancelRefundPercent: number | null | undefined = null;
  /** "this trainer" / "this center" -- reads naturally in the copy. */
  @Input() providerLabel = 'the provider';

  get t(): ProfileThemeClasses { return profileTheme(this.theme); }
  get freeHours(): number { return this.freeCancelHours ?? DEFAULT_FREE_CANCEL_HOURS; }
  get lateRefund(): number { return this.lateCancelRefundPercent ?? DEFAULT_LATE_CANCEL_REFUND_PERCENT; }
}
