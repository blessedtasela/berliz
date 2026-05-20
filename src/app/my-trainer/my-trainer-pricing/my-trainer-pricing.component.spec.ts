import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTrainerPricingComponent } from './my-trainer-pricing.component';

describe('MyTrainerPricingComponent', () => {
  let component: MyTrainerPricingComponent;
  let fixture: ComponentFixture<MyTrainerPricingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyTrainerPricingComponent]
    });
    fixture = TestBed.createComponent(MyTrainerPricingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
