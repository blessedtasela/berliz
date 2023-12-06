import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateSubTasksModalComponent } from './update-sub-tasks-modal.component';

describe('UpdateSubTasksModalComponent', () => {
  let component: UpdateSubTasksModalComponent;
  let fixture: ComponentFixture<UpdateSubTasksModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UpdateSubTasksModalComponent]
    });
    fixture = TestBed.createComponent(UpdateSubTasksModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
