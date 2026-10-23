import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Actions } from '@ngrx/effects';
import { provideRouter, Router } from '@angular/router';
import { NEVER, Subject, of, throwError } from 'rxjs';

import { MyNotificationsPageComponent } from './my-notifications-page.component';
import { AuthService } from 'src/app/services/auth.service';
import { NotificationService } from 'src/app/services/notification.service';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { loadMyNotifications, loadMyNotificationsFailure, loadMyNotificationsSuccess } from 'src/app/state/notification/notification.actions';
import { LoadErrorComponent } from 'src/app/shared/load-error/load-error.component';

describe('MyNotificationsPageComponent', () => {
  let component: MyNotificationsPageComponent;
  let fixture: ComponentFixture<MyNotificationsPageComponent>;
  let actions$: Subject<any>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let snackBar: jasmine.SpyObj<SnackBarService>;

  beforeEach(() => {
    notificationService = jasmine.createSpyObj('NotificationService', ['markAllAsRead']);
    snackBar = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
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
        provideRouter([]),
        { provide: NotificationService, useValue: notificationService },
        { provide: SnackBarService, useValue: snackBar },
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

  describe('views, categories and deep links', () => {
    const n = (id: number, over: any = {}): any => ({
      id, notification: `Notification ${id}`, date: new Date(), read: false, entityType: undefined, ...over,
    });
    const LIST = [
      n(1, { entityType: 'booking', notification: 'Booking confirmed' }),
      n(2, { entityType: 'message', read: true, notification: 'New message from Sam' }),
      n(3, { entityType: 'booking', read: true, notification: 'Booking cancelled' }),
      n(4, { notification: 'Welcome to Berliz' }),
    ];

    // The store subscription itself is just rawNotifications = selector result; feed the component directly.
    function load(list: any[]) {
      component.rawNotifications = list;
      component.applyFilters();
    }
    const ids = () => component.notificationData.map(x => x.id);

    beforeEach(() => load(LIST));

    it('counts unread and groups categories', () => {
      expect(component.unreadCount).toBe(2);
      expect(component.categoryCounts.map(c => [c.category.key, c.count])).toEqual([
        ['messages', 1], ['bookings', 2], ['other', 1],
      ]);
    });

    it('?view=unread narrows to unread notifications', () => {
      component.applyUrlState('unread', null, null, null);
      expect(ids()).toEqual([1, 4]);
    });

    it('combines a view and a category from the URL', () => {
      component.applyUrlState('read', 'bookings', null, null);
      expect(ids()).toEqual([3]);
    });

    it('?q= filters by text', () => {
      component.applyUrlState(null, null, 'cancelled', null);
      expect(ids()).toEqual([3]);
    });

    it('ignores nonsense view/category/id values from the URL', () => {
      component.applyUrlState('bogus', 'nope', null, 'abc');
      expect(component.view).toBe('all');
      expect(component.category).toBe('all');
      expect(component.highlightId).toBeNull();
      expect(ids()).toEqual([1, 2, 3, 4]);
    });

    it('?id= widens only the filters that would hide the notification (here: it is read, so Unread goes)', () => {
      component.applyUrlState('unread', 'messages', 'zzz', '2');
      expect(component.highlightId).toBe(2);
      expect(component.view).toBe('all');
      expect(component.category).toBe('messages'); // notification 2 is a message, so that filter stays
      expect(component.query).toBe('');
      expect(ids()).toEqual([2]);
    });

    it('?id= also drops a category filter that would hide the notification', () => {
      component.applyUrlState(null, 'messages', null, '1'); // notification 1 is a booking
      expect(component.highlightId).toBe(1);
      expect(component.category).toBe('all');
      expect(ids()).toContain(1);
    });

    it('tells the user when an ?id= link points at a notification that is gone', () => {
      component.applyUrlState(null, null, null, '999');
      expect(component.highlightId).toBeNull();
      expect(component.linkNotice).toBe("That notification isn't available any more.");
    });

    it('writes view and category to the URL when the user changes them, and ends deep-link mode', () => {
      const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
      component.applyUrlState(null, null, null, '1');
      component.setView('unread');

      expect(component.highlightId).toBeNull();
      const args = navigate.calls.mostRecent().args[1] as any;
      expect(args.queryParams.view).toBe('unread');
      expect(args.queryParams.id).toBeNull();
      expect(args.replaceUrl).toBeTrue();
    });

    it('drops default values from the URL', () => {
      const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
      component.setCategory('bookings');
      component.setCategory('all');
      const args = navigate.calls.mostRecent().args[1] as any;
      expect(args.queryParams.category).toBeNull();
    });

    describe('mark all as read', () => {
      it('marks them, confirms with the server message and reloads', () => {
        notificationService.markAllAsRead.and.returnValue(of({ message: 'All your notifications are marked as read', success: true } as any));
        const dispatch = spyOn(TestBed.inject(MockStore), 'dispatch');

        component.markAllRead();

        expect(snackBar.openSnackBar).toHaveBeenCalledWith('All your notifications are marked as read', '');
        expect(dispatch).toHaveBeenCalledWith(loadMyNotifications());
        expect(component.markingAll).toBeFalse();
      });

      it('shows an error snackbar (a quick action) when it fails', () => {
        notificationService.markAllAsRead.and.returnValue(throwError(() => ({ error: { message: 'Nope' } })));
        component.markAllRead();
        expect(snackBar.openSnackBar).toHaveBeenCalledWith('Nope', 'error');
        expect(component.markingAll).toBeFalse();
      });

      it('does nothing when there is nothing unread', () => {
        load([n(1, { read: true })]);
        component.markAllRead();
        expect(notificationService.markAllAsRead).not.toHaveBeenCalled();
      });
    });
  });
});
