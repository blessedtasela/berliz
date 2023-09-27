import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductPromotionsComponent } from './product-promotions.component';

describe('ProductPromotionsComponent', () => {
  let component: ProductPromotionsComponent;
  let fixture: ComponentFixture<ProductPromotionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProductPromotionsComponent]
    });
    fixture = TestBed.createComponent(ProductPromotionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
