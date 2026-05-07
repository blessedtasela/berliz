import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTodoListEmptyStateComponent } from './my-todo-list-empty-state.component';

describe('MyTodoListEmptyStateComponent', () => {
  let component: MyTodoListEmptyStateComponent;
  let fixture: ComponentFixture<MyTodoListEmptyStateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyTodoListEmptyStateComponent]
    });
    fixture = TestBed.createComponent(MyTodoListEmptyStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
