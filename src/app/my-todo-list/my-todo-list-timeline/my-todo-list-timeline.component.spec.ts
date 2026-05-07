import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTodoListTimelineComponent } from './my-todo-list-timeline.component';

describe('MyTodoListTimelineComponent', () => {
  let component: MyTodoListTimelineComponent;
  let fixture: ComponentFixture<MyTodoListTimelineComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyTodoListTimelineComponent]
    });
    fixture = TestBed.createComponent(MyTodoListTimelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
