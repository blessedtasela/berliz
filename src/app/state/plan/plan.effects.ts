import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { PlanService } from '../../services/plan.service';
import * as A from './plan.actions';

@Injectable()
export class PlanEffects {

  constructor(
    private actions$: Actions,
    private svc: PlanService,
  ) { }

  loadPlans$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadPlans),
    mergeMap(() => this.svc.getActivePlans().pipe(
      map(response => A.loadPlansSuccess({ response })),
      catchError(e => of(A.loadPlansFailure({ error: e?.error?.message || 'Failed to load plans' })))
    ))
  ));
}
