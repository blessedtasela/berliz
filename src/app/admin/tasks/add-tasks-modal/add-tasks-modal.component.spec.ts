import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTasksModalComponent } from './add-tasks-modal.component';

describe('AddTasksModalComponent', () => {
  let component: AddTasksModalComponent;
  let fixture: ComponentFixture<AddTasksModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddTasksModalComponent]
    });
    fixture = TestBed.createComponent(AddTasksModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
