import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateExercisesModalComponent } from './update-exercises-modal.component';

describe('UpdateExercisesModalComponent', () => {
  let component: UpdateExercisesModalComponent;
  let fixture: ComponentFixture<UpdateExercisesModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UpdateExercisesModalComponent]
    });
    fixture = TestBed.createComponent(UpdateExercisesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
