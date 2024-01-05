import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainerPricingHeaderComponent } from './trainer-pricing-header.component';

describe('TrainerPricingHeaderComponent', () => {
  let component: TrainerPricingHeaderComponent;
  let fixture: ComponentFixture<TrainerPricingHeaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrainerPricingHeaderComponent]
    });
    fixture = TestBed.createComponent(TrainerPricingHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
