import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainerPricingComponent } from './trainer-pricing.component';

describe('TrainerPricingComponent', () => {
  let component: TrainerPricingComponent;
  let fixture: ComponentFixture<TrainerPricingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrainerPricingComponent]
    });
    fixture = TestBed.createComponent(TrainerPricingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
