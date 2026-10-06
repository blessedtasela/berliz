import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';

import { Payout } from 'src/app/models/payout.model';
import { loadMyPayouts, loadMyPayoutsFailure, loadMyPayoutsSuccess } from 'src/app/state/payout/payout.actions';
import { watchLoadError } from 'src/app/shared/load-error/load-error-tracker';
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
    styleUrls: ['./earnings-view.component.css'],
    standalone: false
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

  /** Why the payouts couldn't be loaded -- so a failed load never reads as "no payouts yet". */
  loadError: string | null = null;

  constructor(private store: Store, private actions$: Actions) { }

  retryLoad(): void {
    this.store.dispatch(loadMyPayouts());
  }

  ngOnInit(): void {
    watchLoadError(this.actions$, loadMyPayoutsFailure, [loadMyPayouts, loadMyPayoutsSuccess], this.destroy$, m => this.loadError = m);
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
      case 'PAID': return 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900';
      case 'FAILED': return 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900';
      default: return 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900'; // PENDING
    }
  }
}
