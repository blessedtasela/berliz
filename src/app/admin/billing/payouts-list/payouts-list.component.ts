import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';

import { Payout } from 'src/app/models/payout.model';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { watchLoadError } from 'src/app/shared/load-error/load-error-tracker';
import {
  loadAllPayouts, loadAllPayoutsFailure, loadAllPayoutsSuccess,
  payOutViaStripe, payOutViaStripeFailure, payOutViaStripeSuccess,
} from 'src/app/state/payout/payout.actions';
import { selectAllPayouts, selectPayoutLoading } from 'src/app/state/payout/payout.selectors';

/** Admin — every provider's payouts across the marketplace, with a "Pay out" action for PENDING rows. */
@Component({
  selector: 'app-payouts-list',
  templateUrl: './payouts-list.component.html',
  styleUrls: ['./payouts-list.component.css'],
  standalone: false
})
export class PayoutsListComponent implements OnInit, OnDestroy {
  payouts: Payout[] = [];
  loading = false;
  loadError: string | null = null;
  /** The payout currently mid "Pay out" call, so only its own button shows a spinner/disabled state. */
  payingId: number | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private actions$: Actions,
    private dialog: MatDialog,
    private snackBar: SnackBarService,
  ) { }

  ngOnInit(): void {
    watchLoadError(this.actions$, loadAllPayoutsFailure, [loadAllPayouts, loadAllPayoutsSuccess], this.destroy$, m => this.loadError = m);
    this.store.dispatch(loadAllPayouts());

    this.store.select(selectAllPayouts).pipe(takeUntil(this.destroy$))
      .subscribe(payouts => this.payouts = payouts ?? []);

    this.store.select(selectPayoutLoading).pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.loading = loading);

    this.actions$.pipe(ofType(payOutViaStripeSuccess), takeUntil(this.destroy$)).subscribe(({ response }) => {
      this.payingId = null;
      this.snackBar.openSnackBar(response?.message || 'Payout sent', '');
    });

    this.actions$.pipe(ofType(payOutViaStripeFailure), takeUntil(this.destroy$)).subscribe(({ error }) => {
      this.payingId = null;
      this.snackBar.openSnackBar(error, 'error');
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  retryLoad(): void {
    this.store.dispatch(loadAllPayouts());
  }

  providerName(payout: Payout): string {
    return payout.trainerName || payout.centerName || 'Unknown provider';
  }

  payOut(payout: Payout): void {
    if (payout.status !== 'PENDING' || this.payingId) return;
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      message: `Send ${payout.payoutAmount} to ${this.providerName(payout)} via Stripe? This triggers a real Connect transfer.`,
      confirmation: true,
      disableClose: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    dialogRef.componentInstance.onEmitStatusChange.subscribe(() => {
      this.payingId = payout.id;
      this.store.dispatch(payOutViaStripe({ id: payout.id }));
      dialogRef.close('paying out');
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
