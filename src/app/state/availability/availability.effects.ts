import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { AvailabilityService } from '../../services/availability.service';
import * as A from './availability.actions';

@Injectable()
export class AvailabilityEffects {

  constructor(
    private actions$: Actions,
    private svc: AvailabilityService,
  ) { }

  setMyAvailability$ = createEffect(() => this.actions$.pipe(
    ofType(A.setMyAvailability),
    mergeMap(({ days }) => this.svc.setMyAvailability(days).pipe(
      map(response => A.setMyAvailabilitySuccess({ response })),
      catchError(e => of(A.setMyAvailabilityFailure({ error: e?.error?.message || 'Failed to update your availability' })))
    ))
  ));

  loadMyAvailability$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadMyAvailability),
    mergeMap(() => this.svc.getMyAvailability().pipe(
      map(response => A.loadMyAvailabilitySuccess({ response })),
      catchError(e => of(A.loadMyAvailabilityFailure({ error: e?.error?.message || 'Failed to load your availability' })))
    ))
  ));

  loadProviderAvailability$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadProviderAvailability),
    mergeMap(({ trainerId, centerId }) => this.svc.getProviderAvailability(trainerId, centerId).pipe(
      map(response => A.loadProviderAvailabilitySuccess({ response })),
      catchError(e => of(A.loadProviderAvailabilityFailure({ error: e?.error?.message || 'Failed to load availability' })))
    ))
  ));

  loadAvailableSlots$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadAvailableSlots),
    mergeMap(({ trainerId, centerId, date }) => this.svc.getAvailableSlots(trainerId, centerId, date).pipe(
      map(response => A.loadAvailableSlotsSuccess({ response })),
      catchError(e => of(A.loadAvailableSlotsFailure({ error: e?.error?.message || 'Failed to load available times' })))
    ))
  ));
}
