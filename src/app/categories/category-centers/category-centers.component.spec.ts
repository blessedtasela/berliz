import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryCentersComponent } from './category-centers.component';

describe('CategoryCentersComponent', () => {
  let component: CategoryCentersComponent;
  let fixture: ComponentFixture<CategoryCentersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CategoryCentersComponent]
    });
    fixture = TestBed.createComponent(CategoryCentersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
