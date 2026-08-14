import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatePipe } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { provideMockStore } from '@ngrx/store/testing';
import { SnackBarService } from 'src/app/services/snack-bar.service';

import { MuscleGroupDetailsModalComponent } from './muscle-group-details-modal.component';

describe('MuscleGroupDetailsModalComponent', () => {
  let component: MuscleGroupDetailsModalComponent;
  let fixture: ComponentFixture<MuscleGroupDetailsModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MuscleGroupDetailsModalComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { muscleGroupData: {} } },
        { provide: MatDialogRef, useValue: jasmine.createSpyObj('MatDialogRef', ['close']) },
        { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open']) },
        { provide: SnackBarService, useValue: jasmine.createSpyObj('SnackBarService', ['openSnackBar']) },
        DatePipe,
        provideMockStore(),
      ],
    });
    fixture = TestBed.createComponent(MuscleGroupDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
