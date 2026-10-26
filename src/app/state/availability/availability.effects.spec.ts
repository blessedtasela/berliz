import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, Subject, of } from 'rxjs';

import { AvailabilityEffects } from './availability.effects';
import * as A from './availability.actions';
import { AvailabilityService } from 'src/app/services/availability.service';

/** Picking a different day must drop the previous day's still-in-flight answer, or its times land on the new day. */
describe('AvailabilityEffects loadAvailableSlots', () => {
  let actions$: Subject<any>;
  let service: jasmine.SpyObj<AvailabilityService>;
  let effects: AvailabilityEffects;

  const response = (date: string) => ({ trainerId: 1, centerId: null, date, slotDurationMinutes: 60, leadTimeMinutes: 60, availabilityConfigured: true, slots: [] }) as any;

  beforeEach(() => {
    actions$ = new Subject<any>();
    service = jasmine.createSpyObj('AvailabilityService', ['getAvailableSlots']);
    TestBed.configureTestingModule({
      providers: [
        AvailabilityEffects,
        provideMockActions(() => actions$ as Observable<any>),
        { provide: AvailabilityService, useValue: service },
      ],
    });
    effects = TestBed.inject(AvailabilityEffects);
  });

  it('turns an answer into a success action', () => {
    service.getAvailableSlots.and.returnValue(of(response('2026-10-24')));
    const out: any[] = [];
    effects.loadAvailableSlots$.subscribe(a => out.push(a));
    actions$.next(A.loadAvailableSlots({ trainerId: 1, centerId: undefined, date: '2026-10-24' }));
    expect(out.length).toBe(1);
    expect(out[0].type).toBe(A.loadAvailableSlotsSuccess.type);
  });

  it('ignores a slower answer for the earlier day once a later day was asked for', () => {
    const saturday = new Subject<any>();
    const monday = new Subject<any>();
    service.getAvailableSlots.and.callFake((_t: any, _c: any, date: string) => (date === '2026-10-24' ? saturday : monday).asObservable());
    const out: any[] = [];
    effects.loadAvailableSlots$.subscribe(a => out.push(a));

    actions$.next(A.loadAvailableSlots({ trainerId: 1, centerId: undefined, date: '2026-10-24' }));
    actions$.next(A.loadAvailableSlots({ trainerId: 1, centerId: undefined, date: '2026-10-26' }));
    monday.next(response('2026-10-26')); // the newer day answers first...
    saturday.next(response('2026-10-24')); // ...and the older, slower answer must not follow it

    expect(out.length).toBe(1);
    expect(out[0].response.date).toBe('2026-10-26');
  });
});
