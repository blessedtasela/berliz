import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

import { ConnectionsMainComponent } from './connections-main.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { Connection } from 'src/app/models/connection.model';

import * as ConnectionActions from 'src/app/state/connection/connection.actions';
import {
  selectConnectionError,
  selectConnectionLoading,
  selectIncomingRequests,
  selectMyConnections,
  selectOutgoingRequests,
} from 'src/app/state/connection/connection.selectors';

describe('ConnectionsMainComponent', () => {
  let component: ConnectionsMainComponent;
  let fixture: ComponentFixture<ConnectionsMainComponent>;
  let store: MockStore;
  let router: jasmine.SpyObj<Router>;

  const incoming: Connection[] = [
    { id: 1, otherUserId: 2, otherUserName: 'Jordan Lee', otherUserRole: 'user', direction: 'incoming', status: 'pending', date: new Date() }
  ];
  const outgoing: Connection[] = [
    { id: 2, otherUserId: 3, otherUserName: 'Sam Coach', otherUserRole: 'trainer', direction: 'outgoing', status: 'pending', date: new Date() }
  ];
  const connections: Connection[] = [
    { id: 3, otherUserId: 4, otherUserName: 'Alex Client', otherUserRole: 'client', direction: 'outgoing', status: 'accepted', date: new Date() }
  ];

  beforeEach(() => {
    const snackbarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    router = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      declarations: [ConnectionsMainComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore({
          selectors: [
            { selector: selectIncomingRequests, value: incoming },
            { selector: selectOutgoingRequests, value: outgoing },
            { selector: selectMyConnections, value: connections },
            { selector: selectConnectionLoading, value: false },
            { selector: selectConnectionError, value: null },
          ]
        }),
        { provide: SnackBarService, useValue: snackbarSpy },
        { provide: Router, useValue: router },
      ]
    });

    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch').and.callThrough();

    fixture = TestBed.createComponent(ConnectionsMainComponent);
    component = fixture.componentInstance;
  });

  it('loads pending requests and connections from the store on init', () => {
    fixture.detectChanges();

    expect(component.incoming).toEqual(incoming);
    expect(component.outgoing).toEqual(outgoing);
    expect(component.connections).toEqual(connections);
    expect(store.dispatch).toHaveBeenCalledWith(ConnectionActions.loadPendingRequests());
    expect(store.dispatch).toHaveBeenCalledWith(ConnectionActions.loadMyConnections());
  });

  it('accept dispatches respondToConnectionRequest with status accepted', () => {
    fixture.detectChanges();

    component.accept(incoming[0]);

    expect(store.dispatch).toHaveBeenCalledWith(ConnectionActions.respondToConnectionRequest({ id: 1, status: 'accepted' }));
  });

  it('decline dispatches respondToConnectionRequest with status rejected', () => {
    fixture.detectChanges();

    component.decline(incoming[0]);

    expect(store.dispatch).toHaveBeenCalledWith(ConnectionActions.respondToConnectionRequest({ id: 1, status: 'rejected' }));
  });

  it('cancel dispatches cancelConnectionRequest', () => {
    fixture.detectChanges();

    component.cancel(outgoing[0]);

    expect(store.dispatch).toHaveBeenCalledWith(ConnectionActions.cancelConnectionRequest({ id: 2 }));
  });

  it('message navigates to /dashboard/messages', () => {
    fixture.detectChanges();

    component.message(connections[0]);

    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/messages']);
  });
});
