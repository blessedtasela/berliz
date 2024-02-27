import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchCategoriesComponent } from './search-categories.component';

describe('SearchCategoriesComponent', () => {
  let component: SearchCategoriesComponent;
  let fixture: ComponentFixture<SearchCategoriesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SearchCategoriesComponent]
    });
    fixture = TestBed.createComponent(SearchCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
