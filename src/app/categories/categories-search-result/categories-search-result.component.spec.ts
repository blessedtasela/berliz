import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriesSearchResultComponent } from './categories-search-result.component';

describe('CategoriesSearchResultComponent', () => {
  let component: CategoriesSearchResultComponent;
  let fixture: ComponentFixture<CategoriesSearchResultComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CategoriesSearchResultComponent]
    });
    fixture = TestBed.createComponent(CategoriesSearchResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
