import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyNotificationDetailModalComponent } from './my-notification-detail-modal.component';

describe('MyNotificationDetailModalComponent', () => {
  let component: MyNotificationDetailModalComponent;
  let fixture: ComponentFixture<MyNotificationDetailModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyNotificationDetailModalComponent]
    });
    fixture = TestBed.createComponent(MyNotificationDetailModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
