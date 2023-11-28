import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateTrainerModalComponent } from './update-trainer-modal.component';

describe('UpdateTrainerModalComponent', () => {
  let component: UpdateTrainerModalComponent;
  let fixture: ComponentFixture<UpdateTrainerModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UpdateTrainerModalComponent]
    });
    fixture = TestBed.createComponent(UpdateTrainerModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
