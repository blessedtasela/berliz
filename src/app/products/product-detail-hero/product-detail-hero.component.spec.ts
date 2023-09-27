import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductDetailHeroComponent } from './product-detail-hero.component';

describe('ProductDetailHeroComponent', () => {
  let component: ProductDetailHeroComponent;
  let fixture: ComponentFixture<ProductDetailHeroComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProductDetailHeroComponent]
    });
    fixture = TestBed.createComponent(ProductDetailHeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
