import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { CategoryExercisesComponent } from './category-exercises.component';

describe('CategoryExercisesComponent', () => {
  let component: CategoryExercisesComponent;
  let fixture: ComponentFixture<CategoryExercisesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CategoryExercisesComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: []
    });

    fixture = TestBed.createComponent(CategoryExercisesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('shows a demo as a lazy image from its own URL, and nothing for an exercise without one', () => {
    const exercise = (id: number, name: string, hasDemo: boolean) => ({
      id, name, description: null, benefit: null, howToPerform: null, difficultyLevel: null, likes: 0,
      hasDemo, demoVersion: 42, muscleGroups: [], categories: [], date: new Date(),
    });
    component.exercises = [exercise(1, 'Squat', true), exercise(2, 'Plank', false)];
    fixture.detectChanges();

    const imgs = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('img'));
    expect(imgs.length).toBe(1);
    expect(imgs[0].getAttribute('src')).toContain('/exercise/demo/1?v=42');
    expect(imgs[0].getAttribute('loading')).toBe('lazy');
    expect((fixture.nativeElement as HTMLElement).querySelector('video')).toBeNull();
  });
});
