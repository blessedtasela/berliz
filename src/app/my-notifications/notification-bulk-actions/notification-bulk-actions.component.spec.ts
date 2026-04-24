import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationBulkActionsComponent } from './notification-bulk-actions.component';

describe('NotificationBulkActionsComponent', () => {
  let component: NotificationBulkActionsComponent;
  let fixture: ComponentFixture<NotificationBulkActionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NotificationBulkActionsComponent]
    });
    fixture = TestBed.createComponent(NotificationBulkActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
