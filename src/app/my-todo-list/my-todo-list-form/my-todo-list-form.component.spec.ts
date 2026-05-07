import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTodoListFormComponent } from './my-todo-list-form.component';

describe('MyTodoListFormComponent', () => {
  let component: MyTodoListFormComponent;
  let fixture: ComponentFixture<MyTodoListFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyTodoListFormComponent]
    });
    fixture = TestBed.createComponent(MyTodoListFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
