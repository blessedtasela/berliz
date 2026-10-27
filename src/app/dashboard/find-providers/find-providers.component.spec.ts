import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Actions } from '@ngrx/effects';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Subject } from 'rxjs';

import { selectActiveCategories } from 'src/app/state/category/category.selectors';
import { selectActiveCenters } from 'src/app/state/center/center.selectors';
import { loadActiveCentersSuccess } from 'src/app/state/center/center.actions';
import { loadActiveTrainersFailure, loadActiveTrainersSuccess } from 'src/app/state/trainer/trainer.actions';
import { selectActiveTrainers } from 'src/app/state/trainer/trainer.selector';
import { FindProvidersComponent } from './find-providers.component';

describe('FindProvidersComponent first load', () => {
  let fixture: ComponentFixture<FindProvidersComponent>;
  let actions$: Subject<any>;
  let store: MockStore;

  beforeEach(() => {
    actions$ = new Subject();
    TestBed.configureTestingModule({
      declarations: [FindProvidersComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore({
          selectors: [
            { selector: selectActiveTrainers, value: [] },
            { selector: selectActiveCenters, value: [] },
            { selector: selectActiveCategories, value: [] },
          ],
        }),
        { provide: Actions, useValue: actions$ },
      ],
    });
    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(FindProvidersComponent);
    fixture.detectChanges();
  });

  afterEach(() => store.resetSelectors());

  const text = () => fixture.nativeElement.textContent as string;

  it('shows no "none available yet" text while the trainers are still loading', () => {
    expect(fixture.componentInstance.trainersLoaded).toBeFalse();
    expect(text()).not.toContain('No trainers available yet');
    expect(fixture.nativeElement.querySelector('app-provider-filter-bar')).toBeNull();
  });

  it('says so only once the first load has answered with nothing', () => {
    actions$.next(loadActiveTrainersSuccess({ response: { data: [] } as any }));
    fixture.detectChanges();
    expect(text()).toContain('No trainers available yet');
  });

  it('also ends the wait when the load fails, instead of spinning forever', () => {
    actions$.next(loadActiveTrainersFailure({ error: 'down' }));
    fixture.detectChanges();
    expect(fixture.componentInstance.trainersLoaded).toBeTrue();
  });

  it('tracks centers separately from trainers', () => {
    actions$.next(loadActiveCentersSuccess({ response: { data: [] } as any }));
    expect(fixture.componentInstance.centersLoaded).toBeTrue();
    expect(fixture.componentInstance.trainersLoaded).toBeFalse();
  });
});
