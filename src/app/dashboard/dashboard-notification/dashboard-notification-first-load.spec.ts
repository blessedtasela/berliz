import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Actions } from '@ngrx/effects';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Subject, of } from 'rxjs';

import { NotificationService } from 'src/app/services/notification.service';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { loadMyNotificationsFailure, loadMyNotificationsSuccess } from 'src/app/state/notification/notification.actions';
import { selectMyNotifications } from 'src/app/state/notification/notification.selector';
import { DashboardNotificationComponent } from './dashboard-notification.component';

describe('DashboardNotificationComponent first load', () => {
  let fixture: ComponentFixture<DashboardNotificationComponent>;
  let actions$: Subject<any>;
  let store: MockStore;

  beforeEach(() => {
    actions$ = new Subject();
    TestBed.configureTestingModule({
      declarations: [DashboardNotificationComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore({ selectors: [{ selector: selectMyNotifications, value: [] }] }),
        { provide: Actions, useValue: actions$ },
        { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open']) },
        { provide: RxStompService, useValue: { watch: () => of() } },
        { provide: NotificationService, useValue: {} },
        { provide: SnackBarService, useValue: jasmine.createSpyObj('SnackBarService', ['openSnackBar']) },
      ],
    });
    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(DashboardNotificationComponent);
    fixture.detectChanges();
  });

  afterEach(() => store.resetSelectors());

  it('does not claim "No unread notifications" while they are still loading', () => {
    expect(fixture.nativeElement.textContent).not.toContain('No unread notifications');
    expect(fixture.nativeElement.querySelector('.animate-pulse')).not.toBeNull();
  });

  it('says it once the first load has answered with nothing unread', () => {
    actions$.next(loadMyNotificationsSuccess({ response: { data: [] } as any }));
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No unread notifications');
  });

  it('ends the wait when the load fails', () => {
    actions$.next(loadMyNotificationsFailure({ error: 'down' }));
    expect(fixture.componentInstance.loaded).toBeTrue();
  });
});
