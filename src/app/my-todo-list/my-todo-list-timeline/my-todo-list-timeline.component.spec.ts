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
});
