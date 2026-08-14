import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { provideMockStore } from '@ngrx/store/testing';

import { AssignTaskModalComponent } from './assign-task-modal.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';

describe('AssignTaskModalComponent', () => {
  let component: AssignTaskModalComponent;
  let fixture: ComponentFixture<AssignTaskModalComponent>;

  beforeEach(() => {
    const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    const mockSnackBarService = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);

    TestBed.configureTestingModule({
      declarations: [AssignTaskModalComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        FormBuilder,
        provideMockStore(),
        { provide: SnackBarService, useValue: mockSnackBarService },
        { provide: MatDialogRef, useValue: mockDialogRef },
      ]
    });

    fixture = TestBed.createComponent(AssignTaskModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
