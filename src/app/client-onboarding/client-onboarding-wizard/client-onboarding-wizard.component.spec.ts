import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { CenterService } from 'src/app/services/center.service';
import { ClientOnboardingService } from 'src/app/services/client-onboarding.service';
import { emptyOnboarding, normaliseOnboarding } from '../client-onboarding.options';
import { ClientOnboardingWizardComponent } from './client-onboarding-wizard.component';

describe('ClientOnboardingWizardComponent', () => {
  let fixture: ComponentFixture<ClientOnboardingWizardComponent>;
  let component: ClientOnboardingWizardComponent;
  let service: jasmine.SpyObj<ClientOnboardingService>;
  let query: Record<string, string>;

  function create(profile: any = {}) {
    service.getMine.and.returnValue(of(normaliseOnboarding({ ...emptyOnboarding(), ...profile })));
    fixture = TestBed.createComponent(ClientOnboardingWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => {
    query = {};
    service = jasmine.createSpyObj('ClientOnboardingService', ['getMine', 'saveMine', 'deleteMyHealthAnswers']);
    service.saveMine.and.callFake((body: any) => of(normaliseOnboarding({ ...component.draft, ...body })));
    TestBed.configureTestingModule({
      imports: [ClientOnboardingWizardComponent],
      providers: [
        provideRouter([]),
        { provide: ClientOnboardingService, useValue: service },
        { provide: CenterService, useValue: { getActiveCenters: () => of({ data: [{ id: 5, name: 'M Fitness Sources' }, { id: 6, name: 'Iron House' }] }) } },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: (k: string) => query[k] ?? null } } } },
      ],
    });
  });

  it('starts a new client on step 1', () => {
    create();
    expect(component.step).toBe(1);
    expect(fixture.nativeElement.querySelector('[data-testid="onboarding-step-label"]').textContent).toContain('Step 1 of 7');
  });

  it('resumes at the step the client reached when they closed the page', () => {
    create({ started: true, currentStep: 4, locationType: 'home', trainingMode: 'online' });
    expect(component.step).toBe(4);
  });

  it('opens a finished profile at step 1 so it reads as an edit', () => {
    create({ started: true, complete: true, completionPercent: 100, currentStep: 7 });
    expect(component.step).toBe(1);
  });

  it('refuses to move on until the required answers of a step are there', () => {
    create();
    component.next();
    expect(service.saveMine).not.toHaveBeenCalled();
    expect(component.errors['locationType']).toBe('Choose where you train.');
    expect(component.errors['trainingMode']).toBe('Choose how you train.');
    expect(component.step).toBe(1);

    component.pick('locationType', 'home');
    component.pick('trainingMode', 'online');
    component.next();
    expect(service.saveMine).toHaveBeenCalledTimes(1);
  });

  it('saves a step as soon as the client moves on, with where to resume', () => {
    create();
    component.pick('locationType', 'home');
    component.pick('trainingMode', 'hybrid');
    component.toggle('equipment', 'dumbbells');
    component.next();

    const body = service.saveMine.calls.mostRecent().args[0] as any;
    expect(body.currentStep).toBe(2);
    expect(body.locationType).toBe('home');
    expect(body.trainingMode).toBe('hybrid');
    expect(body.equipment).toEqual(['dumbbells']);
    expect(body.clearCenter).toBeTrue();
    expect(component.step).toBe(2);
  });

  it('allows at most two goals', () => {
    create({ started: true, currentStep: 3 });
    component.toggleGoal('strength');
    component.toggleGoal('fat_loss');
    component.toggleGoal('conditioning');
    expect(component.draft.goals).toEqual(['strength', 'fat_loss']);
    expect(component.errors['goals']).toContain('up to 2');
    component.toggleGoal('fat_loss');
    expect(component.draft.goals).toEqual(['strength']);
  });

  it('accepts "none" as the answer about injuries', () => {
    create({ started: true, currentStep: 4 });
    component.next();
    expect(component.errors['injuries']).toContain('"None" is a fine answer');
    component.setNoInjuries(true);
    expect(component.draft.injuries).toBe('None');
    component.next();
    expect(service.saveMine).toHaveBeenCalled();
    expect((service.saveMine.calls.mostRecent().args[0] as any).injuries).toBe('None');
  });

  it('shows the not-medical-advice note and privacy promise on the health step', () => {
    create({ started: true, currentStep: 4 });
    const text = fixture.nativeElement.querySelector('[data-testid="health-disclaimer"]').textContent;
    expect(text).toContain('not medical advice');
    expect(text).toContain('Only the trainers you work with can see these answers');
  });

  it('lets an optional step be skipped, saving only where to resume', () => {
    create({ started: true, currentStep: 5 });
    component.skip();
    expect(service.saveMine).toHaveBeenCalledWith({ currentStep: 6 });
    expect(component.step).toBe(6);
  });

  it('does not let a required step be skipped', () => {
    create();
    component.skip();
    expect(service.saveMine).not.toHaveBeenCalled();
  });

  it('needs at least one day on the schedule step', () => {
    create({ started: true, currentStep: 6 });
    component.next();
    expect(component.errors['availableDays']).toContain('at least one day');
    component.toggle('availableDays', 'mon');
    component.setSessionMinutes(45);
    component.next();
    const body = service.saveMine.calls.mostRecent().args[0] as any;
    expect(body.availableDays).toEqual(['mon']);
    expect(body.sessionMinutes).toBe(45);
    expect(component.step).toBe(7);
  });

  it('finishes on the last step and shows the done panel', () => {
    create({ started: true, currentStep: 7, complete: true });
    component.step = 7;
    component.next();
    expect(component.finished).toBeTrue();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="onboarding-done"]')).not.toBeNull();
  });

  it('keeps the client on the step and says why when saving fails', () => {
    create();
    component.pick('locationType', 'home');
    component.pick('trainingMode', 'online');
    service.saveMine.and.returnValue(throwError(() => ({ error: { message: 'One of the answers is not valid.' } })));
    component.next();
    fixture.detectChanges();
    expect(component.step).toBe(1);
    expect(fixture.nativeElement.querySelector('[data-testid="onboarding-save-error"]').textContent).toContain('not valid');
  });

  it('deletes the saved health answers on request and reopens the injuries question', () => {
    create({ started: true, currentStep: 4, injuries: 'Left knee', medicalConditions: 'Asthma' });
    expect(component.hasSavedHealthAnswers).toBeTrue();
    service.deleteMyHealthAnswers.and.returnValue(of(normaliseOnboarding({ started: true, complete: false, missingRequired: ['injuries'] })));
    component.deleteHealthAnswers();
    expect(service.deleteMyHealthAnswers).toHaveBeenCalled();
    expect(component.draft.injuries).toBeFalsy();
    expect(component.draft.complete).toBeFalse();
  });

  it('offers a retry when the profile cannot be loaded', () => {
    service.getMine.and.returnValue(throwError(() => new Error('down')));
    fixture = TestBed.createComponent(ClientOnboardingWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.loadFailed).toBeTrue();
    expect(fixture.nativeElement.querySelector('[data-testid="onboarding-load-failed"]')).not.toBeNull();
  });

  it('finds a center in the directory by typing part of its name', () => {
    create();
    component.pick('locationType', 'center');
    component.centerQuery = 'iron';
    expect(component.centerMatches.map(c => c.name)).toEqual(['Iron House']);
    component.chooseCenter(component.centerMatches[0]);
    component.pick('trainingMode', 'in_person');
    component.next();
    const body = service.saveMine.calls.mostRecent().args[0] as any;
    expect(body.centerId).toBe(6);
    expect(body.clearCenter).toBeFalse();
  });

  it('never shows placeholder copy or a payment step on any of the seven steps', () => {
    create({ started: true });
    for (let n = 1; n <= 7; n++) {
      component.step = n;
      fixture.detectChanges();
      const text: string = fixture.nativeElement.textContent;
      expect(text).not.toMatch(/lorem|ipsum|placeholder text|todo/i);
      expect(text).not.toMatch(/stripe|checkout|credit card|card number|pay now|subscribe/i);
    }
  });
});
