import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExerciseMuscleGroupsComponent } from './exercise-muscle-groups.component';

describe('ExerciseMuscleGroupsComponent', () => {
  let component: ExerciseMuscleGroupsComponent;
  let fixture: ComponentFixture<ExerciseMuscleGroupsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExerciseMuscleGroupsComponent]
    });
    fixture = TestBed.createComponent(ExerciseMuscleGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
