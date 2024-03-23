import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainersBenefitsComponent } from './trainers-benefits.component';

describe('TrainersBenefitsComponent', () => {
  let component: TrainersBenefitsComponent;
  let fixture: ComponentFixture<TrainersBenefitsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrainersBenefitsComponent]
    });
    fixture = TestBed.createComponent(TrainersBenefitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
