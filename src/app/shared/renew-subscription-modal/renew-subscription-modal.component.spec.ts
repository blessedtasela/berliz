import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RenewSubscriptionModalComponent } from './renew-subscription-modal.component';

describe('RenewSubscriptionModalComponent', () => {
  let component: RenewSubscriptionModalComponent;
  let fixture: ComponentFixture<RenewSubscriptionModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RenewSubscriptionModalComponent]
    });
    fixture = TestBed.createComponent(RenewSubscriptionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
