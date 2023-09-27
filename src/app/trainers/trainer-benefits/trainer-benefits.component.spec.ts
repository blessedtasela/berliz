import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainerBenefitsComponent } from './trainer-benefits.component';

describe('TrainerBenefitsComponent', () => {
  let component: TrainerBenefitsComponent;
  let fixture: ComponentFixture<TrainerBenefitsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrainerBenefitsComponent]
    });
    fixture = TestBed.createComponent(TrainerBenefitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
