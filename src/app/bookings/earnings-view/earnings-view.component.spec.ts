import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';

import { StripeService } from 'src/app/services/stripe.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { StripeConnectStatus } from 'src/app/models/stripe.model';

import { EarningsViewComponent } from './earnings-view.component';
import { loadMyPayouts } from 'src/app/state/payout/payout.actions';
import {
  selectMyPayouts,
  selectMyPaidTotal,
  selectMyPendingTotal,
  selectPayoutLoading,
} from 'src/app/state/payout/payout.selectors';
import { Payout } from 'src/app/models/payout.model';

describe('EarningsViewComponent', () => {
  let component: EarningsViewComponent;
  let fixture: ComponentFixture<EarningsViewComponent>;
  let store: MockStore;
  let stripe: jasmine.SpyObj<StripeService>;
  let snackBar: jasmine.SpyObj<SnackBarService>;

  const notSetUp: StripeConnectStatus = { configured: true, connected: false, detailsSubmitted: false, chargesEnabled: false, payoutsEnabled: false, ready: false };

  const pendingPayout: Payout = {
    id: 1,
    bookingId: 10,
    bookingScheduledAt: new Date('2026-08-01T10:00:00Z'),
    bookingDurationMinutes: 60,
    paymentId: null,
    trainerId: 5,
    trainerName: 'Jane Trainer',
    centerId: null,
    centerName: null,
    grossAmount: 100,
    commissionAmount: 15,
    payoutAmount: 85,
    commissionRate: 0.15,
    status: 'PENDING',
    stripeTransferId: null,
    date: new Date('2026-08-01T11:00:00Z'),
    lastUpdate: new Date('2026-08-01T11:00:00Z'),
  };

  const paidPayout: Payout = {
    ...pendingPayout,
    id: 2,
    status: 'PAID',
    stripeTransferId: 'tr_test_123',
  };

  beforeEach(() => {
    stripe = jasmine.createSpyObj<StripeService>('StripeService', ['getConnectStatus', 'createConnectOnboardingLink']);
    stripe.getConnectStatus.and.returnValue(of({ message: '', data: notSetUp, success: true, statusCode: 200 } as any));
    snackBar = jasmine.createSpyObj<SnackBarService>('SnackBarService', ['openSnackBar']);

    TestBed.configureTestingModule({
      declarations: [EarningsViewComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: StripeService, useValue: stripe },
        { provide: SnackBarService, useValue: snackBar },
        provideMockStore({
          selectors: [
            { selector: selectMyPayouts, value: [pendingPayout, paidPayout] },
            { selector: selectPayoutLoading, value: false },
            { selector: selectMyPendingTotal, value: 85 },
            { selector: selectMyPaidTotal, value: 85 },
          ],
        }),
      ],
    });

    fixture = TestBed.createComponent(EarningsViewComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('dispatches loadMyPayouts on init', () => {
    const dispatchSpy = spyOn(store, 'dispatch');
    fixture.detectChanges();
    expect(dispatchSpy).toHaveBeenCalledWith(loadMyPayouts());
  });

  it('populates payouts and totals from the store', () => {
    fixture.detectChanges();
    expect(component.payouts.length).toBe(2);
    expect(component.pendingTotal).toBe(85);
    expect(component.paidTotal).toBe(85);
    expect(component.loading).toBeFalse();
  });

  it('maps status to the correct badge classes', () => {
    fixture.detectChanges();
    expect(component.statusClasses('PAID')).toContain('green');
    expect(component.statusClasses('FAILED')).toContain('red');
    expect(component.statusClasses('PENDING')).toContain('amber');
  });

  describe('payout setup (Stripe Connect)', () => {
    const answer = (data: Partial<StripeConnectStatus>) =>
      stripe.getConnectStatus.and.returnValue(of({ data: { ...notSetUp, ...data } } as any));

    it('reads the connect status on init and keeps it for the banner', () => {
      answer({ connected: true });
      fixture.detectChanges();
      expect(stripe.getConnectStatus).toHaveBeenCalledTimes(1);
      expect(component.connect?.connected).toBeTrue();
      expect(component.connect?.ready).toBeFalse();
    });

    it('hides the banner when the status cannot be read', () => {
      stripe.getConnectStatus.and.returnValue(throwError(() => new Error('down')));
      fixture.detectChanges();
      expect(component.connect).toBeNull();
    });

    it('sends the provider to Stripe with return/refresh URLs that land back on the bookings page', () => {
      fixture.detectChanges();
      stripe.createConnectOnboardingLink.and.returnValue(of({ data: { accountId: 'acct_1', onboardingUrl: 'https://connect.stripe.com/setup/x' } } as any));
      const redirect = spyOn<any>(component, 'redirectTo');

      component.startPayoutSetup();

      const req = stripe.createConnectOnboardingLink.calls.mostRecent().args[0]!;
      expect(req.returnUrl).toContain('/dashboard/my-bookings?payoutSetup=return');
      expect(req.refreshUrl).toContain('/dashboard/my-bookings?payoutSetup=refresh');
      expect(redirect).toHaveBeenCalledWith('https://connect.stripe.com/setup/x');
    });

    it('does not start twice while a link is already being opened', () => {
      fixture.detectChanges();
      stripe.createConnectOnboardingLink.and.returnValue(of({ data: { accountId: 'a', onboardingUrl: 'https://x' } } as any));
      spyOn<any>(component, 'redirectTo');
      component.startPayoutSetup();
      component.startPayoutSetup();
      expect(stripe.createConnectOnboardingLink).toHaveBeenCalledTimes(1);
    });

    it('shows the server message and re-enables the button when it fails', () => {
      fixture.detectChanges();
      stripe.createConnectOnboardingLink.and.returnValue(throwError(() => ({ error: { message: 'Only an approved trainer or center partner can set up payouts.' } })));

      component.startPayoutSetup();

      expect(snackBar.openSnackBar).toHaveBeenCalledWith('Only an approved trainer or center partner can set up payouts.', 'error');
      expect(component.settingUp).toBeFalse();
    });

    it('a Stripe "refresh" return auto-opens a fresh link while setup is unfinished', () => {
      component.payoutSetupReturn = 'refresh';
      answer({ connected: true });
      stripe.createConnectOnboardingLink.and.returnValue(of({ data: { accountId: 'a', onboardingUrl: 'https://x' } } as any));
      spyOn<any>(component, 'redirectTo');

      fixture.detectChanges();

      expect(stripe.createConnectOnboardingLink).toHaveBeenCalledTimes(1);
    });

    it('a "refresh" return does nothing once payouts are already ready', () => {
      component.payoutSetupReturn = 'refresh';
      answer({ connected: true, ready: true, detailsSubmitted: true, payoutsEnabled: true });

      fixture.detectChanges();

      expect(stripe.createConnectOnboardingLink).not.toHaveBeenCalled();
    });
  });

  it('cleans up subscriptions on destroy', () => {
    fixture.detectChanges();
    const nextSpy = spyOn((component as any).destroy$, 'next');
    const completeSpy = spyOn((component as any).destroy$, 'complete');
    component.ngOnDestroy();
    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });
});
