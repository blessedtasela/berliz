import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Actions } from '@ngrx/effects';
import { Subject } from 'rxjs';

import { injectActionsOrNull, watchFirstLoad } from './first-load';

describe('watchFirstLoad', () => {
  const ok = { type: '[Thing] Load Success' };
  const fail = { type: '[Thing] Load Failure' };
  const done = ['[Thing] Load Success', '[Thing] Load Failure'];
  let stream: Subject<any>;
  let actions$: Actions;

  beforeEach(() => {
    stream = new Subject();
    actions$ = new Actions(stream);
  });

  it('fires once, on the first success or failure, in the browser', () => {
    let calls = 0;
    watchFirstLoad(actions$, TestBed.inject(PLATFORM_ID) as object, done, () => calls++);
    stream.next({ type: '[Other] Something' });
    expect(calls).toBe(0);
    stream.next(fail);
    stream.next(ok);
    expect(calls).toBe(1);
  });

  it('never fires on the server, so a prerendered page keeps its skeleton', () => {
    let calls = 0;
    watchFirstLoad(actions$, 'server' as unknown as object, done, () => calls++);
    stream.next(ok);
    expect(calls).toBe(0);
  });
});

describe('injectActionsOrNull', () => {
  it('returns null (instead of throwing) when the app does not provide NgRx Actions', () => {
    TestBed.configureTestingModule({});
    expect(TestBed.runInInjectionContext(() => injectActionsOrNull())).toBeNull();
  });

  it('returns Actions when it is provided', () => {
    TestBed.configureTestingModule({ providers: [{ provide: Actions, useValue: new Actions(new Subject()) }] });
    expect(TestBed.runInInjectionContext(() => injectActionsOrNull())).toBeTruthy();
  });
});
