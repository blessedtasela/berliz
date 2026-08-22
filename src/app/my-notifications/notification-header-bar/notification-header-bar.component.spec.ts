import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { NotificationHeaderBarComponent } from './notification-header-bar.component';

describe('NotificationHeaderBarComponent', () => {
  let component: NotificationHeaderBarComponent;
  let fixture: ComponentFixture<NotificationHeaderBarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NotificationHeaderBarComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(NotificationHeaderBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
