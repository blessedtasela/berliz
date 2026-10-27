import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Actions } from '@ngrx/effects';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Subject } from 'rxjs';

import { selectActiveCategories } from 'src/app/state/category/category.selectors';
import { selectCenterEquipment, selectMyCenterEquipment } from 'src/app/state/center/center.selectors';
import { loadPublicExercises, loadPublicExercisesFailure, loadPublicExercisesSuccess } from 'src/app/state/exercise/exercise.actions';
import { selectPublicExercises } from 'src/app/state/exercise/exercise.selectors';
import { selectActiveMuscleGroups } from 'src/app/state/muscle-group/muscle-group.selectors';
import { selectUser } from 'src/app/state/user/user.selector';
import { DashboardExercisesComponent } from './dashboard-exercises.component';

describe('DashboardExercisesComponent first load', () => {
  let fixture: ComponentFixture<DashboardExercisesComponent>;
  let actions$: Subject<any>;
  let store: MockStore;

  beforeEach(() => {
    actions$ = new Subject();
    TestBed.configureTestingModule({
      declarations: [DashboardExercisesComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore({
          selectors: [
            { selector: selectPublicExercises, value: [] },
            { selector: selectActiveCategories, value: [] },
            { selector: selectActiveMuscleGroups, value: [] },
            { selector: selectCenterEquipment, value: [] },
            { selector: selectMyCenterEquipment, value: [] },
            { selector: selectUser, value: { role: 'user' } },
          ],
        }),
        { provide: Actions, useValue: actions$ },
        { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open']) },
      ],
    });
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch').and.callThrough();
    fixture = TestBed.createComponent(DashboardExercisesComponent);
    fixture.detectChanges();
  });

  afterEach(() => store.resetSelectors());

  const text = () => fixture.nativeElement.textContent as string;

  it('loads the slim list (text and tags), not every exercise with its demo bytes', () => {
    expect(store.dispatch).toHaveBeenCalledWith(loadPublicExercises());
  });

  it('shows no "No exercises yet" while the library is still loading', () => {
    expect(text()).not.toContain('No exercises yet');
  });

  it('says so only after the list answered with nothing', () => {
    actions$.next(loadPublicExercisesSuccess({ data: [] }));
    fixture.detectChanges();
    expect(text()).toContain('No exercises yet');
  });

  it('shows a retryable error instead of an empty library when the load fails', () => {
    actions$.next(loadPublicExercisesFailure({ error: 'Server error' }));
    fixture.detectChanges();
    expect(fixture.componentInstance.loadError).toBe('Server error');
    expect(text()).not.toContain('No exercises yet');

    (store.dispatch as jasmine.Spy).calls.reset();
    fixture.componentInstance.retryExercises();
    expect(store.dispatch).toHaveBeenCalledWith(loadPublicExercises());
  });
});
