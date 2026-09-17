import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

import { AssignTaskModalComponent } from './assign-task-modal.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { addTask } from 'src/app/state/task/task.actions';

describe('AssignTaskModalComponent', () => {
  let component: AssignTaskModalComponent;
  let fixture: ComponentFixture<AssignTaskModalComponent>;
  let store: MockStore;

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
    store = TestBed.inject(MockStore);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // The backend's TaskRequest DTO (com.berliz.DTO.TaskRequest) only accepts an
  // "email" field for the target client — it has no "userId" property at all,
  // so a trainer submission carrying "userId" is rejected by Jackson before it
  // ever reaches business logic. These tests pin the form/payload to the field
  // the backend actually accepts.
  it('builds the client control as "email", not "userId"', () => {
    fixture.detectChanges();
    expect(component.assignTaskForm.contains('email')).toBeTrue();
    expect(component.assignTaskForm.contains('userId')).toBeFalse();
  });

  it('dispatches addTask with the selected client\'s email, not a userId', () => {
    fixture.detectChanges();
    spyOn(store, 'dispatch');

    component.assignTaskForm.patchValue({
      email: 'client@example.com',
      description: 'Upper body strength block for the week',
      priority: 'HIGH',
      startDate: '2026-09-14',
      endDate: '2026-09-21',
    });
    component.stepGroup(0).patchValue({ name: 'Warm-up set', exerciseId: '3' });

    component.assign();

    expect(store.dispatch).toHaveBeenCalledWith(addTask({
      data: {
        email: 'client@example.com',
        description: 'Upper body strength block for the week',
        priority: 'HIGH',
        startDate: '2026-09-14',
        endDate: '2026-09-21',
        subTasks: [{ name: 'Warm-up set', exerciseId: 3 }],
      }
    }));
  });
});
