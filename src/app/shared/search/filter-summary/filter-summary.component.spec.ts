import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterSummaryComponent } from './filter-summary.component';

describe('FilterSummaryComponent', () => {
  let component: FilterSummaryComponent;
  let fixture: ComponentFixture<FilterSummaryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FilterSummaryComponent]
    });
    fixture = TestBed.createComponent(FilterSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
