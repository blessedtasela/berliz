import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { TaskDetailsModalComponent } from './task-details-modal.component';

describe('TaskDetailsModalComponent', () => {
  let component: TaskDetailsModalComponent;
  let fixture: ComponentFixture<TaskDetailsModalComponent>;

  beforeEach(() => {
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    TestBed.configureTestingModule({
      declarations: [TaskDetailsModalComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        DatePipe,
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: { taskData: { date: new Date().toISOString(), startDate: new Date().toISOString(), endDate: new Date().toISOString(), lastUpdate: new Date().toISOString() } } }
      ]
    });
    fixture = TestBed.createComponent(TaskDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
