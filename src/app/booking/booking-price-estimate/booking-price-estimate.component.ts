import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { catchError, of, take } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { CenterService } from 'src/app/services/center.service';
import { TrainerService } from 'src/app/services/trainer.service';
import { Offer, PriceEstimate, estimateBookingPrice } from './booking-price.util';
import { DEFAULT_FREE_CANCEL_HOURS, DEFAULT_LATE_CANCEL_REFUND_PERCENT } from 'src/app/bookings/booking-payment.util';

/**
 * "Estimated total" for a session, shown while booking so the price is never a surprise. Pulls the
 * provider's hourly rate itself and does the arithmetic with the same rules as the server (see
 * booking-price.util). It is only an estimate -- the price is fixed when the provider confirms, and
 * nothing is charged until then. Renders nothing for a provider with no rate set (their sessions
 * aren't priced in-app), or while the rate is still loading.
 */
@Component({
    selector: 'app-booking-price-estimate',
    imports: [CommonModule, IconsModule],
    template: `
    <div *ngIf="estimate as e" class="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2.5 flex flex-col gap-1.5">
      <div class="flex items-center justify-between gap-3">
        <span class="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Estimated total</span>
        <span class="text-sm font-bold text-gray-900 dark:text-gray-100">{{ e.total | currency:'USD':'symbol':'1.2-2' }}</span>
      </div>
      <div class="text-[11px] text-gray-500 dark:text-gray-400 flex flex-col gap-0.5">
        <span class="flex justify-between gap-3">
          <span>Session ({{ minutes }} min)</span>
          <span [ngClass]="e.discounted ? 'line-through text-gray-400 dark:text-gray-500' : ''">{{ e.sessionPrice | currency:'USD':'symbol':'1.2-2' }}</span>
        </span>
        <span *ngIf="e.discounted" class="flex justify-between gap-3 text-emerald-700 dark:text-emerald-400">
          <span>After your reward</span>
          <span>{{ e.sessionAfterRewards | currency:'USD':'symbol':'1.2-2' }}</span>
        </span>
        <span *ngIf="e.locationFee > 0" class="flex justify-between gap-3">
          <span>Location fee</span>
          <span>{{ e.locationFee | currency:'USD':'symbol':'1.2-2' }}</span>
        </span>
      </div>
      <p class="text-[11px] text-gray-400 dark:text-gray-500 flex items-start gap-1.5">
        <i-feather name="info" class="shrink-0 mt-0.5" style="width:11px;height:11px;"></i-feather>
        You pay only after {{ providerName || 'the provider' }} confirms — nothing is charged now.
      </p>
      <p class="text-[11px] text-gray-400 dark:text-gray-500 flex items-start gap-1.5">
        <i-feather name="calendar" class="shrink-0 mt-0.5" style="width:11px;height:11px;"></i-feather>
        {{ cancellationPolicyText }}
      </p>
    </div>
  `
})
export class BookingPriceEstimateComponent implements OnInit, OnChanges {
  @Input() trainerId: number | null | undefined = null;
  @Input() centerId: number | null | undefined = null;
  @Input() providerName: string | null | undefined = null;
  @Input() minutes = 60;
  @Input() locationFee: number | null | undefined = null;
  @Input() promotion: Offer | null | undefined = null;
  @Input() credit: Offer | null | undefined = null;
  @Input() usesPackage = false;

  hourlyRate: number | null = null;
  /** The provider's own cancellation policy (null = platform default). */
  private freeCancelHours: number | null = null;
  private lateCancelRefundPercent: number | null = null;

  constructor(private trainerService: TrainerService, private centerService: CenterService) {}

  ngOnInit(): void { this.loadRate(); }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['trainerId'] || changes['centerId']) this.loadRate();
  }

  get estimate(): PriceEstimate | null {
    return estimateBookingPrice({
      hourlyRate: this.hourlyRate,
      minutes: this.minutes,
      locationFee: this.locationFee,
      promotion: this.promotion,
      credit: this.credit,
      usesPackage: this.usesPackage,
    });
  }

  /** What the client is agreeing to if they later cancel, in the provider's own terms. */
  get cancellationPolicyText(): string {
    const hours = this.freeCancelHours ?? DEFAULT_FREE_CANCEL_HOURS;
    const percent = this.lateCancelRefundPercent ?? DEFAULT_LATE_CANCEL_REFUND_PERCENT;
    const late = percent >= 100 ? 'refunded in full' : percent <= 0 ? 'not refunded' : `${percent}% refunded`;
    return hours > 0
      ? `Free cancellation until ${hours} hours before; after that it's ${late}.`
      : `No free cancellation: a cancellation before the start is ${late}.`;
  }

  private loadRate(): void {
    this.hourlyRate = null;
    this.freeCancelHours = null;
    this.lateCancelRefundPercent = null;
    if (this.trainerId) {
      const id = this.trainerId;
      this.trainerService.getActiveTrainers().pipe(take(1), catchError(() => of(null))).subscribe(res => {
        const t = (res?.data ?? []).find(x => x.id === id);
        this.hourlyRate = t?.hourlyRate ?? null;
        this.freeCancelHours = t?.freeCancelHours ?? null;
        this.lateCancelRefundPercent = t?.lateCancelRefundPercent ?? null;
      });
    } else if (this.centerId) {
      const id = this.centerId;
      this.centerService.getActiveCenters().pipe(take(1), catchError(() => of(null))).subscribe(res => {
        const c = (res?.data ?? []).find(x => x.id === id);
        this.hourlyRate = c?.hourlyRate ?? null;
        this.freeCancelHours = c?.freeCancelHours ?? null;
        this.lateCancelRefundPercent = c?.lateCancelRefundPercent ?? null;
      });
    }
  }
}
