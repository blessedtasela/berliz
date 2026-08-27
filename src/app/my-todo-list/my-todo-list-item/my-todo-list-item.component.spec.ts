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
    // A due date of exactly "now" sits right on isOverdue()/isDueSoon()'s boundary:
    // by the time Angular's automatic checkNoChanges pass re-evaluates the template,
    // real time has moved past it and isOverdue() flips from false to true, tripping
    // NG0100 (ExpressionChangedAfterItHasBeenCheckedError). Use a due date safely in
    // the future so both passes agree.
    component.todo = {
      id: 1,
      task: '',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      priority: 'normal'
    } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
