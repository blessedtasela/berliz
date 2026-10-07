import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subject, take, takeUntil } from 'rxjs';

import { StripeConnectStatus } from 'src/app/models/stripe.model';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { StripeService } from 'src/app/services/stripe.service';
import { genericError } from 'src/validators/form-validators.module';

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

  /** ?payoutSetup=return|refresh — Stripe sent the provider back here after (or midway through) payout onboarding. */
  @Input() payoutSetupReturn: 'return' | 'refresh' | null = null;

  /** Whether payouts are set up; null until the first answer (and when Stripe isn't configured, the banner stays hidden). */
  connect: StripeConnectStatus | null = null;
  settingUp = false;

  private destroy$ = new Subject<void>();

  /** Why the payouts couldn't be loaded -- so a failed load never reads as "no payouts yet". */
  loadError: string | null = null;

  constructor(
    private store: Store,
    private actions$: Actions,
    private stripeService: StripeService,
    private snackBar: SnackBarService,
  ) { }

  retryLoad(): void {
    this.store.dispatch(loadMyPayouts());
  }

  ngOnInit(): void {
    watchLoadError(this.actions$, loadMyPayoutsFailure, [loadMyPayouts, loadMyPayoutsSuccess], this.destroy$, m => this.loadError = m);
    this.store.dispatch(loadMyPayouts());
    this.loadConnectStatus();

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

  private loadConnectStatus(): void {
    this.stripeService.getConnectStatus().pipe(take(1)).subscribe({
      next: res => {
        this.connect = res?.data ?? null;
        // Stripe says the onboarding link expired: hand out a fresh one for the SAME account (the server reuses it).
        if (this.payoutSetupReturn === 'refresh' && this.connect?.configured && !this.connect.ready) this.startPayoutSetup();
      },
      // Failing to read status just hides the banner; earnings themselves are unaffected.
      error: () => { this.connect = null; },
    });
  }

  /** Sends the provider to Stripe to set up payouts — or, once done, to their Express dashboard. */
  startPayoutSetup(): void {
    if (this.settingUp) return;
    this.settingUp = true;
    const back = `${window.location.origin}/dashboard/my-bookings`;
    this.stripeService.createConnectOnboardingLink({
      returnUrl: `${back}?payoutSetup=return`,
      refreshUrl: `${back}?payoutSetup=refresh`,
    }).pipe(take(1)).subscribe({
      next: res => {
        const url = res?.data?.onboardingUrl;
        if (!url) {
          this.settingUp = false;
          this.snackBar.openSnackBar(res?.message || genericError, 'error');
          return;
        }
        this.redirectTo(url);
      },
      error: (err: any) => {
        this.settingUp = false;
        this.snackBar.openSnackBar(err?.error?.message || genericError, 'error');
      },
    });
  }

  /** Pulled out so tests can spy on it and never trigger a real navigation. */
  protected redirectTo(url: string): void {
    window.location.href = url;
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
