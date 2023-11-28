import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchMuscleGroupsComponent } from './search-muscle-groups.component';

describe('SearchMuscleGroupsComponent', () => {
  let component: SearchMuscleGroupsComponent;
  let fixture: ComponentFixture<SearchMuscleGroupsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SearchMuscleGroupsComponent]
    });
    fixture = TestBed.createComponent(SearchMuscleGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
