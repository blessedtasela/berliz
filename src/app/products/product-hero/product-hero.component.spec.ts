import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductHeroComponent } from './product-hero.component';

describe('ProductHeroComponent', () => {
  let component: ProductHeroComponent;
  let fixture: ComponentFixture<ProductHeroComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProductHeroComponent]
    });
    fixture = TestBed.createComponent(ProductHeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
