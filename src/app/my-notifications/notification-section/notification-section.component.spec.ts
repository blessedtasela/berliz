import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationSectionComponent } from './notification-section.component';

describe('NotificationSectionComponent', () => {
  let component: NotificationSectionComponent;
  let fixture: ComponentFixture<NotificationSectionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NotificationSectionComponent]
    });
    fixture = TestBed.createComponent(NotificationSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
