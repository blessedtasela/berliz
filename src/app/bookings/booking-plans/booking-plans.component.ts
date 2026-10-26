import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

import { IconsModule } from 'src/app/icons/icons.module';
import { BookingService } from 'src/app/services/booking.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { Booking, BookingPlan } from 'src/app/models/booking.model';
import { genericError } from 'src/validators/form-validators.module';

type Action = { planId: number; kind: 'confirm' | 'decline' | 'cancel' };

/**
 * The monthly plans a client has requested, or the plans clients have requested of a provider. Each plan is one
 * card; its sessions are ordinary bookings and are also listed (with their pay buttons) in the bookings lists.
 */
@Component({
  selector: 'app-booking-plans',
  imports: [CommonModule, IconsModule],
  template: `
    <section *ngIf="plans.length > 0" class="flex flex-col gap-2" data-testid="plans-section">
      <span class="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
        {{ mode === 'provider' ? 'Plan requests' : 'Your monthly plans' }}
      </span>

      <article *ngFor="let plan of plans; trackBy: trackById" data-testid="plan-card"
        class="rounded-2xl border bg-white dark:bg-gray-900 p-4 flex flex-col gap-3"
        [ngClass]="plan.status === 'pending' && mode === 'provider' ? 'border-red-200 dark:border-red-900' : 'border-gray-200 dark:border-gray-800'">

        <header class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <h3 class="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">
              {{ mode === 'provider' ? plan.clientName : ('Plan with ' + (plan.trainerName || plan.centerName)) }}
            </h3>
            <p class="text-[11px] text-gray-400 dark:text-gray-500">
              {{ plan.activeSessionCount }} of {{ plan.sessionCount }} sessions · {{ plan.startDate | date:'MMM d' }} to {{ plan.endDate | date:'MMM d' }}
            </p>
          </div>
          <span class="shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full" [ngClass]="statusClass(plan.status)">
            {{ statusLabel(plan.status) }}
          </span>
        </header>

        <div *ngIf="plan.total != null" class="flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-gray-500 dark:text-gray-400">
          <span>Total <strong class="text-gray-900 dark:text-gray-100">{{ plan.total | currency:'CAD':'symbol':'1.2-2' }}</strong></span>
          <span>Each session <strong class="text-gray-900 dark:text-gray-100">{{ plan.perSession | currency:'CAD':'symbol':'1.2-2' }}</strong></span>
          <span *ngIf="(plan.discount || 0) > 0" class="text-emerald-700 dark:text-emerald-400">Saved {{ plan.discount | currency:'CAD':'symbol':'1.2-2' }}</span>
        </div>
        <p *ngIf="mode === 'client' && plan.status !== 'cancelled' && plan.total != null" class="text-[11px] text-gray-400 dark:text-gray-500 flex items-start gap-1.5">
          <i-feather name="credit-card" class="shrink-0 mt-0.5" style="width:11px;height:11px;"></i-feather>
          Pay each session as it comes up, from your bookings below. Each is due 24 hours before it starts.
        </p>

        <button type="button" (click)="toggle(plan.id)" [attr.aria-expanded]="isOpen(plan.id)"
          class="self-start text-[11px] font-semibold text-red-600 hover:text-red-700 flex items-center gap-1">
          <i-feather [name]="isOpen(plan.id) ? 'chevron-up' : 'chevron-down'" style="width:12px;height:12px;"></i-feather>
          {{ isOpen(plan.id) ? 'Hide sessions' : 'Show sessions' }}
        </button>

        <ul *ngIf="isOpen(plan.id)" class="flex flex-col divide-y divide-gray-100 dark:divide-gray-800 rounded-xl border border-gray-100 dark:border-gray-800">
          <li *ngFor="let s of plan.sessions" class="px-3 py-2 flex items-center justify-between gap-3 text-[11px]">
            <span class="text-gray-800 dark:text-gray-200 font-semibold">{{ s.scheduledAt | date:'EEE, MMM d · h:mm a' }}</span>
            <span class="flex items-center gap-2">
              <span *ngIf="s.paymentStatus === 'PAID'" class="text-emerald-700 dark:text-emerald-400 font-semibold">Paid</span>
              <span *ngIf="s.paymentStatus === 'UNPAID' && s.status === 'confirmed'" class="text-amber-700 dark:text-amber-400 font-semibold">Due {{ s.paymentDueAt | date:'MMM d' }}</span>
              <span class="uppercase tracking-wide font-bold text-[10px] px-1.5 py-0.5 rounded-full" [ngClass]="sessionClass(s)">{{ s.status }}</span>
            </span>
          </li>
        </ul>

        <!-- Provider: accept or decline the whole plan -->
        <div *ngIf="mode === 'provider' && plan.status === 'pending'" class="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-100 dark:border-gray-800">
          <ng-container *ngIf="!isConfirming(plan.id, 'decline'); else declineSure">
            <button type="button" (click)="respond(plan, 'confirm')" [disabled]="busy" data-testid="accept-plan"
              class="px-3.5 py-2 rounded-xl text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-1.5">
              <i-feather name="check" style="width:13px;height:13px;"></i-feather>
              Accept all {{ plan.activeSessionCount }} sessions
            </button>
            <button type="button" (click)="ask(plan.id, 'decline')" [disabled]="busy"
              class="px-3.5 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              Decline
            </button>
          </ng-container>
          <ng-template #declineSure>
            <span class="text-[11px] text-gray-500 dark:text-gray-400">Decline the whole plan?</span>
            <button type="button" (click)="respond(plan, 'decline')" [disabled]="busy" data-testid="confirm-decline"
              class="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50">Yes, decline</button>
            <button type="button" (click)="ask(null, null)" class="text-[11px] font-semibold text-gray-500 hover:text-gray-700">Keep it</button>
          </ng-template>
        </div>

        <!-- Client: cancel what is left -->
        <div *ngIf="mode === 'client' && plan.status !== 'cancelled'" class="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-100 dark:border-gray-800">
          <ng-container *ngIf="!isConfirming(plan.id, 'cancel'); else cancelSure">
            <button type="button" (click)="ask(plan.id, 'cancel')" [disabled]="busy"
              class="text-[11px] font-semibold text-gray-500 dark:text-gray-400 hover:text-red-600 transition">
              Cancel upcoming sessions
            </button>
          </ng-container>
          <ng-template #cancelSure>
            <span class="text-[11px] text-gray-500 dark:text-gray-400">Each upcoming session follows its cancellation policy. Cancel them all?</span>
            <button type="button" (click)="cancel(plan)" [disabled]="busy" data-testid="confirm-cancel-plan"
              class="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50">Yes, cancel</button>
            <button type="button" (click)="ask(null, null)" class="text-[11px] font-semibold text-gray-500 hover:text-gray-700">Keep them</button>
          </ng-template>
        </div>
      </article>
    </section>
  `
})
export class BookingPlansComponent implements OnInit {

  @Input() mode: 'client' | 'provider' = 'client';

  plans: BookingPlan[] = [];
  busy = false;

  private open = new Set<number>();
  private confirming: Action | null = null;

  constructor(private bookingService: BookingService, private snackBar: SnackBarService) { }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    const plans$ = this.mode === 'provider' ? this.bookingService.getProviderPlans() : this.bookingService.getMyPlans();
    plans$.subscribe({
      next: res => this.plans = res?.data ?? [],
      error: () => this.plans = [], // plans are an extra on this page: a failed load shows nothing rather than an error
    });
  }

  trackById(_: number, plan: BookingPlan): number {
    return plan.id;
  }

  toggle(id: number): void {
    this.open.has(id) ? this.open.delete(id) : this.open.add(id);
  }

  isOpen(id: number): boolean {
    return this.open.has(id);
  }

  ask(planId: number | null, kind: Action['kind'] | null): void {
    this.confirming = planId !== null && kind ? { planId, kind } : null;
  }

  isConfirming(planId: number, kind: Action['kind']): boolean {
    return this.confirming?.planId === planId && this.confirming.kind === kind;
  }

  respond(plan: BookingPlan, action: 'confirm' | 'decline'): void {
    this.run(this.bookingService.respondToPlan(plan.id, action));
  }

  cancel(plan: BookingPlan): void {
    this.run(this.bookingService.cancelPlan(plan.id));
  }

  private run(call: ReturnType<BookingService['respondToPlan']>): void {
    if (this.busy) return;
    this.busy = true;
    call.subscribe({
      next: res => {
        this.busy = false;
        this.confirming = null;
        this.snackBar.openSnackBar(res?.data?.message || res?.message || 'Done.', '');
        this.load();
      },
      error: err => {
        this.busy = false;
        this.snackBar.openSnackBar(err?.error?.message || genericError, 'error');
      },
    });
  }

  statusLabel(status: BookingPlan['status']): string {
    return status === 'pending' ? 'Waiting for a reply' : status === 'confirmed' ? 'Accepted' : 'Cancelled';
  }

  statusClass(status: BookingPlan['status']): string {
    return status === 'pending'
      ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300'
      : status === 'confirmed'
        ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400'
        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400';
  }

  sessionClass(session: Booking): string {
    switch (session.status) {
      case 'confirmed': return 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400';
      case 'pending': return 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300';
      case 'completed': return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500';
    }
  }
}
