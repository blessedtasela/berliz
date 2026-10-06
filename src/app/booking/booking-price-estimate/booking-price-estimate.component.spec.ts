import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

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

  it('renders nothing for a provider with no rate set', () => {
    show({ trainerId: 10, minutes: 60 });
    expect(text().trim()).toBe('');
  });

  it('renders nothing, and does not break booking, if the lookup fails', () => {
    trainerService.getActiveTrainers.and.returnValue(throwError(() => new Error('boom')));
    show({ trainerId: 9, minutes: 60 });
    expect(text().trim()).toBe('');
  });
});
