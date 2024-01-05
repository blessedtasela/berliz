import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTrainerPricingModalComponent } from './add-trainer-pricing-modal.component';

describe('AddTrainerPricingModalComponent', () => {
  let component: AddTrainerPricingModalComponent;
  let fixture: ComponentFixture<AddTrainerPricingModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddTrainerPricingModalComponent]
    });
    fixture = TestBed.createComponent(AddTrainerPricingModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
