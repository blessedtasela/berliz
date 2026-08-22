import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { MyTodoListHeaderComponent } from './my-todo-list-header.component';

describe('MyTodoListHeaderComponent', () => {
  let component: MyTodoListHeaderComponent;
  let fixture: ComponentFixture<MyTodoListHeaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyTodoListHeaderComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(MyTodoListHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
