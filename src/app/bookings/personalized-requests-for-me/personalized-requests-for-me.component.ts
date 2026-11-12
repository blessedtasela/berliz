import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { IconsModule } from 'src/app/icons/icons.module';
import { PersonalizedRequest } from 'src/app/models/personalized-request.model';
import { PersonalizedRequestService } from 'src/app/services/personalized-request.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { genericError } from 'src/validators/form-validators.module';
import { CounterOfferDialogComponent, CounterOfferDialogResult } from '../counter-offer-dialog/counter-offer-dialog.component';

type Action = { id: number; kind: 'decline' };

/**
 * BK-34 ext. 4, trainer side: incoming personalized requests. A REQUESTED one can be accepted at
 * the client's own price, countered with a different one, or declined; everything else is just a
 * status to read (the client is the one who acts next).
 */
@Component({
  selector: 'app-personalized-requests-for-me',
  imports: [CommonModule, IconsModule, MatDialogModule],
  template: `
    <section *ngIf="requests.length > 0" class="flex flex-col gap-2" data-testid="personalized-requests-for-me">
      <span class="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Personalized plan requests</span>

      <article *ngFor="let r of requests; trackBy: trackById" data-testid="personalized-request-card"
        class="rounded-2xl border bg-white dark:bg-gray-900 p-4 flex flex-col gap-3"
        [ngClass]="r.status === 'REQUESTED' ? 'border-red-200 dark:border-red-900' : 'border-gray-200 dark:border-gray-800'">

        <header class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <h3 class="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">{{ r.clientName }}</h3>
            <p class="text-[11px] text-gray-400 dark:text-gray-500">
              {{ r.proposedSessions ? r.proposedSessions + ' sessions · ' : '' }}Offered {{ r.proposedAmount | currency:'CAD':'symbol':'1.2-2' }}
            </p>
          </div>
          <span class="shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full" [ngClass]="statusClass(r.status)">
            {{ statusLabel(r) }}
          </span>
        </header>

        <p class="text-xs text-gray-700 dark:text-gray-300">{{ r.description }}</p>

        <p *ngIf="r.status === 'COUNTERED'" class="text-[11px] text-gray-500 dark:text-gray-400">
          You countered at {{ r.counterAmount | currency:'CAD':'symbol':'1.2-2' }}. Waiting for them to respond.
        </p>
        <p *ngIf="r.status === 'ACCEPTED'" class="text-[11px] text-gray-500 dark:text-gray-400">
          Agreed at {{ r.agreedAmount | currency:'CAD':'symbol':'1.2-2' }}. Waiting for payment.
        </p>
        <p *ngIf="r.status === 'PAID'" class="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
          Paid. You can start the work.
        </p>

        <!-- REQUESTED: accept, counter, or decline -->
        <div *ngIf="r.status === 'REQUESTED'" class="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-100 dark:border-gray-800">
          <ng-container *ngIf="!isConfirming(r.id, 'decline'); else declineSure">
            <button type="button" (click)="accept(r)" [disabled]="busy" data-testid="accept-request"
              class="px-3.5 py-2 rounded-xl text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-1.5">
              <i-feather name="check" style="width:13px;height:13px;"></i-feather>
              Accept at {{ r.proposedAmount | currency:'CAD':'symbol':'1.2-2' }}
            </button>
            <button type="button" (click)="openCounter(r)" [disabled]="busy" data-testid="counter-request"
              class="px-3.5 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              Counter
            </button>
            <button type="button" (click)="ask(r.id, 'decline')" [disabled]="busy"
              class="text-[11px] font-semibold text-gray-500 dark:text-gray-400 hover:text-red-600 transition">
              Decline
            </button>
          </ng-container>
          <ng-template #declineSure>
            <span class="text-[11px] text-gray-500 dark:text-gray-400">Decline this request?</span>
            <button type="button" (click)="decline(r)" [disabled]="busy" data-testid="confirm-decline-request"
              class="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50">Yes, decline</button>
            <button type="button" (click)="ask(null, null)" class="text-[11px] font-semibold text-gray-500 hover:text-gray-700">Keep it</button>
          </ng-template>
        </div>
      </article>
    </section>
  `
})
export class PersonalizedRequestsForMeComponent implements OnInit {

  requests: PersonalizedRequest[] = [];
  busy = false;

  private confirming: Action | null = null;

  constructor(
    private personalizedRequestService: PersonalizedRequestService,
    private dialog: MatDialog,
    private snackBar: SnackBarService,
  ) { }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.personalizedRequestService.getRequestsForMe().subscribe({
      next: res => this.requests = res?.data ?? [],
      error: () => this.requests = [], // an extra on this page: a failed load shows nothing rather than an error
    });
  }

  trackById(_: number, r: PersonalizedRequest): number {
    return r.id;
  }

  ask(id: number | null, kind: Action['kind'] | null): void {
    this.confirming = id !== null && kind ? { id, kind } : null;
  }

  isConfirming(id: number, kind: Action['kind']): boolean {
    return this.confirming?.id === id && this.confirming.kind === kind;
  }

  accept(r: PersonalizedRequest): void {
    this.run(this.personalizedRequestService.accept(r.id));
  }

  decline(r: PersonalizedRequest): void {
    this.run(this.personalizedRequestService.decline(r.id));
  }

  openCounter(r: PersonalizedRequest): void {
    if (this.busy) return;
    this.dialog.open<CounterOfferDialogComponent, unknown, CounterOfferDialogResult>(CounterOfferDialogComponent, {
      width: '400px',
      maxWidth: '95vw',
      data: { clientName: r.clientName, proposedAmount: r.proposedAmount },
    }).afterClosed().subscribe(result => {
      if (!result) return;
      this.run(this.personalizedRequestService.counter(r.id, result.counterAmount, result.note || undefined));
    });
  }

  private run(call: ReturnType<PersonalizedRequestService['accept']>): void {
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

  statusLabel(r: PersonalizedRequest): string {
    switch (r.status) {
      case 'REQUESTED': return 'New request';
      case 'COUNTERED': return 'Countered';
      case 'ACCEPTED': return 'Awaiting payment';
      case 'DECLINED': return 'Declined';
      case 'PAID': return 'Paid';
      case 'DELIVERED': return 'Delivered';
      default: return r.status;
    }
  }

  statusClass(status: PersonalizedRequest['status']): string {
    switch (status) {
      case 'REQUESTED': return 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400';
      case 'COUNTERED':
      case 'ACCEPTED': return 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300';
      case 'PAID':
      case 'DELIVERED': return 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400';
    }
  }
}
