import { Component, OnDestroy, OnInit } from '@angular/core';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subject, take, takeUntil } from 'rxjs';

import { Plan } from 'src/app/models/plan.model';
import { AuthService } from 'src/app/services/auth.service';
import { BypassCodeService } from 'src/app/services/bypass-code.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { loadPlans } from 'src/app/state/plan/plan.actions';
import { selectPlanLoading, selectPlans } from 'src/app/state/plan/plan.selectors';
import { loadMySubscriptions, selectPlan, selectPlanFailure, selectPlanSuccess } from 'src/app/state/subscription/subscription.actions';

@Component({
  selector: 'app-my-subscriptions-plans',
  templateUrl: './my-subscriptions-plans.component.html',
  styleUrls: ['./my-subscriptions-plans.component.css']
})
export class MySubscriptionsPlansComponent implements OnInit, OnDestroy {

  plans: Plan[] = [];
  loading = false;

  /** The plan currently being submitted, so only that card shows a busy state. */
  selectingPlanId: number | null = null;

  // ── Redeem a code ────────────────────────────────────────────────────────
  redeemCode = '';
  redeeming = false;

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private actions$: Actions,
    private authService: AuthService,
    private bypassCodeService: BypassCodeService,
    private snackBar: SnackBarService,
  ) { }

  /** Which subset of the shared Plan catalog this signed-in role should see. */
  private get myTargetRole(): 'client' | 'trainer' | 'center' {
    const role = this.authService.getCurrentUserRole();
    return role === 'trainer' ? 'trainer' : role === 'center' ? 'center' : 'client';
  }

  get visiblePlans(): Plan[] {
    const role = this.myTargetRole;
    return this.plans.filter(p => p.targetRole === role);
  }

  ngOnInit(): void {
    this.store.dispatch(loadPlans());

    this.store.select(selectPlans)
      .pipe(takeUntil(this.destroy$))
      .subscribe(plans => this.plans = plans ?? []);

    this.store.select(selectPlanLoading)
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.loading = loading);

    this.actions$
      .pipe(ofType(selectPlanSuccess), takeUntil(this.destroy$))
      .subscribe(({ response }) => {
        this.selectingPlanId = null;
        this.snackBar.openSnackBar(
          response?.data?.message || response?.message || 'Your plan request has been received.',
          ''
        );
      });

    this.actions$
      .pipe(ofType(selectPlanFailure), takeUntil(this.destroy$))
      .subscribe(({ error }) => {
        this.selectingPlanId = null;
        this.snackBar.openSnackBar(error || 'Could not select that plan. Please try again.', 'error');
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  choosePlan(plan: Plan): void {
    if (this.selectingPlanId != null) return;
    this.selectingPlanId = plan.id;
    this.store.dispatch(selectPlan({ planId: plan.id }));
  }

  redeem(): void {
    const code = this.redeemCode.trim();
    if (!code || this.redeeming) return;

    this.redeeming = true;
    this.bypassCodeService.redeem(code)
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          this.redeeming = false;
          this.redeemCode = '';
          this.snackBar.openSnackBar(res?.message || 'Code redeemed!', '');
          this.store.dispatch(loadMySubscriptions());
        },
        error: (err) => {
          this.redeeming = false;
          this.snackBar.openSnackBar(err?.error?.message || 'Could not redeem that code.', 'error');
        }
      });
  }
}
