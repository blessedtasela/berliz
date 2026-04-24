import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationEmptyStateComponent } from './notification-empty-state.component';

describe('NotificationEmptyStateComponent', () => {
  let component: NotificationEmptyStateComponent;
  let fixture: ComponentFixture<NotificationEmptyStateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NotificationEmptyStateComponent]
    });
    fixture = TestBed.createComponent(NotificationEmptyStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
