import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductStatisticsComponent } from './product-statistics.component';

describe('ProductStatisticsComponent', () => {
  let component: ProductStatisticsComponent;
  let fixture: ComponentFixture<ProductStatisticsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProductStatisticsComponent]
    });
    fixture = TestBed.createComponent(ProductStatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
