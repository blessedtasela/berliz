import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Actions } from '@ngrx/effects';
import { Subject } from 'rxjs';

import { ExercisesSectionComponent } from './exercises-section.component';
import { LoadErrorComponent } from 'src/app/shared/load-error/load-error.component';
import { loadActiveExercises, loadActiveExercisesFailure, loadActiveExercisesSuccess } from 'src/app/state/exercise/exercise.actions';

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

    fixture = TestBed.createComponent(ExercisesSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const el = () => fixture.nativeElement as HTMLElement;

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows a skeleton until the first load finishes, not "coming soon"', () => {
    expect(el().querySelector('app-list-skeleton')).not.toBeNull();
    expect(el().textContent).not.toContain('Exercises coming soon');
  });

  it('says "coming soon" only once a load has actually come back empty', () => {
    actions$.next(loadActiveExercisesSuccess({ response: [] } as any));
    fixture.detectChanges();

    expect(el().querySelector('app-list-skeleton')).toBeNull();
    expect(el().textContent).toContain('Exercises coming soon');
    expect(el().querySelector('app-load-error')).toBeNull();
  });

  describe('when the exercises cannot be loaded', () => {
    it('shows a retryable error instead of "coming soon"', () => {
      actions$.next(loadActiveExercisesFailure({ error: 'Server exploded' }));
      fixture.detectChanges();

      expect(el().textContent).toContain("Couldn't load exercises");
      expect(el().textContent).toContain('Server exploded');
      expect(el().textContent).not.toContain('Exercises coming soon');
      expect(el().querySelector('app-list-skeleton')).toBeNull();
    });

    it('retrying loads them again, and a success clears the error', () => {
      actions$.next(loadActiveExercisesFailure({ error: 'Server exploded' }));
      fixture.detectChanges();
      const dispatch = spyOn(TestBed.inject(MockStore), 'dispatch');

      (el().querySelector('app-load-error button') as HTMLButtonElement).click();
      expect(dispatch).toHaveBeenCalledWith(loadActiveExercises());

      actions$.next(loadActiveExercisesSuccess({ response: [] } as any));
      fixture.detectChanges();
      expect(el().querySelector('app-load-error')).toBeNull();
    });
  });
});
