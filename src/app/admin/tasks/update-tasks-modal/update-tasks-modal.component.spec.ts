import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateTasksModalComponent } from './update-tasks-modal.component';

describe('UpdateTasksModalComponent', () => {
  let component: UpdateTasksModalComponent;
  let fixture: ComponentFixture<UpdateTasksModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UpdateTasksModalComponent]
    });
    fixture = TestBed.createComponent(UpdateTasksModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
