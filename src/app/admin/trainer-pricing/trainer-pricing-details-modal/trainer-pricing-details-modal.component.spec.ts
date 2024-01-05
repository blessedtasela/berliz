import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainerPricingDetailsModalComponent } from './trainer-pricing-details-modal.component';

describe('TrainerPricingDetailsModalComponent', () => {
  let component: TrainerPricingDetailsModalComponent;
  let fixture: ComponentFixture<TrainerPricingDetailsModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrainerPricingDetailsModalComponent]
    });
    fixture = TestBed.createComponent(TrainerPricingDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
