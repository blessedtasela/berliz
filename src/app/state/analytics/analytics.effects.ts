import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { AnalyticsService } from '../../services/analytics.service';
import * as A from './analytics.actions';

@Injectable()
export class AnalyticsEffects {

  constructor(
    private actions$: Actions,
    private svc: AnalyticsService,
  ) { }

  loadLoginStats$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadLoginStats),
    mergeMap(() => this.svc.getLoginStats().pipe(
      map(data => A.loadLoginStatsSuccess({ data })),
      catchError(e => of(A.loadLoginStatsFailure({ error: e?.error?.message || 'Failed to load login stats' })))
    ))
  ));

  loadMyLoginHistory$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadMyLoginHistory),
    mergeMap(() => this.svc.getMyLoginHistory().pipe(
      map(data => A.loadMyLoginHistorySuccess({ data })),
      catchError(e => of(A.loadMyLoginHistoryFailure({ error: e?.error?.message || 'Failed to load login history' })))
    ))
  ));
}
