import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { ExerciseDetailPageComponent } from './exercise-detail-page.component';
import { selectExercises, selectSelectedExercise } from 'src/app/state/exercise/exercise.selectors';

describe('ExerciseDetailPageComponent', () => {
  let component: ExerciseDetailPageComponent;
  let fixture: ComponentFixture<ExerciseDetailPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExerciseDetailPageComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        DatePipe,
        provideMockStore({
          selectors: [
            { selector: selectExercises, value: [] },
            { selector: selectSelectedExercise, value: null }
          ]
        }),
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: '1' })) } }
      ]
    });

    fixture = TestBed.createComponent(ExerciseDetailPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
