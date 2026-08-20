import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, Subject } from 'rxjs';

import { CenterEffects } from './center.effects';
import { CenterService } from '../../services/center.service';
import * as A from './center.actions';

describe('CenterEffects', () => {
  let actions$: Observable<any>;
  let effects: CenterEffects;
  let centerService: jasmine.SpyObj<CenterService>;

  beforeEach(() => {
    centerService = jasmine.createSpyObj('CenterService', ['getCenter']);

    TestBed.configureTestingModule({
      providers: [
        CenterEffects,
        provideMockActions(() => actions$),
        { provide: CenterService, useValue: centerService }
      ]
    });

    effects = TestBed.inject(CenterEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  // Regression test for the reported bug: GET /center/getCenter firing multiple
  // times for what should be a single load. The root cause was PartnerComponent
  // dispatching loadCenter() again on every one of ~17 websocket topic events
  // without any guard, while this effect used mergeMap -- which happily starts
  // a brand-new HTTP call for every dispatch, with no regard for one already
  // being in flight. Switching to exhaustMap means concurrent/duplicate
  // dispatches of loadCenter() (or refreshCenters()) while a request is still
  // outstanding are ignored instead of each firing their own GET.
  describe('loadCenter$ (exhaustMap de-duplication)', () => {
    it('does not start a second HTTP call while the first loadCenter() is still in flight', () => {
      const actionsSubject = new Subject<any>();
      actions$ = actionsSubject.asObservable();
      effects = TestBed.inject(CenterEffects);

      const response$ = new Subject<any>();
      centerService.getCenter.and.returnValue(response$.asObservable());

      const emitted: any[] = [];
      effects.loadCenter$.subscribe(action => emitted.push(action));

      // Simulate the duplicate-dispatch loop: several loadCenter() actions
      // fired back to back before the first HTTP response has come back.
      actionsSubject.next(A.loadCenter());
      actionsSubject.next(A.loadCenter());
      actionsSubject.next(A.loadCenter());

      expect(centerService.getCenter).toHaveBeenCalledTimes(1);

      // Resolve the in-flight request.
      response$.next({ data: { id: 1 } } as any);
      response$.complete();

      expect(emitted.length).toBe(1);
      expect(emitted[0]).toEqual(A.loadCenterSuccess({ response: { data: { id: 1 } } as any }));

      // Once the previous request has completed, a fresh dispatch is allowed
      // to trigger a new call again.
      const response2$ = new Subject<any>();
      centerService.getCenter.and.returnValue(response2$.asObservable());
      actionsSubject.next(A.loadCenter());

      expect(centerService.getCenter).toHaveBeenCalledTimes(2);
    });

    it('maps a failed getCenter() call to loadCenterFailure without throwing', () => {
      const actionsSubject = new Subject<any>();
      actions$ = actionsSubject.asObservable();
      effects = TestBed.inject(CenterEffects);

      centerService.getCenter.and.returnValue(
        new Observable(subscriber => subscriber.error({ error: { message: 'boom' } }))
      );

      const emitted: any[] = [];
      effects.loadCenter$.subscribe(action => emitted.push(action));

      actionsSubject.next(A.loadCenter());

      expect(emitted).toEqual([A.loadCenterFailure({ error: 'boom' })]);
    });
  });
});
