import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';

import { CenterService } from 'src/app/services/center.service';
import { TrainerService } from 'src/app/services/trainer.service';
import { BookingPriceEstimateComponent } from './booking-price-estimate.component';

describe('BookingPriceEstimateComponent', () => {
  let fixture: ComponentFixture<BookingPriceEstimateComponent>;
  let component: BookingPriceEstimateComponent;
  let trainerService: jasmine.SpyObj<TrainerService>;
  let centerService: jasmine.SpyObj<CenterService>;

  const text = () => ((fixture.nativeElement as HTMLElement).textContent ?? '').replace(/\s+/g, ' ');

  beforeEach(() => {
    trainerService = jasmine.createSpyObj('TrainerService', ['getActiveTrainers']);
    centerService = jasmine.createSpyObj('CenterService', ['getActiveCenters']);
    trainerService.getActiveTrainers.and.returnValue(of({ data: [{ id: 9, hourlyRate: 100 }, { id: 10 }, { id: 11, hourlyRate: 50, freeCancelHours: 48, lateCancelRefundPercent: 0 }] } as any));
    centerService.getActiveCenters.and.returnValue(of({ data: [{ id: 3, hourlyRate: 80 }] } as any));

    TestBed.configureTestingModule({
      imports: [BookingPriceEstimateComponent],
      providers: [
        { provide: TrainerService, useValue: trainerService },
        { provide: CenterService, useValue: centerService },
      ],
    });
    fixture = TestBed.createComponent(BookingPriceEstimateComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => fixture.destroy());

  function show(inputs: Partial<BookingPriceEstimateComponent>): void {
    Object.assign(component, inputs);
    component.ngOnInit();
    fixture.detectChanges();
  }

  it('shows the estimated total for a trainer, location fee included', () => {
    show({ trainerId: 9, minutes: 60, locationFee: 15, providerName: 'Coach Jane' });
    expect(text()).toContain('Estimated total');
    expect(text()).toContain('$115.00');
    expect(text()).toContain('Location fee');
    expect(text()).toContain('after Coach Jane confirms');
  });

  it('explains the request hold, in the numbers the server uses', () => {
    show({ trainerId: 9, minutes: 60, providerName: 'Coach Jane' });
    expect(text()).toContain('Your time is held while Coach Jane answers');
    expect(text()).toContain('unanswered for 2 days is released and nothing is charged');
    expect(text()).toContain('24 hours to pay');
  });

  it("shows the trainer's own booking policy beside the generated terms, as plain text", () => {
    trainerService.getActiveTrainers.and.returnValue(of({
      data: [{ id: 9, hourlyRate: 100, bookingPolicy: 'Groups must be full before training starts.\n<b>No shows</b> notify 24h ahead.' }],
    } as any));
    show({ trainerId: 9, minutes: 60, providerName: 'Coach Jane' });
    const policy = (fixture.nativeElement as HTMLElement).querySelector('[data-testid="booking-policy"]')!;
    expect(policy.textContent).toContain("Coach Jane's booking policy");
    expect(policy.textContent).toContain('Groups must be full before training starts.');
    expect(policy.querySelector('b')).toBeNull();
    expect(text()).toContain('Nothing is charged now');
  });

  it('shows no policy block when the trainer has not written one', () => {
    show({ trainerId: 9, minutes: 60 });
    expect((fixture.nativeElement as HTMLElement).querySelector('[data-testid="booking-policy"]')).toBeNull();
  });

  it('for a provider who takes payment directly, says so and drops the pay-after-confirm and refund lines', () => {
    trainerService.getActiveTrainers.and.returnValue(of({ data: [{ id: 9, hourlyRate: 100, paymentMode: 'DIRECT' }] } as any));
    show({ trainerId: 9, minutes: 60, providerName: 'Coach Jane' });
    expect(text()).toContain('Pay Coach Jane directly. Berliz keeps the booking on record');
    expect(text()).not.toContain('Nothing is charged now');
    expect(text()).not.toContain('Free cancellation');
    expect(text()).not.toContain('Your time is held');
  });

  it('prices a center from its own rate', () => {
    show({ centerId: 3, minutes: 90 });
    expect(text()).toContain('$120.00');
    expect(centerService.getActiveCenters).toHaveBeenCalled();
    expect(trainerService.getActiveTrainers).not.toHaveBeenCalled();
  });

  it('shows the discounted session price when a reward applies', () => {
    show({ trainerId: 9, minutes: 60, promotion: { type: 'percentage', value: 20 } });
    expect(text()).toContain('After your reward');
    expect(text()).toContain('$80.00');
  });

  it('follows a changed length', () => {
    show({ trainerId: 9, minutes: 60 });
    expect(text()).toContain('$100.00');
    component.minutes = 30;
    fixture.detectChanges();
    expect(text()).toContain('$50.00');
  });

  it('states the platform default cancellation policy when the provider has not chosen one', () => {
    show({ trainerId: 9, minutes: 60 });
    expect(text()).toContain('Free cancellation until 24 hours before; after that it\x27s 50% refunded.');
  });

  it("states the provider's own cancellation policy", () => {
    show({ trainerId: 11, minutes: 60 });
    expect(text()).toContain("Free cancellation until 48 hours before; after that it's not refunded.");
  });

  it('still shows who, when and how long for a provider with no rate, and says the price is agreed with them', () => {
    show({ trainerId: 10, minutes: 60, providerName: 'Coach Jane', when: 'Monday, October 26 · 7:00 PM - 8:00 PM' });
    expect(text()).toContain('Your request');
    expect(text()).toContain('Coach Jane');
    expect(text()).toContain('Monday, October 26 · 7:00 PM - 8:00 PM');
    expect(text()).toContain('60 minutes');
    expect(text()).toContain('Agreed with Coach Jane');
    expect(text()).not.toContain('Estimated total');
    expect(text()).toContain('nothing is charged now');
    expect(text()).toContain('Free cancellation until 24 hours before');
  });

  it('asks for a time until one is picked, and shows where when it is known', () => {
    show({ centerId: 3, minutes: 60, providerName: 'Berliz Works', where: 'Berliz Works' });
    expect(text()).toContain('Pick a date and time above');
    expect(text()).toContain('Where');
  });

  it('shows the summary with the price breakdown when there is a rate', () => {
    show({ trainerId: 9, minutes: 60, providerName: 'Coach Jane', when: 'Tuesday' });
    expect(text()).toContain('Your request');
    expect(text()).toContain('Estimated total');
    expect(text()).not.toContain('Agreed with');
  });

  it('does not flash "agreed with" before the rate has loaded', () => {
    const pending = new Subject<any>();
    trainerService.getActiveTrainers.and.returnValue(pending.asObservable());
    show({ trainerId: 9, minutes: 60, providerName: 'Coach Jane' });
    expect(text().trim()).toBe('');
    pending.next({ data: [{ id: 9, hourlyRate: 100 }] });
    fixture.detectChanges();
    expect(text()).toContain('Estimated total');
  });

  describe('trial session for a new member', () => {
    beforeEach(() => {
      trainerService.getActiveTrainers.and.returnValue(of({ data: [{ id: 9, hourlyRate: 100, trialPrice: null }] } as any));
    });

    it('shows the list price, the discount taken off, the total, and what is saved', () => {
      show({ trainerId: 9, minutes: 60, sessionType: 'TRIAL', newMemberPercent: 50, providerName: 'Coach Jane' });
      expect(text()).toContain('Trial session');
      expect(text()).toContain('$100.00');
      expect(text()).toContain('New member offer (50% off your first trial)');
      expect(text()).toContain('$50.00');
      expect(text()).toContain('You save CA$50.00');
      const total = fixture.nativeElement.querySelector('.text-sm.font-bold') as HTMLElement;
      expect(total.textContent).toContain('$50.00');
      expect(text()).toContain('You pay CA$50.00 only after Coach Jane confirms');
    });

    it('uses the trainer own trial price when they have set one', () => {
      trainerService.getActiveTrainers.and.returnValue(of({ data: [{ id: 9, hourlyRate: 100, trialPrice: 60 }] } as any));
      show({ trainerId: 9, minutes: 60, sessionType: 'TRIAL', newMemberPercent: 50 });
      expect(text()).toContain('$60.00');
      expect(text()).toContain('$30.00');
    });

    it('lists the gym drop-in as paid to the gym and keeps it out of the total', () => {
      show({ trainerId: 9, minutes: 60, sessionType: 'TRIAL', newMemberPercent: 50, gymDropIn: 25 });
      const line = fixture.nativeElement.querySelector('[data-testid="gym-dropin-line"]') as HTMLElement;
      expect(line.textContent).toContain('$25.00');
      expect(line.textContent).toContain('not included in your payment to Berliz');
      const total = fixture.nativeElement.querySelector('.text-sm.font-bold') as HTMLElement;
      expect(total.textContent).toContain('$50.00');
      expect(total.textContent).not.toContain('$75.00');
    });

    it('names the travel zone with its fee, and says the trainer will set it when unknown', () => {
      show({ trainerId: 9, minutes: 60, sessionType: 'TRIAL', locationFee: 30, travelZone: 'NEARBY' });
      expect(text()).toContain('Travel fee (Greater Vancouver (up to 30 km))');
      expect(text()).toContain('$130.00');
      show({ trainerId: 9, minutes: 60, sessionType: 'TRIAL', locationFee: null, travelZone: 'PENDING' });
      expect(text()).toContain('set by the trainer');
    });

    it('gives a concrete refund example under the cancellation rule', () => {
      show({ trainerId: 9, minutes: 60, sessionType: 'TRIAL', newMemberPercent: 50 });
      expect(text()).toContain('50% of what you paid: e.g. CA$25.00 back on CA$50.00.');
    });

    it('never applies to a center', () => {
      centerService.getActiveCenters.and.returnValue(of({ data: [{ id: 3, hourlyRate: 80 }] } as any));
      show({ centerId: 3, minutes: 60, sessionType: 'TRIAL', newMemberPercent: 50 });
      expect(text()).not.toContain('New member offer');
      expect(text()).toContain('$80.00');
    });
  });

  it('still shows the summary, and the agreed-price line, if the lookup fails (booking is not blocked)', () => {
    trainerService.getActiveTrainers.and.returnValue(throwError(() => new Error('boom')));
    show({ trainerId: 9, minutes: 60, providerName: 'Coach Jane' });
    expect(text()).toContain('Your request');
    expect(text()).toContain('Agreed with Coach Jane');
  });
});
