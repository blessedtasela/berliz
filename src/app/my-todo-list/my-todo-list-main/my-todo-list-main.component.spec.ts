import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { provideMockStore } from '@ngrx/store/testing';

import { MyTodoListMainComponent } from './my-todo-list-main.component';
import { TodoService } from 'src/app/services/todo.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

describe('MyTodoListMainComponent', () => {
  let component: MyTodoListMainComponent;
  let fixture: ComponentFixture<MyTodoListMainComponent>;

  beforeEach(() => {
    const todoServiceSpy = jasmine.createSpyObj('TodoService', ['bulkAction', 'quickAction', 'deleteTodo']);
    const snackbarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    TestBed.configureTestingModule({
      declarations: [MyTodoListMainComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore(),
        { provide: TodoService, useValue: todoServiceSpy },
        { provide: SnackBarService, useValue: snackbarSpy },
        { provide: MatDialog, useValue: dialogSpy }
      ]
    });
    fixture = TestBed.createComponent(MyTodoListMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
