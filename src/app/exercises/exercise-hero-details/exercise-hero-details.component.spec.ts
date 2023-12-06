import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExerciseHeroDetailsComponent } from './exercise-hero-details.component';

describe('ExerciseHeroDetailsComponent', () => {
  let component: ExerciseHeroDetailsComponent;
  let fixture: ComponentFixture<ExerciseHeroDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExerciseHeroDetailsComponent]
    });
    fixture = TestBed.createComponent(ExerciseHeroDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
