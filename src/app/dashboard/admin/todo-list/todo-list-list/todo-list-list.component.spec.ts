import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodoListListComponent } from './todo-list-list.component';

describe('TodoListListComponent', () => {
  let component: TodoListListComponent;
  let fixture: ComponentFixture<TodoListListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TodoListListComponent]
    });
    fixture = TestBed.createComponent(TodoListListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
