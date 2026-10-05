import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { catchError, of, take } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { CenterService } from 'src/app/services/center.service';
import { TrainerService } from 'src/app/services/trainer.service';
import { Offer, PriceEstimate, estimateBookingPrice } from './booking-price.util';

/**
 * "Estimated total" for a session, shown while booking so the price is never a surprise. Pulls the
 * provider's hourly rate itself and does the arithmetic with the same rules as the server (see
 * booking-price.util). It is only an estimate -- the price is fixed when the provider confirms, and
 * nothing is charged until then. Renders nothing for a provider with no rate set (their sessions
 * aren't priced in-app), or while the rate is still loading.
 */
@Component({
  selector: 'app-booking-price-estimate',
  standalone: true,
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
    </div>
  `,
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

  private loadRate(): void {
    this.hourlyRate = null;
    if (this.trainerId) {
      const id = this.trainerId;
      this.trainerService.getActiveTrainers().pipe(take(1), catchError(() => of(null))).subscribe(res => {
        this.hourlyRate = (res?.data ?? []).find(t => t.id === id)?.hourlyRate ?? null;
      });
    } else if (this.centerId) {
      const id = this.centerId;
      this.centerService.getActiveCenters().pipe(take(1), catchError(() => of(null))).subscribe(res => {
        this.hourlyRate = (res?.data ?? []).find(c => c.id === id)?.hourlyRate ?? null;
      });
    }
  }
}
