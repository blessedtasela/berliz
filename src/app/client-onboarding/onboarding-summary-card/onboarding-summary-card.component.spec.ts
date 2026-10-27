import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AuthService } from 'src/app/services/auth.service';
import { ClientOnboardingService } from 'src/app/services/client-onboarding.service';
import { normaliseOnboarding } from '../client-onboarding.options';
import { OnboardingSummaryCardComponent } from './onboarding-summary-card.component';

describe('OnboardingSummaryCardComponent', () => {
  let fixture: ComponentFixture<OnboardingSummaryCardComponent>;
  let service: jasmine.SpyObj<ClientOnboardingService>;
  let role = 'trainer';

  const profile = normaliseOnboarding({
    userId: 7, clientName: 'Jane Doe', started: true, completionPercent: 83, complete: false,
    fitnessLevel: 'beginner', trainingMode: 'online', goals: ['strength', 'fat_loss'],
  } as any);

  function show(otherUserId: number | null, otherRole: string) {
    fixture = TestBed.createComponent(OnboardingSummaryCardComponent);
    fixture.componentInstance.otherUserId = otherUserId;
    fixture.componentInstance.otherRole = otherRole;
    fixture.componentInstance.ngOnChanges({} as any);
    fixture.detectChanges();
  }

  beforeEach(() => {
    role = 'trainer';
    service = jasmine.createSpyObj('ClientOnboardingService', ['getForClient', 'getMine']);
    service.getForClient.and.returnValue(of(profile));
    service.getMine.and.returnValue(of(profile));
    TestBed.configureTestingModule({
      imports: [OnboardingSummaryCardComponent],
      providers: [
        provideRouter([]),
        { provide: ClientOnboardingService, useValue: service },
        { provide: AuthService, useValue: { getCurrentUserRole: () => role } },
      ],
    });
  });

  it('shows a trainer their client\'s summary with a link to the full view', () => {
    show(7, 'user');
    const el: HTMLElement = fixture.nativeElement;
    expect(service.getForClient).toHaveBeenCalledWith(7);
    expect(el.textContent).toContain('Jane Doe\'s onboarding');
    expect(el.textContent).toContain('83% done');
    expect(el.textContent).toContain('Beginner · Online · Strength, Fat loss');
    expect(el.querySelector('[data-testid="onboarding-card-view"]')?.getAttribute('href')).toBe('/dashboard/clients/7/onboarding');
  });

  it('shows a client their own summary with a link to edit', () => {
    role = 'user';
    show(9, 'trainer');
    const el: HTMLElement = fixture.nativeElement;
    expect(service.getMine).toHaveBeenCalled();
    expect(service.getForClient).not.toHaveBeenCalled();
    expect(el.textContent).toContain('Your onboarding');
    expect(el.querySelector('[data-testid="onboarding-card-edit"]')?.getAttribute('href')).toBe('/dashboard/onboarding');
    expect(el.querySelector('[data-testid="onboarding-card-edit"]')?.textContent).toContain('Finish');
  });

  it('shows nothing when the server refuses (the other person is not this trainer\'s client)', () => {
    service.getForClient.and.returnValue(throwError(() => ({ status: 403 })));
    show(8, 'user');
    expect(fixture.nativeElement.querySelector('[data-testid="onboarding-card"]')).toBeNull();
  });

  it('does not ask anything for two trainers or two members', () => {
    show(8, 'trainer');
    role = 'user';
    show(8, 'user');
    expect(service.getForClient).not.toHaveBeenCalled();
    expect(service.getMine).not.toHaveBeenCalled();
  });

  it('says a client has not started when there is nothing yet', () => {
    service.getForClient.and.returnValue(of(normaliseOnboarding({ userId: 7, clientName: 'Jane Doe', started: false } as any)));
    show(7, 'user');
    expect(fixture.nativeElement.textContent).toContain('not started');
  });
});
