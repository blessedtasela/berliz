import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, Subject } from 'rxjs';

import { TrainerEffects } from './trainer.effects';
import { TrainerService } from '../../services/trainer.service';
import * as A from './trainer.actions';

describe('TrainerEffects', () => {
  let actions$: Observable<any>;
  let effects: TrainerEffects;
  let trainerService: jasmine.SpyObj<TrainerService>;

  beforeEach(() => {
    trainerService = jasmine.createSpyObj('TrainerService', [
      'getTrainer',
      'getMyTrainerFeatureVideos',
    ]);

    TestBed.configureTestingModule({
      providers: [
        TrainerEffects,
        provideMockActions(() => actions$),
        { provide: TrainerService, useValue: trainerService }
      ]
    });

    effects = TestBed.inject(TrainerEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  // Regression coverage for the same duplicate-request anti-pattern behind the
  // reported GET /center/getCenter loop: MyTrainerMainComponent dispatches
  // loadMyTrainer()/loadMyTrainerFeatureVideos()/etc. again on every one of ~9
  // websocket topic events without any guard. These effects used mergeMap,
  // which starts a brand-new HTTP call per dispatch with no regard for one
  // already in flight -- exhaustMap collapses that into a single request.
  describe('loadMyTrainer$ (exhaustMap de-duplication)', () => {
    it('does not start a second HTTP call while the first loadMyTrainer() is still in flight', () => {
      const actionsSubject = new Subject<any>();
      actions$ = actionsSubject.asObservable();
      effects = TestBed.inject(TrainerEffects);

      const response$ = new Subject<any>();
      trainerService.getTrainer.and.returnValue(response$.asObservable());

      const emitted: any[] = [];
      effects.loadMyTrainer$.subscribe(action => emitted.push(action));

      actionsSubject.next(A.loadMyTrainer());
      actionsSubject.next(A.loadMyTrainer());
      actionsSubject.next(A.loadMyTrainer());

      expect(trainerService.getTrainer).toHaveBeenCalledTimes(1);

      response$.next({ data: { id: 1 } } as any);
      response$.complete();

      expect(emitted.length).toBe(1);

      const response2$ = new Subject<any>();
      trainerService.getTrainer.and.returnValue(response2$.asObservable());
      actionsSubject.next(A.loadMyTrainer());

      expect(trainerService.getTrainer).toHaveBeenCalledTimes(2);
    });
  });

  describe('loadMyTrainerFeatureVideos$ (exhaustMap de-duplication)', () => {
    it('does not start a second HTTP call while the first request is still in flight', () => {
      const actionsSubject = new Subject<any>();
      actions$ = actionsSubject.asObservable();
      effects = TestBed.inject(TrainerEffects);

      const response$ = new Subject<any>();
      trainerService.getMyTrainerFeatureVideos.and.returnValue(response$.asObservable());

      const emitted: any[] = [];
      effects.loadMyTrainerFeatureVideos$.subscribe(action => emitted.push(action));

      actionsSubject.next(A.loadMyTrainerFeatureVideos());
      actionsSubject.next(A.loadMyTrainerFeatureVideos());

      expect(trainerService.getMyTrainerFeatureVideos).toHaveBeenCalledTimes(1);

      response$.next({ data: [] } as any);
      response$.complete();

      expect(emitted).toEqual([A.loadMyTrainerFeatureVideosSuccess({ response: { data: [] } as any })]);
    });
  });
});
