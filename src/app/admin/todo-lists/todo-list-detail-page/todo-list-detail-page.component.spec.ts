import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { TodoListDetailPageComponent } from './todo-list-detail-page.component';
import { selectTodos } from 'src/app/state/todo/todo.selectors';

describe('TodoListDetailPageComponent', () => {
  let component: TodoListDetailPageComponent;
  let fixture: ComponentFixture<TodoListDetailPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TodoListDetailPageComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        DatePipe,
        provideMockStore({ selectors: [{ selector: selectTodos, value: [] }] }),
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: '1' })) } }
      ]
    });

    fixture = TestBed.createComponent(TodoListDetailPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
