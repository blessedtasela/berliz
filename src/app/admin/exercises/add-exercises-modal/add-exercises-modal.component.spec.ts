import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddExercisesModalComponent } from './add-exercises-modal.component';

describe('AddExercisesModalComponent', () => {
  let component: AddExercisesModalComponent;
  let fixture: ComponentFixture<AddExercisesModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddExercisesModalComponent]
    });
    fixture = TestBed.createComponent(AddExercisesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
