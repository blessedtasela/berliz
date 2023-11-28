import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTrainerModalComponent } from './add-trainer-modal.component';

describe('AddTrainerModalComponent', () => {
  let component: AddTrainerModalComponent;
  let fixture: ComponentFixture<AddTrainerModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddTrainerModalComponent]
    });
    fixture = TestBed.createComponent(AddTrainerModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
