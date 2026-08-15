import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { provideMockStore } from '@ngrx/store/testing';

import { MuscleGroupDetailsModalComponent } from './muscle-group-details-modal.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';

describe('MuscleGroupDetailsModalComponent', () => {
  let component: MuscleGroupDetailsModalComponent;
  let fixture: ComponentFixture<MuscleGroupDetailsModalComponent>;

  beforeEach(() => {
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const snackbarServiceSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);

    TestBed.configureTestingModule({
      declarations: [MuscleGroupDetailsModalComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        DatePipe,
        provideMockStore(),
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: SnackBarService, useValue: snackbarServiceSpy },
        { provide: MAT_DIALOG_DATA, useValue: { muscleGroupData: {} } }
      ]
    });
    fixture = TestBed.createComponent(MuscleGroupDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
