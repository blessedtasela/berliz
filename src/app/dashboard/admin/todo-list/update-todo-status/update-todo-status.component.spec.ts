import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateTodoStatusComponent } from './update-todo-status.component';

describe('UpdateTodoStatusComponent', () => {
  let component: UpdateTodoStatusComponent;
  let fixture: ComponentFixture<UpdateTodoStatusComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UpdateTodoStatusComponent]
    });
    fixture = TestBed.createComponent(UpdateTodoStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
