import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AuthService } from 'src/app/services/auth.service';
import { ClientOnboardingService } from 'src/app/services/client-onboarding.service';
import { normaliseOnboarding } from '../client-onboarding.options';
import { OnboardingNudgeComponent } from './onboarding-nudge.component';

describe('OnboardingNudgeComponent', () => {
  let fixture: ComponentFixture<OnboardingNudgeComponent>;
  let service: jasmine.SpyObj<ClientOnboardingService>;
  let signedIn = true;
  let role = 'user';

  function render() {
    fixture = TestBed.createComponent(OnboardingNudgeComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  beforeEach(() => {
    signedIn = true;
    role = 'user';
    service = jasmine.createSpyObj('ClientOnboardingService', ['getMine']);
    TestBed.configureTestingModule({
      imports: [OnboardingNudgeComponent],
      providers: [
        provideRouter([]),
        { provide: ClientOnboardingService, useValue: service },
        { provide: AuthService, useValue: { isAuthenticated: () => signedIn, getCurrentUserRole: () => role } },
      ],
    });
  });

  it('invites a client with unfinished onboarding, without blocking anything', () => {
    service.getMine.and.returnValue(of(normaliseOnboarding({ started: false, complete: false } as any)));
    const el = render();
    expect(el.querySelector('[data-testid="onboarding-nudge"]')).not.toBeNull();
    expect(el.textContent).toContain('you can book now and do it after');
    expect(el.querySelector('a')?.getAttribute('href')).toBe('/dashboard/onboarding');
    expect(el.textContent).toContain('Start');
  });

  it('says Finish once they have started', () => {
    service.getMine.and.returnValue(of(normaliseOnboarding({ started: true, complete: false } as any)));
    expect(render().textContent).toContain('Finish');
  });

  it('is hidden when onboarding is complete', () => {
    service.getMine.and.returnValue(of(normaliseOnboarding({ started: true, complete: true } as any)));
    expect(render().querySelector('[data-testid="onboarding-nudge"]')).toBeNull();
  });

  it('is hidden for a signed-out visitor and for a trainer, and does not even ask', () => {
    signedIn = false;
    expect(render().querySelector('[data-testid="onboarding-nudge"]')).toBeNull();
    signedIn = true;
    role = 'trainer';
    expect(render().querySelector('[data-testid="onboarding-nudge"]')).toBeNull();
    expect(service.getMine).not.toHaveBeenCalled();
  });

  it('is hidden when the request fails', () => {
    service.getMine.and.returnValue(throwError(() => new Error('down')));
    expect(render().querySelector('[data-testid="onboarding-nudge"]')).toBeNull();
  });
});
