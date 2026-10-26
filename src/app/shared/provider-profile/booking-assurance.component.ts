import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { IconsModule } from 'src/app/icons/icons.module';
import { DEFAULT_FREE_CANCEL_HOURS, DEFAULT_LATE_CANCEL_REFUND_PERCENT } from './provider-terms.component';

/**
 * One line under a profile's "Book a session" button: the payment and cancellation terms a first-time visitor wants before they
 * are asked to log in (nothing charged until the provider confirms, free cancellation window, refund after it). The fuller
 * version stays further down the page in the terms section; this just stops the answer sitting below the button.
 */
@Component({
  selector: 'app-booking-assurance',
  imports: [CommonModule, IconsModule],
  template: `
    <p class="flex items-start gap-1.5 text-[11px] leading-snug text-zinc-400 justify-center sm:justify-start" data-testid="booking-assurance">
      <i-feather name="shield" class="text-red-500 shrink-0 mt-px" style="width:12px;height:12px;"></i-feather>
      <span>
        Nothing is charged until {{ providerLabel }} confirms.
        Free cancellation up to {{ freeHours }}h before{{ lateRefund > 0 ? ', then ' + lateRefund + '% back' : '' }}.
      </span>
    </p>
  `,
})
export class BookingAssuranceComponent {
  @Input() freeCancelHours: number | null | undefined = null;
  @Input() lateCancelRefundPercent: number | null | undefined = null;
  /** "this trainer" / "this center". */
  @Input() providerLabel = 'the provider';

  get freeHours(): number { return this.freeCancelHours ?? DEFAULT_FREE_CANCEL_HOURS; }
  get lateRefund(): number { return this.lateCancelRefundPercent ?? DEFAULT_LATE_CANCEL_REFUND_PERCENT; }
}
