import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError, firstValueFrom } from 'rxjs';

import { ConnectionEffects } from './connection.effects';
import { ConnectionService } from '../../services/connection.service';
import { RxStompService } from '../../services/rx-stomp.service';
import * as A from './connection.actions';
import { ApiResponse } from '../../models/Api.interface';
import { Connection } from '../../models/connection.model';

describe('ConnectionEffects', () => {
  let actions$: Observable<any>;
  let effects: ConnectionEffects;
  let serviceSpy: jasmine.SpyObj<ConnectionService>;
  let rxStompSpy: jasmine.SpyObj<RxStompService>;

  const sampleConnection: Connection = {
    id: 1, otherUserId: 5, otherUserName: 'Coach Sam', otherUserRole: 'trainer',
    direction: 'outgoing', status: 'pending', date: new Date(),
  };

  beforeEach(() => {
    serviceSpy = jasmine.createSpyObj('ConnectionService', [
      'sendRequest', 'respond', 'cancel', 'getMyConnections', 'getPendingRequests'
    ]);
    rxStompSpy = jasmine.createSpyObj('RxStompService', ['watch']);
    rxStompSpy.watch.and.returnValue(of({ body: '{}' } as any));

    TestBed.configureTestingModule({
      providers: [
        ConnectionEffects,
        provideMockActions(() => actions$),
        { provide: ConnectionService, useValue: serviceSpy },
        { provide: RxStompService, useValue: rxStompSpy },
      ]
    });

    effects = TestBed.inject(ConnectionEffects);
  });

  it('loadMyConnections$ dispatches loadMyConnectionsSuccess with the connections returned by the service', async () => {
    const response: ApiResponse<Connection[]> = { message: 'ok', data: [sampleConnection], success: true, statusCode: 200 };
    serviceSpy.getMyConnections.and.returnValue(of(response));
    actions$ = of(A.loadMyConnections());

    const result = await firstValueFrom(effects.loadMyConnections$);

    expect(result).toEqual(A.loadMyConnectionsSuccess({ response }));
  });

  it('loadPendingRequests$ dispatches loadPendingRequestsSuccess with the requests returned by the service', async () => {
    const response: ApiResponse<Connection[]> = { message: 'ok', data: [sampleConnection], success: true, statusCode: 200 };
    serviceSpy.getPendingRequests.and.returnValue(of(response));
    actions$ = of(A.loadPendingRequests());

    const result = await firstValueFrom(effects.loadPendingRequests$);

    expect(result).toEqual(A.loadPendingRequestsSuccess({ response }));
  });

  it('sendConnectionRequest$ dispatches sendConnectionRequestSuccess on success', async () => {
    const response: ApiResponse<Connection> = { message: 'Connection request sent', data: sampleConnection, success: true, statusCode: 200 };
    serviceSpy.sendRequest.and.returnValue(of(response));
    actions$ = of(A.sendConnectionRequest({ recipientId: 5 }));

    const result = await firstValueFrom(effects.sendConnectionRequest$);

    expect(result).toEqual(A.sendConnectionRequestSuccess({ response }));
    expect(serviceSpy.sendRequest).toHaveBeenCalledWith(5);
  });

  it('sendConnectionRequest$ dispatches sendConnectionRequestFailure on error', async () => {
    serviceSpy.sendRequest.and.returnValue(throwError(() => ({ error: { message: 'You already have a pending connection request with this person.' } })));
    actions$ = of(A.sendConnectionRequest({ recipientId: 5 }));

    const result = await firstValueFrom(effects.sendConnectionRequest$);

    expect(result).toEqual(A.sendConnectionRequestFailure({ error: 'You already have a pending connection request with this person.' }));
  });

  it('respondToConnectionRequest$ dispatches respondToConnectionRequestSuccess on success', async () => {
    const response: ApiResponse<Connection> = { message: 'Connection accepted', data: { ...sampleConnection, status: 'accepted' }, success: true, statusCode: 200 };
    serviceSpy.respond.and.returnValue(of(response));
    actions$ = of(A.respondToConnectionRequest({ id: 1, status: 'accepted' }));

    const result = await firstValueFrom(effects.respondToConnectionRequest$);

    expect(result).toEqual(A.respondToConnectionRequestSuccess({ response }));
    expect(serviceSpy.respond).toHaveBeenCalledWith(1, 'accepted');
  });

  it('cancelConnectionRequest$ dispatches cancelConnectionRequestSuccess on success', async () => {
    const response: ApiResponse<Connection> = { message: 'Connection request cancelled', data: { ...sampleConnection, status: 'cancelled' }, success: true, statusCode: 200 };
    serviceSpy.cancel.and.returnValue(of(response));
    actions$ = of(A.cancelConnectionRequest({ id: 1 }));

    const result = await firstValueFrom(effects.cancelConnectionRequest$);

    expect(result).toEqual(A.cancelConnectionRequestSuccess({ response }));
    expect(serviceSpy.cancel).toHaveBeenCalledWith(1);
  });

  it('reloadAfterSend$ dispatches loadPendingRequests after a successful send', async () => {
    const response: ApiResponse<Connection> = { message: 'ok', data: sampleConnection, success: true, statusCode: 200 };
    actions$ = of(A.sendConnectionRequestSuccess({ response }));

    const result = await firstValueFrom(effects.reloadAfterSend$);

    expect(result).toEqual(A.loadPendingRequests());
  });

  it('reloadAfterRespond$ dispatches both loadPendingRequests and loadMyConnections after a successful respond', (done) => {
    const response: ApiResponse<Connection> = { message: 'ok', data: sampleConnection, success: true, statusCode: 200 };
    actions$ = of(A.respondToConnectionRequestSuccess({ response }));

    const results: any[] = [];
    effects.reloadAfterRespond$.subscribe({
      next: r => results.push(r),
      complete: () => {
        expect(results).toEqual([A.loadPendingRequests(), A.loadMyConnections()]);
        done();
      }
    });
  });

  it('reloadAfterCancel$ dispatches loadPendingRequests after a successful cancel', async () => {
    const response: ApiResponse<Connection> = { message: 'ok', data: sampleConnection, success: true, statusCode: 200 };
    actions$ = of(A.cancelConnectionRequestSuccess({ response }));

    const result = await firstValueFrom(effects.reloadAfterCancel$);

    expect(result).toEqual(A.loadPendingRequests());
  });

  it('refreshOnNewRequest$ dispatches loadPendingRequests on the broadcast topic', async () => {
    const result = await firstValueFrom(effects.refreshOnNewRequest$);

    expect(result).toEqual(A.loadPendingRequests());
    expect(rxStompSpy.watch).toHaveBeenCalledWith('/topic/newConnectionRequest');
  });

  it('refreshOnAccepted$ dispatches loadMyConnections on the broadcast topic', async () => {
    const result = await firstValueFrom(effects.refreshOnAccepted$);

    expect(result).toEqual(A.loadMyConnections());
    expect(rxStompSpy.watch).toHaveBeenCalledWith('/topic/connectionRequestAccepted');
  });
});
