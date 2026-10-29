import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { catchError, of, take } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { CenterService } from 'src/app/services/center.service';
import { TrainerService } from 'src/app/services/trainer.service';
import { DEFAULT_TRIAL_PRICE, Offer, PriceEstimate, estimateBookingPrice } from './booking-price.util';
import { travelZoneLabel } from 'src/app/utils/travel-zone.util';
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
    <div *ngIf="loaded" class="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2.5 flex flex-col gap-1.5" data-testid="booking-summary">
      <span class="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Your request</span>
      <div class="text-xs text-gray-700 dark:text-gray-300 flex flex-col gap-0.5">
        <span class="flex justify-between gap-3" data-testid="summary-with"><span class="text-gray-400 dark:text-gray-500">With</span><span class="font-semibold text-right">{{ providerName || 'the provider' }}</span></span>
        <span class="flex justify-between gap-3" data-testid="summary-when"><span class="text-gray-400 dark:text-gray-500">When</span><span class="font-semibold text-right">{{ when || 'Pick a date and time above' }}</span></span>
        <span *ngIf="trial" class="flex justify-between gap-3" data-testid="summary-type"><span class="text-gray-400 dark:text-gray-500">Type</span><span class="font-semibold text-right">Trial session</span></span>
        <span class="flex justify-between gap-3"><span class="text-gray-400 dark:text-gray-500">Length</span><span class="font-semibold text-right">{{ minutes }} minutes</span></span>
        <span *ngIf="where" class="flex justify-between gap-3" data-testid="summary-where"><span class="text-gray-400 dark:text-gray-500">Where</span><span class="font-semibold text-right">{{ where }}</span></span>
      </div>
      <div *ngIf="!estimate" class="flex items-center justify-between gap-3 border-t border-gray-200 dark:border-gray-700 pt-1.5" data-testid="summary-unpriced">
        <span class="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Price</span>
        <span class="text-xs font-semibold text-gray-900 dark:text-gray-100 text-right">Agreed with {{ providerName || 'the provider' }}</span>
      </div>
    </div>
    <div *ngIf="estimate as e" class="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2.5 flex flex-col gap-1.5">
      <div class="flex items-center justify-between gap-3">
        <span class="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Estimated total</span>
        <span class="text-sm font-bold text-gray-900 dark:text-gray-100">{{ e.total | currency:'CAD':'symbol':'1.2-2' }}</span>
      </div>
      <div class="text-[11px] text-gray-500 dark:text-gray-400 flex flex-col gap-0.5" data-testid="price-breakdown">
        <span class="flex justify-between gap-3">
          <span>{{ e.isTrial ? 'Trial session' : 'Session (' + minutes + ' min)' }}</span>
          <span [ngClass]="e.discounted ? 'line-through text-gray-400 dark:text-gray-500' : ''">{{ e.sessionPrice | currency:'CAD':'symbol':'1.2-2' }}</span>
        </span>
        <span *ngIf="e.introDiscount > 0" class="flex justify-between gap-3 text-emerald-700 dark:text-emerald-400 font-semibold" data-testid="intro-discount">
          <span>New member offer ({{ newMemberPercent }}% off your first trial)</span>
          <span>&minus;{{ e.introDiscount | currency:'CAD':'symbol':'1.2-2' }}</span>
        </span>
        <span *ngIf="e.discounted && e.introDiscount === 0" class="flex justify-between gap-3 text-emerald-700 dark:text-emerald-400">
          <span>After your reward</span>
          <span>{{ e.sessionAfterRewards | currency:'CAD':'symbol':'1.2-2' }}</span>
        </span>
        <span *ngIf="e.locationFee > 0" class="flex justify-between gap-3" data-testid="travel-fee">
          <span>{{ travelZoneText ? 'Travel fee (' + travelZoneText + ')' : 'Location fee' }}</span>
          <span>{{ e.locationFee | currency:'CAD':'symbol':'1.2-2' }}</span>
        </span>
        <span *ngIf="e.locationFee === 0 && travelZoneText" class="flex justify-between gap-3" data-testid="travel-fee">
          <span>Travel fee ({{ travelZoneText }})</span>
          <span>{{ travelZonePending ? 'set by the trainer' : 'none' }}</span>
        </span>
      </div>
      <p *ngIf="e.discounted" class="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400" data-testid="you-save">
        You save {{ e.sessionPrice - e.sessionAfterRewards | currency:'CAD':'symbol':'1.2-2' }} — the total above already includes it.
      </p>
      <p *ngIf="e.gymDropIn > 0" class="text-[11px] text-gray-500 dark:text-gray-400 flex items-start gap-1.5" data-testid="gym-dropin-line">
        <i-feather name="map-pin" class="shrink-0 mt-0.5" style="width:11px;height:11px;"></i-feather>
        Pay at the gym: about {{ e.gymDropIn | currency:'CAD':'symbol':'1.2-2' }} drop-in, paid to the gym at the door. It is not part of the total above.
      </p>
      <p class="text-[11px] text-gray-400 dark:text-gray-500 flex items-start gap-1.5">
        <i-feather name="info" class="shrink-0 mt-0.5" style="width:11px;height:11px;"></i-feather>
        Nothing is charged now. You pay {{ e.total | currency:'CAD':'symbol':'1.2-2' }} only after {{ providerName || 'the provider' }} confirms, and you have 24 hours to pay.
      </p>
      <p class="text-[11px] text-gray-400 dark:text-gray-500 flex items-start gap-1.5">
        <i-feather name="calendar" class="shrink-0 mt-0.5" style="width:11px;height:11px;"></i-feather>
        {{ cancellationPolicyText }} {{ refundExample(e.total) }}
      </p>
    </div>
    <div *ngIf="loaded && !estimate" class="px-1 flex flex-col gap-1">
      <p class="text-[11px] text-gray-400 dark:text-gray-500 flex items-start gap-1.5">
        <i-feather name="info" class="shrink-0 mt-0.5" style="width:11px;height:11px;"></i-feather>
        You pay only after {{ providerName || 'the provider' }} confirms: nothing is charged now.
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
  /** SINGLE or TRIAL; a trial is one flat price (the trainer's own, else the platform's CA$100). */
  @Input() sessionType: 'SINGLE' | 'TRIAL' | null | undefined = null;
  /** Percent off a new member's first trial, when they are eligible (null/0 = no offer). */
  @Input() newMemberPercent: number | null | undefined = null;
  /** What the gym charges at the door; shown separately and never added to the total. */
  @Input() gymDropIn: number | null | undefined = null;
  /** DOWNTOWN | NEARBY | FAR | PENDING of the chosen gym, named next to the travel fee. */
  @Input() travelZone: string | null | undefined = null;
  /** Summary lines from the booking page: when and where the session is. */
  @Input() when: string | null | undefined = null;
  @Input() where: string | null | undefined = null;

  /** True once the provider's rate has been looked up, so the card never flashes "agreed with" before it knows. */
  loaded = false;

  hourlyRate: number | null = null;
  /** The trainer's own trial price; the platform's CA$100 trial when they have not set one. */
  trialPrice: number = DEFAULT_TRIAL_PRICE;
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
      sessionType: this.centerId ? 'SINGLE' : this.sessionType,
      trialPrice: this.trialPrice,
      newMemberPercent: this.newMemberPercent,
      gymDropIn: this.gymDropIn,
    });
  }

  get trial(): boolean { return !!this.trainerId && this.sessionType === 'TRIAL'; }

  get travelZoneText(): string | null { return this.travelZone ? travelZoneLabel(this.travelZone) : null; }
  get travelZonePending(): boolean { return this.travelZone === 'PENDING'; }

  /** "e.g. $25.00 back on $50.00", so the refund is concrete before anyone sends the request. */
  refundExample(total: number): string {
    const percent = this.lateCancelRefundPercent ?? DEFAULT_LATE_CANCEL_REFUND_PERCENT;
    if (!(total > 0) || percent <= 0 || percent >= 100) return '';
    const back = Math.round(total * percent) / 100;
    return `That is ${percent}% of what you paid: e.g. $${back.toFixed(2)} back on $${total.toFixed(2)}.`;
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
    this.loaded = false;
    this.hourlyRate = null;
    this.trialPrice = DEFAULT_TRIAL_PRICE;
    this.freeCancelHours = null;
    this.lateCancelRefundPercent = null;
    if (this.trainerId) {
      const id = this.trainerId;
      this.trainerService.getActiveTrainers().pipe(take(1), catchError(() => of(null))).subscribe(res => {
        const t = (res?.data ?? []).find(x => x.id === id);
        this.hourlyRate = t?.hourlyRate ?? null;
        this.trialPrice = t?.trialPrice ?? DEFAULT_TRIAL_PRICE;
        this.freeCancelHours = t?.freeCancelHours ?? null;
        this.lateCancelRefundPercent = t?.lateCancelRefundPercent ?? null;
        this.loaded = true;
      });
    } else if (this.centerId) {
      const id = this.centerId;
      this.centerService.getActiveCenters().pipe(take(1), catchError(() => of(null))).subscribe(res => {
        const c = (res?.data ?? []).find(x => x.id === id);
        this.hourlyRate = c?.hourlyRate ?? null;
        this.freeCancelHours = c?.freeCancelHours ?? null;
        this.lateCancelRefundPercent = c?.lateCancelRefundPercent ?? null;
        this.loaded = true;
      });
    }
  }
}
