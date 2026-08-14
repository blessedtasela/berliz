import { NgZone, ChangeDetectorRef } from '@angular/core';
import { TimeAgoPipe } from './time-ago.pipe';

describe('TimeAgoPipe', () => {
  it('create an instance', () => {
    const cdRef = { markForCheck: () => {} } as ChangeDetectorRef;
    const ngZone = {
      runOutsideAngular: (fn: () => void) => fn(),
      run: (fn: () => void) => fn()
    } as NgZone;

    const pipe = new TimeAgoPipe(cdRef, ngZone);
    expect(pipe).toBeTruthy();
    pipe.ngOnDestroy();
  });
});
