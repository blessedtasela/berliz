import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { provideMockStore } from '@ngrx/store/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { of } from 'rxjs';

import { PayoutsListComponent } from './payouts-list.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { Payout } from 'src/app/models/payout.model';

describe('PayoutsListComponent', () => {
  let component: PayoutsListComponent;
  let fixture: ComponentFixture<PayoutsListComponent>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

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
});
