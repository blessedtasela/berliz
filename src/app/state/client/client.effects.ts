import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { ClientService } from '../../services/client.service';
import * as A from './client.actions';

@Injectable()
export class ClientEffects {

  constructor(
    private actions$: Actions,
    private svc: ClientService,
  ) { }

  loadClients$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadClients),
    mergeMap(() => this.svc.getAllClients().pipe(
      map(data => A.loadClientsSuccess({ data })),
      catchError(e => of(A.loadClientsFailure({ error: e?.error?.message || 'Failed to load clients' })))
    ))
  ));

  loadActiveClients$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadActiveClients),
    mergeMap(() => this.svc.getActiveClients().pipe(
      map(data => A.loadActiveClientsSuccess({ data })),
      catchError(e => of(A.loadActiveClientsFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  loadMyClient$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadMyClient),
    mergeMap(() => this.svc.getClient().pipe(
      map(data => A.loadMyClientSuccess({ data })),
      catchError(e => of(A.loadMyClientFailure({ error: e?.error?.message || 'Failed to load client profile' })))
    ))
  ));

  addClient$ = createEffect(() => this.actions$.pipe(
    ofType(A.addClient),
    mergeMap(({ data }) => this.svc.addClient(data).pipe(
      map(r => A.addClientSuccess({ message: r.message })),
      catchError(e => of(A.addClientFailure({ error: e?.error?.message || 'Failed to add client' })))
    ))
  ));

  updateClient$ = createEffect(() => this.actions$.pipe(
    ofType(A.updateClient),
    mergeMap(({ data }) => this.svc.updateClient(data).pipe(
      map(r => A.updateClientSuccess({ message: r.message })),
      catchError(e => of(A.updateClientFailure({ error: e?.error?.message || 'Failed to update client' })))
    ))
  ));

  updateClientStatus$ = createEffect(() => this.actions$.pipe(
    ofType(A.updateClientStatus),
    mergeMap(({ id }) => this.svc.updateStatus(id).pipe(
      map(r => A.updateClientStatusSuccess({ message: r.message })),
      catchError(e => of(A.updateClientStatusFailure({ error: e?.error?.message || 'Failed' })))
    ))
  ));

  deleteClient$ = createEffect(() => this.actions$.pipe(
    ofType(A.deleteClient),
    mergeMap(({ id }) => this.svc.deleteClient(id).pipe(
      map(r => A.deleteClientSuccess({ message: r.message })),
      catchError(e => of(A.deleteClientFailure({ error: e?.error?.message || 'Failed to delete client' })))
    ))
  ));
}
