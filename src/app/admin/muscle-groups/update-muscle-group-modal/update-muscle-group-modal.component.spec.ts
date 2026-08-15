import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { UpdateMuscleGroupModalComponent } from './update-muscle-group-modal.component';
import { MuscleGroupService } from 'src/app/services/muscle-group.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

describe('UpdateMuscleGroupModalComponent', () => {
  let component: UpdateMuscleGroupModalComponent;
  let fixture: ComponentFixture<UpdateMuscleGroupModalComponent>;

  beforeEach(() => {
    const muscleGroupServiceSpy = jasmine.createSpyObj('MuscleGroupService', ['updateMuscleGroup', 'getBodyParts']);
    muscleGroupServiceSpy.getBodyParts.and.returnValue([]);
    const ngxServiceSpy = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);
    const snackbarServiceSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    TestBed.configureTestingModule({
      declarations: [UpdateMuscleGroupModalComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        FormBuilder,
        { provide: MuscleGroupService, useValue: muscleGroupServiceSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: NgxUiLoaderService, useValue: ngxServiceSpy },
        { provide: SnackBarService, useValue: snackbarServiceSpy },
        { provide: MAT_DIALOG_DATA, useValue: { muscleGroupData: {} } }
      ]
    });
    fixture = TestBed.createComponent(UpdateMuscleGroupModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
