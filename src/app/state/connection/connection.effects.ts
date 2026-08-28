import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { ConnectionService } from '../../services/connection.service';
import { RxStompService } from '../../services/rx-stomp.service';
import * as A from './connection.actions';

@Injectable()
export class ConnectionEffects {

  constructor(
    private actions$: Actions,
    private svc: ConnectionService,
    private rxStompService: RxStompService,
  ) { }

  loadMyConnections$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadMyConnections),
    mergeMap(() => this.svc.getMyConnections().pipe(
      map(response => A.loadMyConnectionsSuccess({ response })),
      catchError(e => of(A.loadMyConnectionsFailure({ error: e?.error?.message || 'Failed to load connections' })))
    ))
  ));

  loadPendingRequests$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadPendingRequests),
    mergeMap(() => this.svc.getPendingRequests().pipe(
      map(response => A.loadPendingRequestsSuccess({ response })),
      catchError(e => of(A.loadPendingRequestsFailure({ error: e?.error?.message || 'Failed to load pending requests' })))
    ))
  ));

  sendConnectionRequest$ = createEffect(() => this.actions$.pipe(
    ofType(A.sendConnectionRequest),
    mergeMap(({ recipientId }) => this.svc.sendRequest(recipientId).pipe(
      map(response => A.sendConnectionRequestSuccess({ response })),
      catchError(e => of(A.sendConnectionRequestFailure({ error: e?.error?.message || 'Failed to send connection request' })))
    ))
  ));

  respondToConnectionRequest$ = createEffect(() => this.actions$.pipe(
    ofType(A.respondToConnectionRequest),
    mergeMap(({ id, status }) => this.svc.respond(id, status).pipe(
      map(response => A.respondToConnectionRequestSuccess({ response })),
      catchError(e => of(A.respondToConnectionRequestFailure({ error: e?.error?.message || 'Failed to respond to connection request' })))
    ))
  ));

  cancelConnectionRequest$ = createEffect(() => this.actions$.pipe(
    ofType(A.cancelConnectionRequest),
    mergeMap(({ id }) => this.svc.cancel(id).pipe(
      map(response => A.cancelConnectionRequestSuccess({ response })),
      catchError(e => of(A.cancelConnectionRequestFailure({ error: e?.error?.message || 'Failed to cancel connection request' })))
    ))
  ));

  // Reload the relevant list(s) after each mutation succeeds, rather than
  // hand-splicing the store -- same "reload after mutation" pattern
  // NotificationEffects uses (e.g. markAsReadReload$).
  reloadAfterSend$ = createEffect(() => this.actions$.pipe(
    ofType(A.sendConnectionRequestSuccess),
    mergeMap(() => [A.loadPendingRequests()])
  ));

  reloadAfterRespond$ = createEffect(() => this.actions$.pipe(
    ofType(A.respondToConnectionRequestSuccess),
    mergeMap(() => [A.loadPendingRequests(), A.loadMyConnections()])
  ));

  reloadAfterCancel$ = createEffect(() => this.actions$.pipe(
    ofType(A.cancelConnectionRequestSuccess),
    mergeMap(() => [A.loadPendingRequests()])
  ));

  // Live refresh signals -- broadcast + authenticated refetch, same pattern
  // every other feature besides messaging uses (a pending-request/accepted
  // ping isn't sensitive the way a message body is, so it doesn't need
  // messaging's private per-user queue).
  refreshOnNewRequest$ = createEffect(() => this.rxStompService.watch('/topic/newConnectionRequest').pipe(
    map(() => A.loadPendingRequests())
  ));

  refreshOnAccepted$ = createEffect(() => this.rxStompService.watch('/topic/connectionRequestAccepted').pipe(
    map(() => A.loadMyConnections())
  ));
}
