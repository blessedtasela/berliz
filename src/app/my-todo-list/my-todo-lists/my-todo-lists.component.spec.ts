import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { MyTodoListsComponent } from './my-todo-lists.component';

describe('MyTodoListsComponent', () => {
  let component: MyTodoListsComponent;
  let fixture: ComponentFixture<MyTodoListsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyTodoListsComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(MyTodoListsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
