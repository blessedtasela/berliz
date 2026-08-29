import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { NEVER, of } from 'rxjs';

import { NotificationDropdownComponent } from './notification-dropdown.component';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { markAsRead } from 'src/app/state/notification/notification.actions';
import { selectMyNotifications } from 'src/app/state/notification/notification.selector';
import { Notifications } from 'src/app/models/Notifications.interface';

describe('NotificationDropdownComponent', () => {
  let component: NotificationDropdownComponent;
  let fixture: ComponentFixture<NotificationDropdownComponent>;
  let store: MockStore;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  const notifications: Notifications[] = [
    { id: 1, message: 'Someone liked your post', read: false, date: new Date() } as Notifications,
  ];

  beforeEach(() => {
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    dialogSpy.open.and.returnValue({ afterClosed: () => of(null) } as any);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const rxStompSpy = jasmine.createSpyObj('RxStompService', ['watch', 'publish']);
    rxStompSpy.watch.and.returnValue(NEVER);

    TestBed.configureTestingModule({
      declarations: [NotificationDropdownComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore({
          selectors: [{ selector: selectMyNotifications, value: notifications }]
        }),
        { provide: MatDialog, useValue: dialogSpy },
        { provide: Router, useValue: routerSpy },
        { provide: RxStompService, useValue: rxStompSpy }
      ]
    });
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch').and.callThrough();

    fixture = TestBed.createComponent(NotificationDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Regression: clicking a notification only mutated this dropdown's own local
  // list -- the navbar/sidebar unread badges select from the store, which
  // never changed, so they stayed stale after the click.
  it('openNotification dispatches markAsRead so the store-driven unread badges update', () => {
    component.openNotification(notifications[0]);

    expect(store.dispatch).toHaveBeenCalledWith(markAsRead({ id: 1 }));
  });
});
