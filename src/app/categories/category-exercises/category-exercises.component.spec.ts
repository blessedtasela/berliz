import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { CategoryExercisesComponent } from './category-exercises.component';

describe('CategoryExercisesComponent', () => {
  let component: CategoryExercisesComponent;
  let fixture: ComponentFixture<CategoryExercisesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CategoryExercisesComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: []
    });

    fixture = TestBed.createComponent(CategoryExercisesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
