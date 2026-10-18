import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';

import { ConnectAccountsListComponent } from './connect-accounts-list.component';
import { StripeService } from 'src/app/services/stripe.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { ConnectAccountSummary } from 'src/app/models/stripe.model';

describe('ConnectAccountsListComponent', () => {
  let component: ConnectAccountsListComponent;
  let fixture: ComponentFixture<ConnectAccountsListComponent>;
  let stripeServiceSpy: jasmine.SpyObj<StripeService>;

  const account: ConnectAccountSummary = {
    partnerId: 1, role: 'trainer', userId: 2, firstname: 'Jane', lastname: 'Doe', email: 'jane@berliz.fitness',
    stripeConnectAccountId: 'acct_123', chargesEnabled: true, payoutsEnabled: false, detailsSubmitted: true, lastUpdate: new Date(),
  };

  beforeEach(() => {
    stripeServiceSpy = jasmine.createSpyObj('StripeService', ['getAllConnectAccounts', 'refreshConnectAccountStatus']);
    stripeServiceSpy.getAllConnectAccounts.and.returnValue(of({ message: '', data: [account], success: true, statusCode: 200 }));

    TestBed.configureTestingModule({
      declarations: [ConnectAccountsListComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: StripeService, useValue: stripeServiceSpy },
        { provide: SnackBarService, useValue: jasmine.createSpyObj('SnackBarService', ['openSnackBar']) },
      ]
    });

    fixture = TestBed.createComponent(ConnectAccountsListComponent);
    component = fixture.componentInstance;
  });

  it('loads Connect accounts on init', () => {
    fixture.detectChanges();
    expect(component.accounts).toEqual([account]);
    expect(component.loading).toBeFalse();
  });

  it('surfaces a load failure instead of silently showing an empty list', () => {
    stripeServiceSpy.getAllConnectAccounts.and.returnValue(throwError(() => ({ error: { message: 'boom' } })));
    fixture.detectChanges();
    expect(component.loadError).toBe('boom');
  });

  it('falls back name -> email -> partner id', () => {
    expect(component.providerName({ ...account, firstname: 'Jane', lastname: 'Doe' })).toBe('Jane Doe');
    expect(component.providerName({ ...account, firstname: null, lastname: null, email: 'jane@berliz.fitness' })).toBe('jane@berliz.fitness');
    expect(component.providerName({ ...account, firstname: null, lastname: null, email: null, partnerId: 7 })).toBe('Partner #7');
  });

  it('replaces the refreshed account in place and clears refreshingId', () => {
    fixture.detectChanges();
    const refreshed = { ...account, payoutsEnabled: true };
    stripeServiceSpy.refreshConnectAccountStatus.and.returnValue(of({ message: 'refreshed', data: refreshed, success: true, statusCode: 200 }));

    component.refresh(account);

    expect(component.refreshingId).toBeNull();
    expect(component.accounts[0].payoutsEnabled).toBeTrue();
  });
});
