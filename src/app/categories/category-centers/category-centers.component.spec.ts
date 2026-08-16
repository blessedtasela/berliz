import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { CategoryCentersComponent } from './category-centers.component';

describe('CategoryCentersComponent', () => {
  let component: CategoryCentersComponent;
  let fixture: ComponentFixture<CategoryCentersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CategoryCentersComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(CategoryCentersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
