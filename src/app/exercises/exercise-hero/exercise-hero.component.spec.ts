import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExerciseHeroComponent } from './exercise-hero.component';

describe('ExerciseHeroComponent', () => {
  let component: ExerciseHeroComponent;
  let fixture: ComponentFixture<ExerciseHeroComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExerciseHeroComponent]
    });
    fixture = TestBed.createComponent(ExerciseHeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
