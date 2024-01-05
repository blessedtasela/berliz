import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainerPricingListComponent } from './trainer-pricing-list.component';

describe('TrainerPricingListComponent', () => {
  let component: TrainerPricingListComponent;
  let fixture: ComponentFixture<TrainerPricingListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrainerPricingListComponent]
    });
    fixture = TestBed.createComponent(TrainerPricingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
