import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { DashboardService } from '../../services/dashboard.service';
import * as A from './dashboard.actions';

@Injectable()
export class DashboardEffects {

  constructor(
    private actions$: Actions,
    private svc: DashboardService,
  ) { }

  loadDashboard$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadDashboard),
    mergeMap(() => this.svc.getDashboardDetails().pipe(
      map(data => A.loadDashboardSuccess({ data })),
      catchError(e => of(A.loadDashboardFailure({ error: e?.error?.message || 'Failed to load dashboard' })))
    ))
  ));
}
