import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationMainComponent } from './notification-main.component';

describe('NotificationMainComponent', () => {
  let component: NotificationMainComponent;
  let fixture: ComponentFixture<NotificationMainComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NotificationMainComponent]
    });
    fixture = TestBed.createComponent(NotificationMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
