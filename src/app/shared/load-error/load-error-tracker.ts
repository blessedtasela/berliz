import { Actions, ofType } from '@ngrx/effects';
import { ActionCreator } from '@ngrx/store';
import { MonoTypeOperatorFunction, Observable, Subscription, takeUntil } from 'rxjs';

import { genericError } from 'src/validators/form-validators.module';

/**
 * Tells a page why its main list failed to load, so it can show {@link LoadErrorComponent} instead of looking
 * empty. Driven by the slice's own load-failure action rather than its shared `error` field, because that one field
 * is also set by failed *writes* (a failed save must not make the page claim it "couldn't load" and hide what the
 * user is editing).
 *
 * @param failure   the load's `...Failure` action (its `error` prop becomes the message)
 * @param clears    actions that mean "a load is starting or succeeded" -- the message is cleared on any of them
 * @param teardown  either the page's destroy$ signal, or null if the caller will unsubscribe the returned Subscription
 * @param set       receives the message, or null once it no longer applies
 */
export function watchLoadError(
  actions$: Actions,
  failure: ActionCreator,
  clears: ActionCreator[],
  teardown: Observable<unknown> | null,
  set: (message: string | null) => void,
): Subscription {
  const until: MonoTypeOperatorFunction<any> = teardown ? takeUntil(teardown) : (source => source);
  const sub = actions$.pipe(ofType(failure), until)
    .subscribe((action: any) => set((typeof action?.error === 'string' && action.error) || genericError));
  sub.add(actions$.pipe(ofType(...(clears as [ActionCreator])), until).subscribe(() => set(null)));
  return sub;
}
