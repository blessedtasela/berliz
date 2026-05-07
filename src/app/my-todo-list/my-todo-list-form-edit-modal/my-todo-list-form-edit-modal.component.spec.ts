import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTodoListFormEditModalComponent } from './my-todo-list-form-edit-modal.component';

describe('MyTodoListFormEditModalComponent', () => {
  let component: MyTodoListFormEditModalComponent;
  let fixture: ComponentFixture<MyTodoListFormEditModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyTodoListFormEditModalComponent]
    });
    fixture = TestBed.createComponent(MyTodoListFormEditModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
