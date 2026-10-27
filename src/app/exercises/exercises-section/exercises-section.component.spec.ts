import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Actions } from '@ngrx/effects';
import { Subject } from 'rxjs';

import { ExercisesSectionComponent } from './exercises-section.component';
import { LoadErrorComponent } from 'src/app/shared/load-error/load-error.component';
import { loadPublicExercises, loadPublicExercisesFailure, loadPublicExercisesSuccess } from 'src/app/state/exercise/exercise.actions';
import { selectPublicExercises } from 'src/app/state/exercise/exercise.selectors';
import { exerciseDemoUrl } from 'src/app/utils/exercise-demo';

describe('ExercisesSectionComponent', () => {
  let component: ExercisesSectionComponent;
  let fixture: ComponentFixture<ExercisesSectionComponent>;
  let actions$: Subject<any>;

  beforeEach(() => {
    actions$ = new Subject<any>();
    TestBed.configureTestingModule({
      declarations: [ExercisesSectionComponent],
      imports: [LoadErrorComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore(),
        { provide: Actions, useValue: actions$ },
      ]
    });

    // The mock store has no state, so give the component's list subscription a value to read from the start.
    TestBed.inject(MockStore).overrideSelector(selectPublicExercises, []);
    fixture = TestBed.createComponent(ExercisesSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // overrideSelector patches the shared selector instance; reset it so it can't leak into later specs.
  afterEach(() => TestBed.inject(MockStore).resetSelectors());

  const el = () => fixture.nativeElement as HTMLElement;

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows a skeleton until the first load finishes, not "coming soon"', () => {
    expect(el().querySelector('app-list-skeleton')).not.toBeNull();
    expect(el().textContent).not.toContain('Exercises coming soon');
  });

  it('says "coming soon" only once a load has actually come back empty', () => {
    actions$.next(loadPublicExercisesSuccess({ response: [] } as any));
    fixture.detectChanges();

    expect(el().querySelector('app-list-skeleton')).toBeNull();
    expect(el().textContent).toContain('Exercises coming soon');
    expect(el().querySelector('app-load-error')).toBeNull();
  });

  describe('when the exercises cannot be loaded', () => {
    it('shows a retryable error instead of "coming soon"', () => {
      actions$.next(loadPublicExercisesFailure({ error: 'Server exploded' }));
      fixture.detectChanges();

      expect(el().textContent).toContain("Couldn't load exercises");
      expect(el().textContent).toContain('Server exploded');
      expect(el().textContent).not.toContain('Exercises coming soon');
      expect(el().querySelector('app-list-skeleton')).toBeNull();
    });

    it('retrying loads them again, and a success clears the error', () => {
      actions$.next(loadPublicExercisesFailure({ error: 'Server exploded' }));
      fixture.detectChanges();
      const dispatch = spyOn(TestBed.inject(MockStore), 'dispatch');

      (el().querySelector('app-load-error button') as HTMLButtonElement).click();
      expect(dispatch).toHaveBeenCalledWith(loadPublicExercises());

      actions$.next(loadPublicExercisesSuccess({ response: [] } as any));
      fixture.detectChanges();
      expect(el().querySelector('app-load-error')).toBeNull();
    });
  });

  describe('the exercise cards', () => {
    const exercise = (id: number, name: string, hasDemo: boolean) => ({
      id, name, description: null, benefit: null, howToPerform: null, difficultyLevel: 'BEGINNER', likes: 0,
      hasDemo, demoVersion: 1700000000000, muscleGroups: [{ id: 1, name: 'Quads' }], categories: [{ id: 2, name: 'Powerlifting' }], date: new Date(),
    });

    beforeEach(() => {
      TestBed.inject(MockStore).overrideSelector(selectPublicExercises, [exercise(1, 'Squat', true), exercise(2, 'Plank', false)] as any);
      TestBed.inject(MockStore).refreshState();
      actions$.next(loadPublicExercisesSuccess({ data: [] }));
      fixture.detectChanges();
    });

    it('lists the exercises from the public slice', () => {
      expect(el().textContent).toContain('Squat');
      expect(el().textContent).toContain('Plank');
      expect(el().textContent).toContain('Quads');
    });

    it('shows a demo as an image from its own URL, not as a video', () => {
      const imgs = Array.from(el().querySelectorAll('img'));

      expect(imgs.length).toBe(1);
      expect(imgs[0].getAttribute('src')).toBe(exerciseDemoUrl({ id: 1, demoVersion: 1700000000000 }));
      expect(imgs[0].getAttribute('loading')).toBe('lazy');
      expect(el().querySelector('video')).toBeNull();
    });
  });
});
