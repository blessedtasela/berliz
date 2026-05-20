import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTrainerBenefitsComponent } from './my-trainer-benefits.component';

describe('MyTrainerBenefitsComponent', () => {
  let component: MyTrainerBenefitsComponent;
  let fixture: ComponentFixture<MyTrainerBenefitsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyTrainerBenefitsComponent]
    });
    fixture = TestBed.createComponent(MyTrainerBenefitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
