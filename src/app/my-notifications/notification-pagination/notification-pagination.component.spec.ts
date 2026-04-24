import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationPaginationComponent } from './notification-pagination.component';

describe('NotificationPaginationComponent', () => {
  let component: NotificationPaginationComponent;
  let fixture: ComponentFixture<NotificationPaginationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NotificationPaginationComponent]
    });
    fixture = TestBed.createComponent(NotificationPaginationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
