import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExerciseIntroductionComponent } from './exercise-introduction.component';

describe('ExerciseIntroductionComponent', () => {
  let component: ExerciseIntroductionComponent;
  let fixture: ComponentFixture<ExerciseIntroductionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExerciseIntroductionComponent]
    });
    fixture = TestBed.createComponent(ExerciseIntroductionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
