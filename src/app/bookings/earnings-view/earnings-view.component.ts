import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';

import { Payout } from 'src/app/models/payout.model';
import { loadMyPayouts } from 'src/app/state/payout/payout.actions';
import {
  selectMyPayouts,
  selectMyPaidTotal,
  selectMyPendingTotal,
  selectPayoutLoading,
} from 'src/app/state/payout/payout.selectors';

/**
 * Trainer/Center-facing "Earnings" tab — every completed session that had a
 * payout calculated, the 15%/85% Berliz/provider split, and whether it's
 * still PENDING or has been PAID out via Stripe Connect.
 */
@Component({
  selector: 'app-earnings-view',
  templateUrl: './earnings-view.component.html',
  styleUrls: ['./earnings-view.component.css']
})
export class EarningsViewComponent implements OnInit, OnDestroy {

  payouts: Payout[] = [];
  loading = false;
  pendingTotal = 0;
  paidTotal = 0;

  /** ?payoutId=<id> from a notification deep link, set by the parent tab host. Scrolled to (and briefly highlighted) once its row has actually rendered. */
  @Input() deepLinkPayoutId: number | null = null;
  highlightedPayoutId: number | null = null;
  private deepLinkHandled = false;

  private destroy$ = new Subject<void>();

  constructor(private store: Store) { }

  ngOnInit(): void {
    this.store.dispatch(loadMyPayouts());

    this.store.select(selectMyPayouts)
      .pipe(takeUntil(this.destroy$))
      .subscribe(payouts => {
        this.payouts = payouts ?? [];
        this.scrollToDeepLinkPayout();
      });

    this.store.select(selectPayoutLoading)
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.loading = loading);

    this.store.select(selectMyPendingTotal)
      .pipe(takeUntil(this.destroy$))
      .subscribe(total => this.pendingTotal = total);

    this.store.select(selectMyPaidTotal)
      .pipe(takeUntil(this.destroy$))
      .subscribe(total => this.paidTotal = total);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private scrollToDeepLinkPayout(): void {
    if (!this.deepLinkPayoutId || this.deepLinkHandled) return;
    if (!this.payouts.some(p => p.id === this.deepLinkPayoutId)) return;

    this.deepLinkHandled = true;
    this.highlightedPayoutId = this.deepLinkPayoutId;
    setTimeout(() => {
      document.getElementById(`payout-${this.deepLinkPayoutId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  statusClasses(status: string): string {
    switch (status) {
      case 'PAID': return 'bg-green-50 text-green-700 border border-green-100';
      case 'FAILED': return 'bg-red-50 text-red-700 border border-red-100';
      default: return 'bg-amber-50 text-amber-700 border border-amber-100'; // PENDING
    }
  }
}
