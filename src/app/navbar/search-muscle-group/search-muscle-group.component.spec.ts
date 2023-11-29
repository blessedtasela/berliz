import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchMuscleGroupComponent } from './search-muscle-group.component';

describe('SearchMuscleGroupComponent', () => {
  let component: SearchMuscleGroupComponent;
  let fixture: ComponentFixture<SearchMuscleGroupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SearchMuscleGroupComponent]
    });
    fixture = TestBed.createComponent(SearchMuscleGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
