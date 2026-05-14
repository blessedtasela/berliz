import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTodoListSectionComponent } from './my-todo-list-section.component';

describe('MyTodoListSectionComponent', () => {
  let component: MyTodoListSectionComponent;
  let fixture: ComponentFixture<MyTodoListSectionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyTodoListSectionComponent]
    });
    fixture = TestBed.createComponent(MyTodoListSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
