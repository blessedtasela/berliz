import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { MyTodoListTimelineComponent } from './my-todo-list-timeline.component';

describe('MyTodoListTimelineComponent', () => {
  let component: MyTodoListTimelineComponent;
  let fixture: ComponentFixture<MyTodoListTimelineComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyTodoListTimelineComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(MyTodoListTimelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('sorts oldest first and hands back the same array until the input changes', () => {
    component.todos = [{ id: 2, date: new Date('2026-02-01') }, { id: 1, date: new Date('2026-01-01') }] as any;
    const first = component.sortedTodos;
    expect(first.map(t => t.id)).toEqual([1, 2]);
    expect(component.sortedTodos).toBe(first);
    component.todos = [{ id: 3, date: new Date('2026-03-01') }] as any;
    expect(component.sortedTodos.map(t => t.id)).toEqual([3]);
  });
});
