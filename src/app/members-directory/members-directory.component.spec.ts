import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

import { MembersDirectoryComponent } from './members-directory.component';
import { AuthService } from 'src/app/services/auth.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { PublicDirectoryEntry } from 'src/app/models/users.interface';
import { Connection } from 'src/app/models/connection.model';

import { selectPublicDirectory, selectPublicDirectoryError, selectPublicDirectoryLoading } from 'src/app/state/user-profile/user-profile.selector';
import { sendConnectionRequest, cancelConnectionRequest, respondToConnectionRequest } from 'src/app/state/connection/connection.actions';
import { selectConnectionError, selectMyConnections, selectPendingRequests } from 'src/app/state/connection/connection.selectors';

describe('MembersDirectoryComponent', () => {
  let component: MembersDirectoryComponent;
  let fixture: ComponentFixture<MembersDirectoryComponent>;
  let store: MockStore;
  let router: Router;

  const members: PublicDirectoryEntry[] = [
    { id: 1, firstname: 'Self', lastname: 'User', role: 'user', profilePhoto: null, memberSince: '2024-01-01' },
    { id: 2, firstname: 'Nobody', lastname: 'Yet', role: 'trainer', profilePhoto: null, memberSince: '2024-01-01' },
    { id: 3, firstname: 'Sent', lastname: 'Outgoing', role: 'user', profilePhoto: null, memberSince: '2024-01-01' },
    { id: 4, firstname: 'Wants', lastname: 'ToConnect', role: 'user', profilePhoto: null, memberSince: '2024-01-01' },
    { id: 5, firstname: 'Already', lastname: 'Connected', role: 'trainer', profilePhoto: null, memberSince: '2024-01-01' },
  ];

  const pendingRequests: Connection[] = [
    { id: 10, otherUserId: 3, otherUserName: 'Sent Outgoing', otherUserRole: 'user', direction: 'outgoing', status: 'pending', date: new Date() },
    { id: 11, otherUserId: 4, otherUserName: 'Wants ToConnect', otherUserRole: 'user', direction: 'incoming', status: 'pending', date: new Date() },
  ];

  const myConnections: Connection[] = [
    { id: 12, otherUserId: 5, otherUserName: 'Already Connected', otherUserRole: 'trainer', direction: 'outgoing', status: 'accepted', date: new Date() },
  ];

  function setup() {
    const mockAuthService = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'getCurrentUserId']);
    mockAuthService.isAuthenticated.and.returnValue(true);
    mockAuthService.getCurrentUserId.and.returnValue(1);
    const snackbarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);

    TestBed.configureTestingModule({
      imports: [MembersDirectoryComponent, RouterTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore({
          selectors: [
            { selector: selectPublicDirectory, value: members },
            { selector: selectPublicDirectoryLoading, value: false },
            { selector: selectPublicDirectoryError, value: null },
            { selector: selectMyConnections, value: myConnections },
            { selector: selectPendingRequests, value: pendingRequests },
            { selector: selectConnectionError, value: null },
          ]
        }),
        { provide: AuthService, useValue: mockAuthService },
        { provide: SnackBarService, useValue: snackbarSpy },
      ]
    });

    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch').and.callThrough();
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(MembersDirectoryComponent);
    component = fixture.componentInstance;
  }

  it('should create', () => {
    setup();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('connectStatus is "self" for the signed-in user\'s own row', () => {
    setup();
    fixture.detectChanges();
    expect(component.connectStatus(members[0])).toBe('self');
  });

  it('connectStatus is "none" for someone with no request either way', () => {
    setup();
    fixture.detectChanges();
    expect(component.connectStatus(members[1])).toBe('none');
  });

  it('connectStatus is "outgoing" for a request the signed-in user sent', () => {
    setup();
    fixture.detectChanges();
    expect(component.connectStatus(members[2])).toBe('outgoing');
  });

  it('connectStatus is "incoming" for a request the signed-in user received', () => {
    setup();
    fixture.detectChanges();
    expect(component.connectStatus(members[3])).toBe('incoming');
  });

  it('connectStatus is "connected" once accepted', () => {
    setup();
    fixture.detectChanges();
    expect(component.connectStatus(members[4])).toBe('connected');
  });

  it('connect dispatches sendConnectionRequest and stops the anchor navigation', () => {
    setup();
    fixture.detectChanges();
    const event = jasmine.createSpyObj('Event', ['preventDefault', 'stopPropagation']);

    component.connect(members[1], event);

    expect(store.dispatch).toHaveBeenCalledWith(sendConnectionRequest({ recipientId: 2 }));
    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
  });

  it('cancelRequest dispatches cancelConnectionRequest with the pending request id', () => {
    setup();
    fixture.detectChanges();
    const event = jasmine.createSpyObj('Event', ['preventDefault', 'stopPropagation']);

    component.cancelRequest(members[2], event);

    expect(store.dispatch).toHaveBeenCalledWith(cancelConnectionRequest({ id: 10 }));
  });

  it('acceptRequest/declineRequest dispatch respondToConnectionRequest with the right status', () => {
    setup();
    fixture.detectChanges();
    const event = jasmine.createSpyObj('Event', ['preventDefault', 'stopPropagation']);

    component.acceptRequest(members[3], event);
    expect(store.dispatch).toHaveBeenCalledWith(respondToConnectionRequest({ id: 11, status: 'accepted' }));

    component.declineRequest(members[3], event);
    expect(store.dispatch).toHaveBeenCalledWith(respondToConnectionRequest({ id: 11, status: 'rejected' }));
  });

  it('messageMember navigates to /dashboard/messages', () => {
    setup();
    fixture.detectChanges();
    const event = jasmine.createSpyObj('Event', ['preventDefault', 'stopPropagation']);

    component.messageMember(members[4], event);

    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/messages'], { queryParams: { userId: 5 } });
  });
});
