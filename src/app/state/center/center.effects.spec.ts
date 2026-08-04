import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { CenterEffects } from './center.effects';

describe('CenterEffects', () => {
  let actions$: Observable<any>;
  let effects: CenterEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CenterEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.inject(CenterEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
