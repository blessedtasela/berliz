import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { TodoListDetailsModalComponent } from './todo-list-details-modal.component';

describe('TodoListDetailsModalComponent', () => {
  let component: TodoListDetailsModalComponent;
  let fixture: ComponentFixture<TodoListDetailsModalComponent>;

  const mockDialogData = {
    todoData: {
      date: new Date().toISOString(),
      dueDate: new Date().toISOString(),
      lastUpdate: new Date().toISOString()
    }
  };

  const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TodoListDetailsModalComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
        { provide: MatDialogRef, useValue: mockDialogRef },
        DatePipe
      ]
    });

    fixture = TestBed.createComponent(TodoListDetailsModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
