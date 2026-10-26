import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { AuthService } from 'src/app/services/auth.service';
import { ClientOnboardingService } from 'src/app/services/client-onboarding.service';
import { ConnectionService } from 'src/app/services/connection.service';
import { WorkoutService } from 'src/app/services/workout.service';
import { selectUser } from 'src/app/state/user/user.selector';
import { TourService } from 'src/app/shared/demo/tour.service';
import { normaliseOnboarding } from 'src/app/client-onboarding/client-onboarding.options';
import { OnboardingChecklistComponent, isClientProfileComplete } from './onboarding-checklist.component';

describe('isClientProfileComplete', () => {
  it('needs a photo AND a country AND a city', () => {
    expect(isClientProfileComplete({ profilePhoto: 'abc', country: 'Canada', city: 'Calgary' })).toBeTrue();
    expect(isClientProfileComplete({ profilePhoto: null, country: 'Canada', city: 'Calgary' })).toBeFalse();
    expect(isClientProfileComplete({ profilePhoto: 'abc', country: '', city: 'Calgary' })).toBeFalse();
    expect(isClientProfileComplete({ profilePhoto: 'abc', country: 'Canada', city: '  ' })).toBeFalse();
    expect(isClientProfileComplete(null)).toBeFalse();
  });
});

describe('OnboardingChecklistComponent (client)', () => {
  let store: MockStore;
  const onboardingSvc = jasmine.createSpyObj('ClientOnboardingService', ['getMine']);

  function create(user: any, onboarding: any) {
    onboardingSvc.getMine.and.returnValue(of(normaliseOnboarding(onboarding)));
    store.overrideSelector(selectUser, user);
    const fixture = TestBed.createComponent(OnboardingChecklistComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  beforeEach(() => {
    try { localStorage.clear(); } catch { /* storage unavailable */ }
    TestBed.configureTestingModule({
      imports: [OnboardingChecklistComponent],
      providers: [
        provideRouter([]),
        provideMockStore(),
        { provide: AuthService, useValue: { getCurrentUserRole: () => 'user' } },
        { provide: WorkoutService, useValue: { getMyWorkoutLogs: () => of({ data: [] }) } },
        { provide: ConnectionService, useValue: { getMyConnections: () => of({ data: [] }) } },
        { provide: ClientOnboardingService, useValue: onboardingSvc },
        { provide: TourService, useValue: { start: () => { } } },
      ],
    });
    store = TestBed.inject(MockStore);
  });

  afterEach(() => store.resetSelectors());

  it('ticks "Complete your profile" once photo and location are saved, not when the link is clicked', () => {
    const c = create({ profilePhoto: null, country: '', city: '' }, { started: false });
    const profile = c.steps.find(s => s.key === 'profile')!;
    expect(profile.done).toBeFalse();
    c.markClicked(profile);
    expect(profile.done).toBeFalse();
  });

  it('ticks it when the profile has a photo and a location', () => {
    const c = create({ profilePhoto: 'abc', country: 'Canada', city: 'Calgary' }, { started: false });
    expect(c.steps.find(s => s.key === 'profile')!.done).toBeTrue();
    expect(c.steps.find(s => s.key === 'onboarding')!.done).toBeFalse();
  });

  it('ticks the onboarding item only when every required answer is filled in', () => {
    const half = create({ profilePhoto: null }, { started: true, complete: false, completionPercent: 50 });
    expect(half.steps.find(s => s.key === 'onboarding')!.done).toBeFalse();

    const done = create({ profilePhoto: null }, { started: true, complete: true, completionPercent: 100 });
    expect(done.steps.find(s => s.key === 'onboarding')!.done).toBeTrue();
  });

  it('points the onboarding item at the wizard', () => {
    const c = create({}, { started: false });
    expect(c.steps.find(s => s.key === 'onboarding')!.link).toEqual(['/dashboard/onboarding']);
  });
});
