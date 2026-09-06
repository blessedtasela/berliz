import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { provideMockStore } from '@ngrx/store/testing';
import { NEVER, of } from 'rxjs';

import { DashboardNotificationComponent } from './dashboard-notification.component';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { NotificationService } from 'src/app/services/notification.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

describe('DashboardNotificationComponent', () => {
  let component: DashboardNotificationComponent;
  let fixture: ComponentFixture<DashboardNotificationComponent>;

  beforeEach(() => {
    const rxStompServiceSpy = jasmine.createSpyObj('RxStompService', ['watch', 'publish']);
    rxStompServiceSpy.watch.and.returnValue(NEVER);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['markAsRead']);
    const snackbarServiceSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);

    TestBed.configureTestingModule({
      declarations: [DashboardNotificationComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore(),
        { provide: RxStompService, useValue: rxStompServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: SnackBarService, useValue: snackbarServiceSpy }
      ]
    });
    fixture = TestBed.createComponent(DashboardNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
