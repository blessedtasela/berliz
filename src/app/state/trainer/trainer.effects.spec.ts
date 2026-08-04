import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { TrainerEffects } from './trainer.effects';

describe('TrainerEffects', () => {
  let actions$: Observable<any>;
  let effects: TrainerEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TrainerEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.inject(TrainerEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
