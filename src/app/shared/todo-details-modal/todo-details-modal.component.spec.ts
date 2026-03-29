import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodoDetailsModalComponent } from './todo-details-modal.component';

describe('TodoDetailsModalComponent', () => {
  let component: TodoDetailsModalComponent;
  let fixture: ComponentFixture<TodoDetailsModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TodoDetailsModalComponent]
    });
    fixture = TestBed.createComponent(TodoDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
