import { Actions } from '@ngrx/effects';
import { createAction, props } from '@ngrx/store';
import { Subject } from 'rxjs';

import { watchLoadError } from './load-error-tracker';
import { genericError } from 'src/validators/form-validators.module';

describe('watchLoadError', () => {
  const load = createAction('[Test] Load');
  const success = createAction('[Test] Load Success');
  const failure = createAction('[Test] Load Failure', props<{ error: string }>());
  const otherFailure = createAction('[Test] Save Failure', props<{ error: string }>());

  let actions$: Subject<any>;
  let destroy$: Subject<void>;
  let seen: (string | null)[];

  beforeEach(() => {
    actions$ = new Subject<any>();
    destroy$ = new Subject<void>();
    seen = [];
    watchLoadError(new Actions(actions$), failure, [load, success], destroy$, m => seen.push(m));
  });

  it('reports the failure message', () => {
    actions$.next(failure({ error: 'Server exploded' }));
    expect(seen).toEqual(['Server exploded']);
  });

  it('falls back to the generic message when the failure has none', () => {
    actions$.next(failure({ error: '' }));
    expect(seen).toEqual([genericError]);
  });

  it('clears when a new load starts or one succeeds', () => {
    actions$.next(failure({ error: 'x' }));
    actions$.next(load());
    actions$.next(failure({ error: 'y' }));
    actions$.next(success());
    expect(seen).toEqual(['x', null, 'y', null]);
  });

  it('ignores a failure of some other action, such as a failed save', () => {
    actions$.next(otherFailure({ error: 'save failed' }));
    expect(seen).toEqual([]);
  });

  it('stops listening once the page is destroyed', () => {
    destroy$.next();
    actions$.next(failure({ error: 'late' }));
    expect(seen).toEqual([]);
  });

  it("can be torn down by unsubscribing when the page has no destroy$ signal", () => {
    const seen2: (string | null)[] = [];
    const sub = watchLoadError(new Actions(actions$), failure, [load], null, m => seen2.push(m));
    actions$.next(failure({ error: "a" }));
    sub.unsubscribe();
    actions$.next(failure({ error: "b" }));
    expect(seen2).toEqual(["a"]);
  });
});
