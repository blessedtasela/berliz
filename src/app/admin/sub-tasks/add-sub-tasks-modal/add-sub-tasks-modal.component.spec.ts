import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSubTasksModalComponent } from './add-sub-tasks-modal.component';

describe('AddSubTasksModalComponent', () => {
  let component: AddSubTasksModalComponent;
  let fixture: ComponentFixture<AddSubTasksModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddSubTasksModalComponent]
    });
    fixture = TestBed.createComponent(AddSubTasksModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
