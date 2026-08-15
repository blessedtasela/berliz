import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

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
    TestBed.configureTestingModule({
      declarations: [EarningsViewComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
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

  it('cleans up subscriptions on destroy', () => {
    fixture.detectChanges();
    const nextSpy = spyOn((component as any).destroy$, 'next');
    const completeSpy = spyOn((component as any).destroy$, 'complete');
    component.ngOnDestroy();
    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });
});
