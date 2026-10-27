import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { BookingPlansComponent } from './booking-plans.component';
import { BookingService } from 'src/app/services/booking.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { BookingPlan } from 'src/app/models/booking.model';

describe('BookingPlansComponent', () => {
  let fixture: ComponentFixture<BookingPlansComponent>;
  let component: BookingPlansComponent;
  let bookingService: jasmine.SpyObj<BookingService>;
  let snackBar: jasmine.SpyObj<SnackBarService>;

  const plan = (over: Partial<BookingPlan> = {}): BookingPlan => ({
    id: 3, clientId: 1, clientName: 'Sam Client', trainerId: 9, trainerName: 'Coach Jane', centerId: null, centerName: null,
    status: 'pending', sessionCount: 12, activeSessionCount: 12, subtotal: 1200, discount: 120, total: 1080, perSession: 90,
    promotionLabel: 'Welcome', startDate: '2026-11-02', endDate: '2026-11-27', notes: null, date: new Date(), sessions: [], ...over,
  });

  const reply = (data: Partial<BookingPlan> & { message?: string } = {}) => of({ success: true, statusCode: 200, message: '', data: plan(data) } as any);

  function create(mode: 'client' | 'provider', plans: BookingPlan[]): void {
    bookingService.getMyPlans.and.returnValue(of({ success: true, statusCode: 200, message: '', data: plans }));
    bookingService.getProviderPlans.and.returnValue(of({ success: true, statusCode: 200, message: '', data: plans }));
    fixture = TestBed.createComponent(BookingPlansComponent);
    component = fixture.componentInstance;
    component.mode = mode;
    fixture.detectChanges();
  }

  const text = () => fixture.nativeElement.textContent.replace(/\s+/g, ' ');
  const byTestId = (id: string): HTMLButtonElement | null => fixture.nativeElement.querySelector(`[data-testid="${id}"]`);

  beforeEach(() => {
    bookingService = jasmine.createSpyObj('BookingService', ['getMyPlans', 'getProviderPlans', 'respondToPlan', 'cancelPlan']);
    snackBar = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    TestBed.configureTestingModule({
      imports: [BookingPlansComponent],
      providers: [{ provide: BookingService, useValue: bookingService }, { provide: SnackBarService, useValue: snackBar }],
    });
  });

  it('shows nothing at all when there are no plans', () => {
    create('client', []);

    expect(byTestId('plans-section')).toBeNull();
  });

  it('a client sees who the plan is with, the split price and the pay-as-you-go note', () => {
    create('client', [plan({ status: 'confirmed' })]);

    expect(text()).toContain('Plan with Coach Jane');
    expect(text()).toContain('12 of 12 sessions');
    expect(text()).toContain('CA$1,080.00');
    expect(text()).toContain('CA$90.00');
    expect(text()).toContain('Saved CA$120.00');
    expect(text()).toContain('Accepted');
    expect(text()).toContain('Pay each session as it comes up');
  });

  it('a provider sees the client and can accept the whole plan in one tap', () => {
    create('provider', [plan()]);
    bookingService.respondToPlan.and.returnValue(reply({ status: 'confirmed', message: 'Plan confirmed: 12 sessions' }));

    expect(text()).toContain('Sam Client');
    byTestId('accept-plan')!.click();

    expect(bookingService.respondToPlan).toHaveBeenCalledWith(3, 'confirm');
    expect(snackBar.openSnackBar).toHaveBeenCalledWith('Plan confirmed: 12 sessions', '');
    expect(bookingService.getProviderPlans).toHaveBeenCalledTimes(2); // reloaded after the change
  });

  it('declining asks first, then declines the whole plan', () => {
    create('provider', [plan()]);
    bookingService.respondToPlan.and.returnValue(reply({ status: 'cancelled' }));

    [...fixture.nativeElement.querySelectorAll('button')].find((b: HTMLElement) => b.textContent!.trim() === 'Decline').click();
    fixture.detectChanges();
    expect(bookingService.respondToPlan).not.toHaveBeenCalled();

    byTestId('confirm-decline')!.click();

    expect(bookingService.respondToPlan).toHaveBeenCalledWith(3, 'decline');
  });

  it('a provider has no accept button for a plan that is already answered', () => {
    create('provider', [plan({ status: 'confirmed' })]);

    expect(byTestId('accept-plan')).toBeNull();
  });

  it('a client cancels the upcoming sessions only after confirming', () => {
    create('client', [plan({ status: 'confirmed' })]);
    bookingService.cancelPlan.and.returnValue(reply({ status: 'cancelled', message: '9 upcoming sessions cancelled' }));

    [...fixture.nativeElement.querySelectorAll('button')].find((b: HTMLElement) => b.textContent!.includes('Cancel upcoming')).click();
    fixture.detectChanges();
    expect(bookingService.cancelPlan).not.toHaveBeenCalled();

    byTestId('confirm-cancel-plan')!.click();

    expect(bookingService.cancelPlan).toHaveBeenCalledWith(3);
  });

  it('shows the server\'s reason when an action fails', () => {
    create('provider', [plan()]);
    bookingService.respondToPlan.and.returnValue(throwError(() => ({ error: { message: 'Not yours' } })));

    byTestId('accept-plan')!.click();

    expect(snackBar.openSnackBar).toHaveBeenCalledWith('Not yours', 'error');
    expect(component.busy).toBeFalse();
  });

  it('a failed load shows nothing instead of an error banner', () => {
    bookingService.getMyPlans.and.returnValue(throwError(() => new Error('down')));
    fixture = TestBed.createComponent(BookingPlansComponent);
    fixture.detectChanges();

    expect(byTestId('plans-section')).toBeNull();
  });
});
