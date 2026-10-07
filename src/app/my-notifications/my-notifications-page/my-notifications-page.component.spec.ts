import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Actions } from '@ngrx/effects';
import { NEVER, Subject, of } from 'rxjs';

import { MyNotificationsPageComponent } from './my-notifications-page.component';
import { AuthService } from 'src/app/services/auth.service';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { loadMyNotifications, loadMyNotificationsFailure, loadMyNotificationsSuccess } from 'src/app/state/notification/notification.actions';
import { LoadErrorComponent } from 'src/app/shared/load-error/load-error.component';

describe('MyNotificationsPageComponent', () => {
  let component: MyNotificationsPageComponent;
  let fixture: ComponentFixture<MyNotificationsPageComponent>;
  let actions$: Subject<any>;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isAdmin']);
    authServiceSpy.isAdmin.and.returnValue(false);
    const rxStompSpy = jasmine.createSpyObj('RxStompService', ['watch']);
    rxStompSpy.watch.and.returnValue(NEVER);

    actions$ = new Subject<any>();
    TestBed.configureTestingModule({
      declarations: [MyNotificationsPageComponent],
      imports: [LoadErrorComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore(),
        { provide: Actions, useValue: actions$ },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: RxStompService, useValue: rxStompSpy }
      ]
    });
    fixture = TestBed.createComponent(MyNotificationsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when the notifications cannot be loaded', () => {
    const el = () => fixture.nativeElement as HTMLElement;

    it('shows a retryable error instead of "No notifications yet"', () => {
      actions$.next(loadMyNotificationsFailure({ error: 'Server exploded' }));
      fixture.detectChanges();

      expect(el().textContent).toContain("Couldn't load your notifications");
      expect(el().textContent).toContain('Server exploded');
      expect(el().querySelector('app-my-notifications')).toBeNull();
    });

    it('retrying loads them again, and a success brings the list back', () => {
      actions$.next(loadMyNotificationsFailure({ error: 'Server exploded' }));
      fixture.detectChanges();
      const dispatch = spyOn(TestBed.inject(MockStore), 'dispatch');

      (el().querySelector('app-load-error button') as HTMLButtonElement).click();
      expect(dispatch).toHaveBeenCalledWith(loadMyNotifications());

      actions$.next(loadMyNotificationsSuccess({ response: [] } as any));
      fixture.detectChanges();
      expect(el().querySelector('app-load-error')).toBeNull();
      expect(el().querySelector('app-my-notifications')).not.toBeNull();
    });

    it('shows the list (and its own empty state) when nothing failed', () => {
      fixture.detectChanges();
      expect(el().querySelector('app-my-notifications')).not.toBeNull();
      expect(el().querySelector('app-load-error')).toBeNull();
    });
  });
});
