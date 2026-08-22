import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { MyTodoListFormComponent } from './my-todo-list-form.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TodoService } from 'src/app/services/todo.service';

describe('MyTodoListFormComponent', () => {
  let component: MyTodoListFormComponent;
  let fixture: ComponentFixture<MyTodoListFormComponent>;

  beforeEach(() => {
    const loaderSpy = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);
    const snackbarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    const todoServiceSpy = jasmine.createSpyObj('TodoService', ['addTodo']);

    TestBed.configureTestingModule({
      declarations: [MyTodoListFormComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        FormBuilder,
        { provide: NgxUiLoaderService, useValue: loaderSpy },
        { provide: SnackBarService, useValue: snackbarSpy },
        { provide: TodoService, useValue: todoServiceSpy }
      ]
    });
    fixture = TestBed.createComponent(MyTodoListFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
