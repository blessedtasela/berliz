import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';

import { AuthService } from 'src/app/services/auth.service';
import { ClientOnboardingService } from 'src/app/services/client-onboarding.service';
import { normaliseOnboarding } from '../client-onboarding.options';
import { ClientOnboardingViewComponent } from './client-onboarding-view.component';

describe('ClientOnboardingViewComponent', () => {
  let fixture: ComponentFixture<ClientOnboardingViewComponent>;
  let service: jasmine.SpyObj<ClientOnboardingService>;

  function open(userId: string) {
    TestBed.overrideProvider(ActivatedRoute, { useValue: { paramMap: new BehaviorSubject(convertToParamMap({ userId })) } });
    fixture = TestBed.createComponent(ClientOnboardingViewComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  beforeEach(() => {
    service = jasmine.createSpyObj('ClientOnboardingService', ['getForClient']);
    TestBed.configureTestingModule({
      imports: [ClientOnboardingViewComponent],
      providers: [
        provideRouter([]),
        { provide: ClientOnboardingService, useValue: service },
        { provide: AuthService, useValue: { getCurrentUserId: () => 20 } },
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({})) } },
      ],
    });
  });

  it('shows the trainer the full answers, including the private health section', () => {
    service.getForClient.and.returnValue(of(normaliseOnboarding({
      userId: 7, clientName: 'Jane Doe', started: true, completionPercent: 100, complete: true,
      fitnessLevel: 'beginner', injuries: 'Left knee, recovering',
    } as any)));
    const el = open('7');
    expect(service.getForClient).toHaveBeenCalledWith(7);
    expect(el.textContent).toContain('Jane Doe');
    expect(el.textContent).toContain('Left knee, recovering');
    expect(el.textContent).toContain('Private');
    expect(el.querySelector('[data-testid="onboarding-incomplete"]')).toBeNull();
  });

  it('tells the trainer when the client has not finished', () => {
    service.getForClient.and.returnValue(of(normaliseOnboarding({ userId: 7, clientName: 'Jane Doe', started: true, completionPercent: 50, complete: false, fitnessLevel: 'beginner' } as any)));
    expect(open('7').querySelector('[data-testid="onboarding-incomplete"]')).not.toBeNull();
  });

  it('shows "not available" and no answers when the server refuses', () => {
    service.getForClient.and.returnValue(throwError(() => ({ status: 403 })));
    const el = open('8');
    expect(el.querySelector('[data-testid="onboarding-view-error"]')?.textContent).toContain('Not available');
    expect(el.querySelector('[data-testid="onboarding-summary"]')).toBeNull();
  });

  it('does not ask the server for a link without a client id', () => {
    const el = open('');
    expect(service.getForClient).not.toHaveBeenCalled();
    expect(el.querySelector('[data-testid="onboarding-view-error"]')).not.toBeNull();
  });
});
