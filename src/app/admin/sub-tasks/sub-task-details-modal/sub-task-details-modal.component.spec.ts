import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubTaskDetailsModalComponent } from './sub-task-details-modal.component';

describe('SubTaskDetailsModalComponent', () => {
  let component: SubTaskDetailsModalComponent;
  let fixture: ComponentFixture<SubTaskDetailsModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SubTaskDetailsModalComponent]
    });
    fixture = TestBed.createComponent(SubTaskDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
