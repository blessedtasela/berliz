import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { NotificationPaginationComponent } from './notification-pagination.component';

describe('NotificationPaginationComponent', () => {
  let component: NotificationPaginationComponent;
  let fixture: ComponentFixture<NotificationPaginationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NotificationPaginationComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(NotificationPaginationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
