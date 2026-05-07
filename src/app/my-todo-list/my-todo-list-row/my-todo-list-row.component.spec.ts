import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTodoListRowComponent } from './my-todo-list-row.component';

describe('MyTodoListRowComponent', () => {
  let component: MyTodoListRowComponent;
  let fixture: ComponentFixture<MyTodoListRowComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyTodoListRowComponent]
    });
    fixture = TestBed.createComponent(MyTodoListRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
