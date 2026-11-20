import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Actions } from '@ngrx/effects';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Subject } from 'rxjs';

import { NotificationMainComponent } from './notification-main.component';
import { NotificationService } from 'src/app/services/notification.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { LoadErrorComponent } from 'src/app/shared/load-error/load-error.component';
import { selectMyNotifications, selectNotificationLoading } from 'src/app/state/notification/notification.selector';
import { loadMyNotifications } from 'src/app/state/notification/notification.actions';

describe('NotificationMainComponent', () => {
  let component: NotificationMainComponent;
  let fixture: ComponentFixture<NotificationMainComponent>;
  let store: MockStore;
  let actions$: Subject<any>;

  beforeEach(() => {
    const notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['markAsRead', 'markAsUnread', 'bulkAction', 'deleteNotification']);
    const snackbarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    actions$ = new Subject<any>();

    TestBed.configureTestingModule({
      declarations: [NotificationMainComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [LoadErrorComponent],
      providers: [
        provideMockStore({
          selectors: [
            { selector: selectMyNotifications, value: [] },
            { selector: selectNotificationLoading, value: true },
          ],
        }),
        { provide: Actions, useValue: actions$ },
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: SnackBarService, useValue: snackbarSpy },
        { provide: MatDialog, useValue: dialogSpy }
      ]
    });
    fixture = TestBed.createComponent(NotificationMainComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('dispatches loadMyNotifications on init, instead of relying on another component to have done it first', () => {
    const dispatch = spyOn(store, 'dispatch');
    fixture.detectChanges();
    expect(dispatch).toHaveBeenCalledWith(loadMyNotifications());
  });

  /**
   * GN-73: this page used to go straight from "Total 0 / No notifications" to the real counts --
   * it never tracked loading of its own, so the metrics and list rendered on whatever (empty)
   * data happened to already be in the store the instant it mounted.
   */
  describe('while the list is still loading (GN-73)', () => {
    const el = () => fixture.nativeElement as HTMLElement;

    it('shows a spinner, not the metrics or list', () => {
      fixture.detectChanges();

      expect(el().querySelector('[data-testid="notifications-loading"]')).toBeTruthy();
      expect(el().querySelector('app-my-notification-metrics')).toBeNull();
      expect(el().querySelector('notification-list')).toBeNull();
    });

    it('shows the metrics and list once loading resolves', () => {
      store.overrideSelector(selectNotificationLoading, false);
      store.refreshState();
      fixture.detectChanges();

      expect(el().querySelector('[data-testid="notifications-loading"]')).toBeNull();
      expect(el().querySelector('app-my-notification-metrics')).toBeTruthy();
    });

    it('shows a retryable error instead of the metrics/list when the load fails', () => {
      store.overrideSelector(selectNotificationLoading, false);
      store.refreshState();
      fixture.detectChanges();
      actions$.next({ type: '[Notifications] Load My Failure', error: 'Server exploded' });
      fixture.detectChanges();

      expect(el().textContent).toContain("Couldn't load your notifications");
      expect(el().textContent).toContain('Server exploded');
      expect(el().querySelector('app-my-notification-metrics')).toBeNull();
    });
  });
});
