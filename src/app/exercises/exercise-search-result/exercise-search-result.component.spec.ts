import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExerciseSearchResultComponent } from './exercise-search-result.component';

describe('ExerciseSearchResultComponent', () => {
  let component: ExerciseSearchResultComponent;
  let fixture: ComponentFixture<ExerciseSearchResultComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExerciseSearchResultComponent]
    });
    fixture = TestBed.createComponent(ExerciseSearchResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
