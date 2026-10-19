import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';

import { BillingOverviewComponent } from './billing-overview.component';
import { DashboardService } from 'src/app/services/dashboard.service';
import { BillingSummary } from 'src/app/models/billing-summary.model';

describe('BillingOverviewComponent', () => {
  let component: BillingOverviewComponent;
  let fixture: ComponentFixture<BillingOverviewComponent>;
  let dashboardServiceSpy: jasmine.SpyObj<DashboardService>;

  const summary: BillingSummary = {
    grossPaymentVolumeThisMonth: 1500,
    activeSubscriptionCount: 7,
    activeRecurringRevenue: 350,
    payoutsPendingTotal: 200,
    payoutsPaidTotal: 900,
    refundsThisMonthCount: 2,
    refundsThisMonthTotal: 75,
  };

  beforeEach(() => {
    dashboardServiceSpy = jasmine.createSpyObj('DashboardService', ['getBillingSummary']);

    TestBed.configureTestingModule({
      declarations: [BillingOverviewComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: DashboardService, useValue: dashboardServiceSpy },
      ]
    });
  });

  function create() {
    fixture = TestBed.createComponent(BillingOverviewComponent);
    component = fixture.componentInstance;
  }

  it('loads the summary on init and stops loading', () => {
    dashboardServiceSpy.getBillingSummary.and.returnValue(of(summary));
    create();
    fixture.detectChanges();

    expect(component.summary).toEqual(summary);
    expect(component.loading).toBeFalse();
    expect(component.loadError).toBeNull();
  });

  it('surfaces a load failure instead of silently showing zeroes', () => {
    dashboardServiceSpy.getBillingSummary.and.returnValue(throwError(() => ({ error: { message: 'boom' } })));
    create();
    fixture.detectChanges();

    expect(component.summary).toBeNull();
    expect(component.loading).toBeFalse();
    expect(component.loadError).toBe('boom');
  });
});
