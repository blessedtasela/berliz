import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTodoListDetailModalComponent } from './my-todo-list-detail-modal.component';

describe('MyTodoListDetailModalComponent', () => {
  let component: MyTodoListDetailModalComponent;
  let fixture: ComponentFixture<MyTodoListDetailModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyTodoListDetailModalComponent]
    });
    fixture = TestBed.createComponent(MyTodoListDetailModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
