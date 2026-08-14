import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { TrainerPricingCardComponent } from './trainer-pricing-card.component';

describe('TrainerPricingCardComponent', () => {
  let component: TrainerPricingCardComponent;
  let fixture: ComponentFixture<TrainerPricingCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrainerPricingCardComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: []
    });

    fixture = TestBed.createComponent(TrainerPricingCardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
