import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { UsedProductsComponent } from './used-products.component';

describe('UsedProductsComponent', () => {
  let component: UsedProductsComponent;
  let fixture: ComponentFixture<UsedProductsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UsedProductsComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(UsedProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
