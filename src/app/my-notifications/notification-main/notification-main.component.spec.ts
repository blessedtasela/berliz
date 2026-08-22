import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { provideMockStore } from '@ngrx/store/testing';

import { NotificationMainComponent } from './notification-main.component';
import { NotificationService } from 'src/app/services/notification.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

describe('NotificationMainComponent', () => {
  let component: NotificationMainComponent;
  let fixture: ComponentFixture<NotificationMainComponent>;

  beforeEach(() => {
    const notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['markAsRead', 'markAsUnread', 'bulkAction', 'deleteNotification']);
    const snackbarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    TestBed.configureTestingModule({
      declarations: [NotificationMainComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore(),
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: SnackBarService, useValue: snackbarSpy },
        { provide: MatDialog, useValue: dialogSpy }
      ]
    });
    fixture = TestBed.createComponent(NotificationMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
