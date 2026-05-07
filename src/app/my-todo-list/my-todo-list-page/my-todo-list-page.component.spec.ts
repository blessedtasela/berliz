import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTodoListPageComponent } from './my-todo-list-page.component';

describe('MyTodoListPageComponent', () => {
  let component: MyTodoListPageComponent;
  let fixture: ComponentFixture<MyTodoListPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyTodoListPageComponent]
    });
    fixture = TestBed.createComponent(MyTodoListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
