import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTodoListItemComponent } from './my-todo-list-item.component';

describe('MyTodoListItemComponent', () => {
  let component: MyTodoListItemComponent;
  let fixture: ComponentFixture<MyTodoListItemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyTodoListItemComponent]
    });
    fixture = TestBed.createComponent(MyTodoListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
