import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, mergeMap, of } from 'rxjs';
import { PartnerService } from '../../services/partner.service';
import * as A from './partner.actions';

@Injectable()
export class PartnerEffects {

  constructor(
    private actions$: Actions,
    private svc: PartnerService,
  ) { }

  loadPartners$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadPartners),
    mergeMap(() => this.svc.getAllPartners().pipe(
      map(r => A.loadPartnersSuccess({ response: r })),
      catchError(e => of(A.loadPartnersFailure({ error: e?.error?.message || 'Failed to load partners' })))
    ))
  ));

  loadActivePartners$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadActivePartners),
    mergeMap(() => this.svc.getActivePartners().pipe(
      map(r => A.loadActivePartnersSuccess({ response: r })),
      catchError(e => of(A.loadActivePartnersFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  loadPartner$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadPartner),
    mergeMap(({ id }) => this.svc.getPartnerById(id).pipe(
      map(r => A.loadPartnerSuccess({ response: r })),
      catchError(e => of(A.loadPartnerFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  // exhaustMap (not mergeMap): collapses concurrent/duplicate loadMyPartner
  // dispatches into a single in-flight request instead of firing a new GET
  // for every dispatch (see PartnerComponent.loadData()).
  loadMyPartner$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadMyPartner),
    exhaustMap(() => this.svc.getPartner().pipe(
      map(r => A.loadMyPartnerSuccess({ response: r })),
      catchError(e => of(A.loadMyPartnerFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  addPartner$ = createEffect(() => this.actions$.pipe(
    ofType(A.addPartner),
    mergeMap(({ data }) => this.svc.addPartner(data).pipe(
      map(r => A.addPartnerSuccess({ response: r })),
      catchError(e => of(A.addPartnerFailure({ error: e?.error?.message || 'Failed to add partner' })))
    ))
  ));

  updatePartner$ = createEffect(() => this.actions$.pipe(
    ofType(A.updatePartner),
    mergeMap(({ data }) => this.svc.updatePartner(data).pipe(
      map(r => A.updatePartnerSuccess({ response: r })),
      catchError(e => of(A.updatePartnerFailure({ error: e?.error?.message || 'Failed to update partner' })))
    ))
  ));

  updatePartnerFile$ = createEffect(() => this.actions$.pipe(
    ofType(A.updatePartnerFile),
    mergeMap(({ data }) => this.svc.updateFile(data).pipe(
      map(r => A.updatePartnerFileSuccess({ response: r })),
      catchError(e => of(A.updatePartnerFileFailure({ error: e?.error?.message || 'Failed to update file' })))
    ))
  ));

  updatePartnerStatus$ = createEffect(() => this.actions$.pipe(
    ofType(A.updatePartnerStatus),
    mergeMap(({ id }) => this.svc.updateStatus(id).pipe(
      map(r => A.updatePartnerStatusSuccess({ response: r })),
      catchError(e => of(A.updatePartnerStatusFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  rejectPartner$ = createEffect(() => this.actions$.pipe(
    ofType(A.rejectPartner),
    mergeMap(({ id }) => this.svc.rejectApplication(id).pipe(
      map(r => A.rejectPartnerSuccess({ response: r })),
      catchError(e => of(A.rejectPartnerFailure({ error: e?.error?.message || 'Failed to reject partner' })))
    ))
  ));

  deletePartner$ = createEffect(() => this.actions$.pipe(
    ofType(A.deletePartner),
    mergeMap(({ id }) => this.svc.deletePartner(id).pipe(
      map(() => A.deletePartnerSuccess({ id })),
      catchError(e => of(A.deletePartnerFailure({ error: e?.error?.message || 'Failed to delete partner' })))
    ))
  ));
}
