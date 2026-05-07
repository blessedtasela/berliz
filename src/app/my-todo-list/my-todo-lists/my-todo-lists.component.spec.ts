import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTodoListsComponent } from './my-todo-lists.component';

describe('MyTodoListsComponent', () => {
  let component: MyTodoListsComponent;
  let fixture: ComponentFixture<MyTodoListsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyTodoListsComponent]
    });
    fixture = TestBed.createComponent(MyTodoListsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
