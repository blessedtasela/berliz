import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTodoListMainComponent } from './my-todo-list-main.component';

describe('MyTodoListMainComponent', () => {
  let component: MyTodoListMainComponent;
  let fixture: ComponentFixture<MyTodoListMainComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyTodoListMainComponent]
    });
    fixture = TestBed.createComponent(MyTodoListMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
