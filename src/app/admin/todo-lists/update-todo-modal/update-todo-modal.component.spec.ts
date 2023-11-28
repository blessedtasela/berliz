import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateTodoModalComponent } from './update-todo-modal.component';

describe('UpdateTodoModalComponent', () => {
  let component: UpdateTodoModalComponent;
  let fixture: ComponentFixture<UpdateTodoModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UpdateTodoModalComponent]
    });
    fixture = TestBed.createComponent(UpdateTodoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
