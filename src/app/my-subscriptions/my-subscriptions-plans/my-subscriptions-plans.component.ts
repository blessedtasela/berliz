import { Component, OnDestroy, OnInit } from '@angular/core';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';

import { Plan } from 'src/app/models/plan.model';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { loadPlans } from 'src/app/state/plan/plan.actions';
import { selectPlanLoading, selectPlans } from 'src/app/state/plan/plan.selectors';
import { selectPlan, selectPlanFailure, selectPlanSuccess } from 'src/app/state/subscription/subscription.actions';

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

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private actions$: Actions,
    private snackBar: SnackBarService,
  ) { }

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
}
