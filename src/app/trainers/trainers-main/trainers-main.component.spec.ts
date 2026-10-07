import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Actions } from '@ngrx/effects';
import { Subject } from 'rxjs';

import { TrainersMainComponent } from './trainers-main.component';
import { loadActiveTrainers, loadActiveTrainersFailure, loadActiveTrainersSuccess } from 'src/app/state/trainer/trainer.actions';
import { LoadErrorComponent } from 'src/app/shared/load-error/load-error.component';

describe('TrainersMainComponent', () => {
  let component: TrainersMainComponent;
  let fixture: ComponentFixture<TrainersMainComponent>;
  let actions$: Subject<any>;

  beforeEach(() => {
    actions$ = new Subject<any>();
    TestBed.configureTestingModule({
      declarations: [TrainersMainComponent],
      imports: [LoadErrorComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore(),
        { provide: Actions, useValue: actions$ }
      ]
    });
    fixture = TestBed.createComponent(TrainersMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when the trainers cannot be loaded', () => {
    const el = () => fixture.nativeElement as HTMLElement;

    it('shows a retryable error instead of an empty results list', () => {
      actions$.next(loadActiveTrainersFailure({ error: 'Server exploded' }));
      fixture.detectChanges();

      expect(el().textContent).toContain("Couldn't load trainers");
      expect(el().textContent).toContain('Server exploded');
      expect(el().querySelector('app-trainers-search-result')).toBeNull();
    });

    it('retrying loads them again, and a success brings the results back', () => {
      actions$.next(loadActiveTrainersFailure({ error: 'Server exploded' }));
      fixture.detectChanges();
      const dispatch = spyOn(TestBed.inject(MockStore), 'dispatch');

      (el().querySelector('app-load-error button') as HTMLButtonElement).click();
      expect(dispatch).toHaveBeenCalledWith(loadActiveTrainers());

      actions$.next(loadActiveTrainersSuccess({ response: [] } as any));
      fixture.detectChanges();
      expect(el().querySelector('app-load-error')).toBeNull();
      expect(el().querySelector('app-trainers-search-result')).not.toBeNull();
    });
  });
});
