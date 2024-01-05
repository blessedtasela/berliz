import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateTrainerPricingModalComponent } from './update-trainer-pricing-modal.component';

describe('UpdateTrainerPricingModalComponent', () => {
  let component: UpdateTrainerPricingModalComponent;
  let fixture: ComponentFixture<UpdateTrainerPricingModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UpdateTrainerPricingModalComponent]
    });
    fixture = TestBed.createComponent(UpdateTrainerPricingModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
