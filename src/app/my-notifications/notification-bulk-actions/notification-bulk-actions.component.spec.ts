import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { NotificationBulkActionsComponent } from './notification-bulk-actions.component';

describe('NotificationBulkActionsComponent', () => {
  let component: NotificationBulkActionsComponent;
  let fixture: ComponentFixture<NotificationBulkActionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NotificationBulkActionsComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(NotificationBulkActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
