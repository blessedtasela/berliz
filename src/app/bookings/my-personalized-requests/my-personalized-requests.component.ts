import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { IconsModule } from 'src/app/icons/icons.module';
import { PersonalizedRequest, personalizedRequestStatusText } from 'src/app/models/personalized-request.model';
import { PersonalizedRequestService } from 'src/app/services/personalized-request.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { genericError } from 'src/validators/form-validators.module';

type Action = { id: number; kind: 'walkAway' };

/**
 * BK-34 ext. 4, client side: the personalized requests this client has sent. A COUNTERED one can
 * be accepted (at the trainer's price) or walked away from; an ACCEPTED one is paid from here.
 */
@Component({
  selector: 'app-my-personalized-requests',
  imports: [CommonModule, IconsModule],
  template: `
    <section *ngIf="requests.length > 0" class="flex flex-col gap-2" data-testid="my-personalized-requests">
      <span class="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Your personalized plan requests</span>

      <article *ngFor="let r of requests; trackBy: trackById" data-testid="my-personalized-request-card"
        class="rounded-2xl border bg-white dark:bg-gray-900 p-4 flex flex-col gap-3"
        [ngClass]="r.status === 'COUNTERED' || r.status === 'ACCEPTED' ? 'border-red-200 dark:border-red-900' : 'border-gray-200 dark:border-gray-800'">

        <header class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <h3 class="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">{{ r.trainerName }}</h3>
            <p class="text-[11px] text-gray-400 dark:text-gray-500">
              {{ r.proposedSessions ? r.proposedSessions + ' sessions · ' : '' }}You offered {{ r.proposedAmount | currency:'CAD':'symbol':'1.2-2' }}
            </p>
          </div>
          <span class="shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full" [ngClass]="statusClass(r.status)">
            {{ r.status | lowercase }}
          </span>
        </header>

        <p class="text-[11px] text-gray-500 dark:text-gray-400">{{ statusText(r) }}.</p>
        <p *ngIf="r.trainerNote" class="text-[11px] text-gray-500 dark:text-gray-400 italic">"{{ r.trainerNote }}"</p>

        <!-- COUNTERED: accept at the trainer's price, or walk away -->
        <div *ngIf="r.status === 'COUNTERED'" class="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-100 dark:border-gray-800">
          <ng-container *ngIf="!isConfirming(r.id, 'walkAway'); else walkAwaySure">
            <button type="button" (click)="acceptCounter(r)" [disabled]="busy" data-testid="accept-counter"
              class="px-3.5 py-2 rounded-xl text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-1.5">
              <i-feather name="check" style="width:13px;height:13px;"></i-feather>
              Accept {{ r.counterAmount | currency:'CAD':'symbol':'1.2-2' }}
            </button>
            <button type="button" (click)="ask(r.id, 'walkAway')" [disabled]="busy"
              class="text-[11px] font-semibold text-gray-500 dark:text-gray-400 hover:text-red-600 transition">
              Walk away
            </button>
          </ng-container>
          <ng-template #walkAwaySure>
            <span class="text-[11px] text-gray-500 dark:text-gray-400">Walk away from this offer?</span>
            <button type="button" (click)="walkAway(r)" [disabled]="busy" data-testid="confirm-walk-away"
              class="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50">Yes, walk away</button>
            <button type="button" (click)="ask(null, null)" class="text-[11px] font-semibold text-gray-500 hover:text-gray-700">Keep it open</button>
          </ng-template>
        </div>

        <!-- ACCEPTED: pay to get started -->
        <div *ngIf="r.status === 'ACCEPTED'" class="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-100 dark:border-gray-800">
          <button type="button" (click)="pay(r)" [disabled]="busyPayId === r.id" data-testid="pay-personalized-request"
            class="px-3.5 py-2 rounded-xl text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-60 flex items-center gap-1.5">
            <i-feather name="credit-card" style="width:13px;height:13px;"></i-feather>
            {{ busyPayId === r.id ? 'Opening payment…' : 'Pay ' + (r.agreedAmount | currency:'CAD':'symbol':'1.2-2') }}
          </button>
        </div>
      </article>
    </section>
  `
})
export class MyPersonalizedRequestsComponent implements OnInit {

  requests: PersonalizedRequest[] = [];
  busy = false;
  busyPayId: number | null = null;

  private confirming: Action | null = null;

  constructor(private personalizedRequestService: PersonalizedRequestService, private snackBar: SnackBarService) { }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.personalizedRequestService.getMyRequests().subscribe({
      next: res => this.requests = res?.data ?? [],
      error: () => this.requests = [], // an extra on this page: a failed load shows nothing rather than an error
    });
  }

  trackById(_: number, r: PersonalizedRequest): number {
    return r.id;
  }

  statusText(r: PersonalizedRequest): string {
    return personalizedRequestStatusText(r);
  }

  ask(id: number | null, kind: Action['kind'] | null): void {
    this.confirming = id !== null && kind ? { id, kind } : null;
  }

  isConfirming(id: number, kind: Action['kind']): boolean {
    return this.confirming?.id === id && this.confirming.kind === kind;
  }

  acceptCounter(r: PersonalizedRequest): void {
    this.run(this.personalizedRequestService.acceptCounter(r.id));
  }

  walkAway(r: PersonalizedRequest): void {
    this.run(this.personalizedRequestService.walkAway(r.id));
  }

  pay(r: PersonalizedRequest): void {
    if (this.busyPayId != null) return;
    this.busyPayId = r.id;
    this.personalizedRequestService.checkout(r.id).subscribe({
      next: res => {
        const url = res?.data?.checkoutUrl;
        if (!url) {
          this.busyPayId = null;
          this.snackBar.openSnackBar(res?.message || genericError, 'error');
          return;
        }
        this.redirect(url);
      },
      error: err => {
        this.busyPayId = null;
        this.snackBar.openSnackBar(err?.error?.message || genericError, 'error');
      },
    });
  }

  /** Split out so a spec can observe it without leaving the page. */
  redirect(url: string): void {
    window.location.href = url;
  }

  private run(call: ReturnType<PersonalizedRequestService['acceptCounter']>): void {
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

  statusClass(status: PersonalizedRequest['status']): string {
    switch (status) {
      case 'REQUESTED': return 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300';
      case 'COUNTERED':
      case 'ACCEPTED': return 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400';
      case 'PAID':
      case 'DELIVERED': return 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400';
    }
  }
}
