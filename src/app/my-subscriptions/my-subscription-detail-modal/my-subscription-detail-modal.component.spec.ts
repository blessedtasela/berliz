import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MySubscriptionDetailModalComponent } from './my-subscription-detail-modal.component';

describe('MySubscriptionDetailModalComponent', () => {
  let component: MySubscriptionDetailModalComponent;
  let fixture: ComponentFixture<MySubscriptionDetailModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MySubscriptionDetailModalComponent]
    });
    fixture = TestBed.createComponent(MySubscriptionDetailModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
