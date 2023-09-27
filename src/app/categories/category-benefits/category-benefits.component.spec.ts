import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryBenefitsComponent } from './category-benefits.component';

describe('CategoryBenefitsComponent', () => {
  let component: CategoryBenefitsComponent;
  let fixture: ComponentFixture<CategoryBenefitsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CategoryBenefitsComponent]
    });
    fixture = TestBed.createComponent(CategoryBenefitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
