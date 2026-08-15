import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideMockStore } from '@ngrx/store/testing';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { UpdateExercisesModalComponent } from './update-exercises-modal.component';
import { ExerciseService } from 'src/app/services/exercise.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

describe('UpdateExercisesModalComponent', () => {
  let component: UpdateExercisesModalComponent;
  let fixture: ComponentFixture<UpdateExercisesModalComponent>;

  beforeEach(() => {
    const exerciseServiceSpy = jasmine.createSpyObj('ExerciseService', ['updateExercise']);
    const ngxServiceSpy = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);
    const snackbarServiceSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    TestBed.configureTestingModule({
      declarations: [UpdateExercisesModalComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        FormBuilder,
        provideMockStore(),
        { provide: ExerciseService, useValue: exerciseServiceSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: NgxUiLoaderService, useValue: ngxServiceSpy },
        { provide: SnackBarService, useValue: snackbarServiceSpy },
        { provide: MAT_DIALOG_DATA, useValue: { exerciseData: { id: 1, name: '', muscleGroups: [], categories: [] } } }
      ]
    });
    fixture = TestBed.createComponent(UpdateExercisesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
