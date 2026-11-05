import { PLATFORM_ID } from '@angular/core';
import { TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AuthService } from './auth.service';
import { RxStompService } from './rx-stomp.service';
import { StompSessionService } from './stomp-session.service';

describe('StompSessionService', () => {
  let rxStomp: jasmine.SpyObj<RxStompService>;
  let auth: jasmine.SpyObj<AuthService>;
  let routerEvents: Subject<unknown>;

  function setup(platform = 'browser'): StompSessionService {
    rxStomp = jasmine.createSpyObj('RxStompService', ['deactivate', 'activate']);
    rxStomp.deactivate.and.resolveTo();
    auth = jasmine.createSpyObj('AuthService', ['getCurrentUserEmail']);
    routerEvents = new Subject<unknown>();
    TestBed.configureTestingModule({
      providers: [
        { provide: RxStompService, useValue: rxStomp },
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: { events: routerEvents } },
        { provide: PLATFORM_ID, useValue: platform },
      ],
    });
    return TestBed.inject(StompSessionService);
  }

  function navigate(): void {
    routerEvents.next(new NavigationEnd(1, '/next', '/next'));
    flushMicrotasks();
  }

  it('restarts the connection on logout', fakeAsync(() => {
    const service = setup();
    auth.getCurrentUserEmail.and.returnValue('a@example.com');
    service.start();

    auth.getCurrentUserEmail.and.returnValue(null);
    navigate();

    expect(rxStomp.deactivate).toHaveBeenCalledOnceWith({ force: true });
    expect(rxStomp.activate).toHaveBeenCalledTimes(1);
  }));

  it('restarts the connection on login', fakeAsync(() => {
    const service = setup();
    auth.getCurrentUserEmail.and.returnValue(null);
    service.start();

    auth.getCurrentUserEmail.and.returnValue('a@example.com');
    navigate();

    expect(rxStomp.deactivate).toHaveBeenCalledTimes(1);
    expect(rxStomp.activate).toHaveBeenCalledTimes(1);
  }));

  it('restarts the connection when a different user takes over', fakeAsync(() => {
    const service = setup();
    auth.getCurrentUserEmail.and.returnValue('a@example.com');
    service.start();

    auth.getCurrentUserEmail.and.returnValue('b@example.com');
    navigate();

    expect(rxStomp.activate).toHaveBeenCalledTimes(1);
  }));

  it('restarts when another tab changes the session', fakeAsync(() => {
    const service = setup();
    auth.getCurrentUserEmail.and.returnValue('a@example.com');
    service.start();

    auth.getCurrentUserEmail.and.returnValue(null);
    window.dispatchEvent(new StorageEvent('storage', { key: 'token' }));
    flushMicrotasks();

    expect(rxStomp.activate).toHaveBeenCalledTimes(1);
  }));

  it('leaves the connection alone when the same user only refreshed their token', fakeAsync(() => {
    const service = setup();
    auth.getCurrentUserEmail.and.returnValue('a@example.com');
    service.start();

    navigate();

    expect(rxStomp.deactivate).not.toHaveBeenCalled();
    expect(rxStomp.activate).not.toHaveBeenCalled();
  }));

  it('does nothing during prerendering', fakeAsync(() => {
    const service = setup('server');
    auth.getCurrentUserEmail.and.returnValue('a@example.com');
    service.start();

    auth.getCurrentUserEmail.and.returnValue(null);
    navigate();

    expect(auth.getCurrentUserEmail).not.toHaveBeenCalled();
    expect(rxStomp.deactivate).not.toHaveBeenCalled();
  }));
});
