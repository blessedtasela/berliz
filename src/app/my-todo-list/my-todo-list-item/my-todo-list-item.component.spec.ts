import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { MyTodoListItemComponent } from './my-todo-list-item.component';

describe('MyTodoListItemComponent', () => {
  let component: MyTodoListItemComponent;
  let fixture: ComponentFixture<MyTodoListItemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyTodoListItemComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(MyTodoListItemComponent);
    component = fixture.componentInstance;
    component.todo = { id: 1, task: '', dueDate: new Date().toISOString(), status: 'pending' } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
