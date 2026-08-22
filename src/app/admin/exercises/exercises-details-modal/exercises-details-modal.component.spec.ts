import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { provideMockStore } from '@ngrx/store/testing';

import { ExercisesDetailsModalComponent } from './exercises-details-modal.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';

describe('ExercisesDetailsModalComponent', () => {
  let component: ExercisesDetailsModalComponent;
  let fixture: ComponentFixture<ExercisesDetailsModalComponent>;

  beforeEach(() => {
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const snackbarServiceSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);

    TestBed.configureTestingModule({
      declarations: [ExercisesDetailsModalComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        DatePipe,
        provideMockStore(),
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: SnackBarService, useValue: snackbarServiceSpy },
        { provide: MAT_DIALOG_DATA, useValue: { exerciseData: { date: new Date().toISOString(), lastUpdate: new Date().toISOString() } } }
      ]
    });
    fixture = TestBed.createComponent(ExercisesDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
