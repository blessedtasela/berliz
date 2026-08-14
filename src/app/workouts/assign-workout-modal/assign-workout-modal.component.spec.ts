import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Actions } from '@ngrx/effects';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { AssignWorkoutModalComponent } from './assign-workout-modal.component';
import { AuthService } from 'src/app/services/auth.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

describe('AssignWorkoutModalComponent', () => {
  let component: AssignWorkoutModalComponent;
  let fixture: ComponentFixture<AssignWorkoutModalComponent>;

  beforeEach(() => {
    const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    const mockAuthService = jasmine.createSpyObj('AuthService', ['getCurrentUserRole', 'getCurrentUserId']);
    mockAuthService.getCurrentUserRole.and.returnValue('user');
    mockAuthService.getCurrentUserId.and.returnValue(1);
    const mockSnackBarService = jasmine.createSpyObj('SnackBarService', ['openSnackBar', 'dismiss']);

    TestBed.configureTestingModule({
      declarations: [AssignWorkoutModalComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        FormBuilder,
        provideMockStore(),
        { provide: Actions, useValue: of() },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: AuthService, useValue: mockAuthService },
        { provide: SnackBarService, useValue: mockSnackBarService },
      ]
    });

    fixture = TestBed.createComponent(AssignWorkoutModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
