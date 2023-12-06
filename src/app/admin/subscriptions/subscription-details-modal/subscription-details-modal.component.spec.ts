import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionDetailsModalComponent } from './subscription-details-modal.component';

describe('SubscriptionDetailsModalComponent', () => {
  let component: SubscriptionDetailsModalComponent;
  let fixture: ComponentFixture<SubscriptionDetailsModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SubscriptionDetailsModalComponent]
    });
    fixture = TestBed.createComponent(SubscriptionDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
