import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExercisesDetailsModalComponent } from './exercises-details-modal.component';

describe('ExercisesDetailsModalComponent', () => {
  let component: ExercisesDetailsModalComponent;
  let fixture: ComponentFixture<ExercisesDetailsModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExercisesDetailsModalComponent]
    });
    fixture = TestBed.createComponent(ExercisesDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
