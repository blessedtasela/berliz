import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { of, throwError } from 'rxjs';

import { BookingPlanPageComponent } from './booking-plan-page.component';
import { AuthRedirectService } from 'src/app/services/auth-redirect.service';
import { BookingService } from 'src/app/services/booking.service';
import { CenterService } from 'src/app/services/center.service';
import { PromotionService } from 'src/app/services/promotion.service';
import { SeoService } from 'src/app/services/seo.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TrainerService } from 'src/app/services/trainer.service';
import { selectUser } from 'src/app/state/user/user.selector';
import { BookingPlanPreview } from 'src/app/models/booking.model';
import { weekdayOf } from 'src/app/utils/plan-schedule.util';

describe('BookingPlanPageComponent', () => {
  let fixture: ComponentFixture<BookingPlanPageComponent>;
  let component: BookingPlanPageComponent;
  let store: MockStore;
  let bookingService: jasmine.SpyObj<BookingService>;
  let authRedirect: jasmine.SpyObj<AuthRedirectService>;
  let router: Router;

  const okPreview = (over: Partial<BookingPlanPreview> = {}): BookingPlanPreview => ({
    sessions: [], sessionCount: 0, allAvailable: true, priced: true, subtotal: 300, discount: 0, total: 300, perSession: 100,
    promotionLabel: null, message: '', ...over,
  });

  /** A preview that mirrors whatever sessions were sent, marking the given dates unavailable. */
  const previewFor = (unavailable: string[] = []) => (request: any) => {
    const items = request.sessions.map((s: any) => ({
      localDate: s.localDate, localTime: s.localTime, durationMinutes: s.durationMinutes,
      available: !unavailable.includes(s.localDate),
      reason: unavailable.includes(s.localDate) ? 'Outside availability.' : null, price: 100,
    }));
    return of({ success: true, statusCode: 200, message: '', data: okPreview({
      sessions: items, sessionCount: items.length, allAvailable: items.every((i: any) => i.available),
      subtotal: items.length * 100, total: items.length * 100,
    }) });
  };

  beforeEach(() => {
    bookingService = jasmine.createSpyObj('BookingService', ['previewPlan', 'createPlan']);
    bookingService.previewPlan.and.callFake(previewFor() as any);
    authRedirect = jasmine.createSpyObj('AuthRedirectService', ['goToLogin']);

    const trainerService = jasmine.createSpyObj('TrainerService', ['getActiveTrainers']);
    trainerService.getActiveTrainers.and.returnValue(of({ data: [{ id: 1, name: 'Coach Sam', photoResponse: null }] }));
    const promotionService = jasmine.createSpyObj('PromotionService', ['getPublicForTrainer', 'getPublicForCenter']);
    promotionService.getPublicForTrainer.and.returnValue(of({ data: [
      { id: 5, title: 'Welcome', type: 'percentage', value: 10, live: true },
      { id: 6, title: 'Custom thing', type: 'custom', value: null, live: true },
    ] }));

    TestBed.configureTestingModule({
      imports: [BookingPlanPageComponent],
      providers: [
        provideRouter([]),
        provideMockStore(),
        { provide: BookingService, useValue: bookingService },
        { provide: TrainerService, useValue: trainerService },
        { provide: CenterService, useValue: jasmine.createSpyObj('CenterService', ['getActiveCenters']) },
        { provide: PromotionService, useValue: promotionService },
        { provide: AuthRedirectService, useValue: authRedirect },
        { provide: SnackBarService, useValue: jasmine.createSpyObj('SnackBarService', ['openSnackBar']) },
        { provide: SeoService, useValue: jasmine.createSpyObj('SeoService', ['updatePageData']) },
        { provide: ActivatedRoute, useValue: { snapshot: { data: { kind: 'trainer' } }, paramMap: of(convertToParamMap({ name: 'Coach-Sam' })) } },
      ],
    });
    store = TestBed.inject(MockStore);
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
  });

  afterEach(() => store.resetSelectors());

  function create(signedIn: boolean): void {
    store.overrideSelector(selectUser, signedIn ? { id: 1, email: 'sam@example.com' } as any : null);
    fixture = TestBed.createComponent(BookingPlanPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('finds the provider and starts from Mon / Wed / Fri at 6 PM', fakeAsync(() => {
    create(true);
    tick(400);

    expect(component.providerName).toBe('Coach Sam');
    expect(component.sessions.length).toBeGreaterThan(8);
    expect(component.sessions.every(s => [1, 3, 5].includes(weekdayOf(s.date)) && s.time === '18:00')).toBeTrue();
  }));

  // Regression: these used to be getters that built a new array on every change-detection pass, so *ngFor rebuilt
  // its DOM constantly (the same pattern behind the dashboard freeze after login).
  it('hands the template the same lists until something changes', fakeAsync(() => {
    create(true);
    tick(400);

    expect(component.sessions).toBe(component.sessions);
    expect(component.weeks).toBe(component.weeks);
    expect(component.calendarCells).toBe(component.calendarCells);

    const before = component.sessions;
    component.toggleWeekday(2);
    expect(component.sessions).not.toBe(before);
    expect(component.sessions.some(s => weekdayOf(s.date) === 2)).toBeTrue();
  }));

  it('only offers offers that come off a whole plan', fakeAsync(() => {
    create(true);
    tick(400);

    expect(component.offerChoices.map(o => o.id)).toEqual([5]);
  }));

  it('checks the schedule with the server once the user stops changing it', fakeAsync(() => {
    create(true);
    tick(400);
    bookingService.previewPlan.calls.reset();

    component.toggleWeekday(2);
    component.toggleWeekday(4);
    tick(100);
    expect(bookingService.previewPlan).not.toHaveBeenCalled();
    tick(400);

    expect(bookingService.previewPlan).toHaveBeenCalledTimes(1);
    const request: any = bookingService.previewPlan.calls.mostRecent().args[0];
    expect(request.trainerId).toBe(1);
    expect(request.sessions[0].localTime).toBe('18:00');
  }));

  it('cannot be sent while a session is unavailable, and can once it is removed', fakeAsync(() => {
    create(true);
    tick(400);
    const victim = component.sessions[1].date;
    bookingService.previewPlan.and.callFake(previewFor([victim]) as any);
    component.changed();
    tick(400);

    expect(component.unavailableCount).toBe(1);
    expect(component.canSubmit).toBeFalse();

    component.removeUnavailable();
    tick(400);

    expect(component.sessions.some(s => s.date === victim)).toBeFalse();
    expect(component.unavailableCount).toBe(0);
    expect(component.canSubmit).toBeTrue();
  }));

  it('sends every remaining session with the chosen offer and goes to My Bookings', fakeAsync(() => {
    create(true);
    tick(400);
    component.promotionId = 5;
    component.notes = ' Bad knee ';
    component.changed();
    tick(400);
    bookingService.createPlan.and.returnValue(of({ success: true, statusCode: 200, message: '', data: { id: 9, message: 'Sent.' } } as any));

    component.send();

    const request: any = bookingService.createPlan.calls.mostRecent().args[0];
    expect(request.sessions.length).toBe(component.sessions.length);
    expect(request.promotionId).toBe(5);
    expect(request.notes).toBe('Bad knee');
    expect(request.trainerId).toBe(1);
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/my-bookings']);
  }));

  it('shows the server\'s reason when sending fails and re-checks the times', fakeAsync(() => {
    create(true);
    tick(400);
    bookingService.createPlan.and.returnValue(throwError(() => ({ error: { message: '2026-11-04 18:00: That time slot is no longer available.' } })));
    bookingService.previewPlan.calls.reset();

    component.send();
    tick(400);

    expect(component.submitError).toContain('no longer available');
    expect(component.submitting).toBeFalse();
    expect(bookingService.previewPlan).toHaveBeenCalled();
  }));

  it('sends a guest to sign in instead of creating the plan, keeping what they built', fakeAsync(() => {
    create(false);
    tick(400);

    component.send();

    expect(authRedirect.goToLogin).toHaveBeenCalled();
    expect(bookingService.createPlan).not.toHaveBeenCalled();
    expect(bookingService.previewPlan).not.toHaveBeenCalled();
    expect(sessionStorage.getItem('berliz.planDraft.trainer.1')).not.toBeNull();
    sessionStorage.removeItem('berliz.planDraft.trainer.1');
  }));

  it('needs at least two sessions', fakeAsync(() => {
    create(true);
    tick(400);
    component.weekdays = [];
    component.changed();
    tick(400);

    expect(component.sessions.length).toBe(0);
    expect(component.canSubmit).toBeFalse();
  }));

  it('builds a rotation and picked dates through the same list', fakeAsync(() => {
    create(true);
    tick(400);

    component.choosePattern('rotation');
    component.applyRotationPreset([{ on: 2, off: 1 }]);
    expect(component.sessions.length).toBeGreaterThan(10);

    component.choosePattern('dates');
    expect(component.sessions.length).toBe(0);
    const cell = component.calendarCells.find(c => c && c.inPeriod)!;
    component.toggleDate(cell);
    expect(component.sessions.length).toBe(1);
  }));
});
