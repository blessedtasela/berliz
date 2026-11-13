import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { of } from 'rxjs';

import { PayoutsListComponent } from './payouts-list.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { Payout } from 'src/app/models/payout.model';
import { recalculatePayout } from 'src/app/state/payout/payout.actions';

describe('PayoutsListComponent', () => {
  let component: PayoutsListComponent;
  let fixture: ComponentFixture<PayoutsListComponent>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let store: MockStore;

  const pendingPayout: Payout = {
    id: 1, bookingId: null, bookingScheduledAt: null, bookingDurationMinutes: null, paymentId: null,
    trainerId: 5, trainerName: 'Jane Trainer', centerId: null, centerName: null,
    grossAmount: 100, commissionAmount: 15, payoutAmount: 85, commissionRate: 0.15,
    status: 'PENDING', stripeTransferId: null, date: new Date(), lastUpdate: new Date(),
  };

  beforeEach(() => {
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    TestBed.configureTestingModule({
      declarations: [PayoutsListComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore(),
        provideMockActions(() => of()),
        { provide: MatDialog, useValue: dialogSpy },
        { provide: SnackBarService, useValue: jasmine.createSpyObj('SnackBarService', ['openSnackBar']) },
      ]
    });

    fixture = TestBed.createComponent(PayoutsListComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('falls back from trainer to center to "Unknown provider"', () => {
    expect(component.providerName({ ...pendingPayout, trainerName: 'Jane' } as Payout)).toBe('Jane');
    expect(component.providerName({ ...pendingPayout, trainerName: null, centerName: 'Big Gym' } as Payout)).toBe('Big Gym');
    expect(component.providerName({ ...pendingPayout, trainerName: null, centerName: null } as Payout)).toBe('Unknown provider');
  });

  it('maps PAID/FAILED/PENDING to distinct badge classes', () => {
    expect(component.statusClasses('PAID')).toContain('green');
    expect(component.statusClasses('FAILED')).toContain('red');
    expect(component.statusClasses('PENDING')).toContain('amber');
  });

  it('only opens the confirm dialog for a PENDING payout', () => {
    fixture.detectChanges();
    component.payOut({ ...pendingPayout, status: 'PAID' } as Payout);
    expect(dialogSpy.open).not.toHaveBeenCalled();
  });

  it('does not open a second confirm dialog while one payout is already being paid', () => {
    fixture.detectChanges();
    component.payingId = 99;
    component.payOut(pendingPayout);
    expect(dialogSpy.open).not.toHaveBeenCalled();
  });

  // PY-24: a "Recalculate" action for a payout created before the real-payment basis fix.
  describe('recalculate', () => {
    const withBooking: Payout = { ...pendingPayout, bookingId: 17 };

    it('opens the confirm dialog for a not-yet-paid-out payout with a bookingId', () => {
      fixture.detectChanges();
      dialogSpy.open.and.returnValue({ componentInstance: { onEmitStatusChange: of() } } as any);

      component.recalculate(withBooking);

      expect(dialogSpy.open).toHaveBeenCalled();
    });

    it('refuses a payout already paid out', () => {
      fixture.detectChanges();
      component.recalculate({ ...withBooking, status: 'PAID' });
      expect(dialogSpy.open).not.toHaveBeenCalled();
    });

    it('refuses a payout with no bookingId', () => {
      fixture.detectChanges();
      component.recalculate(pendingPayout);
      expect(dialogSpy.open).not.toHaveBeenCalled();
    });

    it('does not open a second dialog while one recalculation is already in flight', () => {
      fixture.detectChanges();
      component.recalculatingId = 99;
      component.recalculate(withBooking);
      expect(dialogSpy.open).not.toHaveBeenCalled();
    });

    it('requires a reason, and dispatches it with the recalculate action', () => {
      fixture.detectChanges();
      const dispatchSpy = spyOn(store, 'dispatch');
      dialogSpy.open.and.returnValue({ componentInstance: { onEmitStatusChange: of('The booking was refunded after the original calculation') }, close: () => {} } as any);

      component.recalculate(withBooking);

      const config: any = dialogSpy.open.calls.mostRecent().args[1];
      expect(config.data.requireReason).toBe(true);
      expect(dispatchSpy).toHaveBeenCalledWith(recalculatePayout({ bookingId: 17, reason: 'The booking was refunded after the original calculation' }));
    });
  });
});
