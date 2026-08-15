import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { provideMockStore } from '@ngrx/store/testing';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { AddExercisesModalComponent } from './add-exercises-modal.component';
import { ExerciseService } from 'src/app/services/exercise.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

describe('AddExercisesModalComponent', () => {
  let component: AddExercisesModalComponent;
  let fixture: ComponentFixture<AddExercisesModalComponent>;

  beforeEach(() => {
    const exerciseServiceSpy = jasmine.createSpyObj('ExerciseService', ['addExercise']);
    const ngxServiceSpy = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);
    const snackbarServiceSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    TestBed.configureTestingModule({
      declarations: [AddExercisesModalComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        FormBuilder,
        provideMockStore(),
        { provide: ExerciseService, useValue: exerciseServiceSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: NgxUiLoaderService, useValue: ngxServiceSpy },
        { provide: SnackBarService, useValue: snackbarServiceSpy }
      ]
    });
    fixture = TestBed.createComponent(AddExercisesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
