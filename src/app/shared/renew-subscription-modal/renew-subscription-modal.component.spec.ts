import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { RenewSubscriptionModalComponent } from './renew-subscription-modal.component';
import { SubscriptionService } from 'src/app/services/subscription.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

describe('RenewSubscriptionModalComponent', () => {
  let component: RenewSubscriptionModalComponent;
  let fixture: ComponentFixture<RenewSubscriptionModalComponent>;

  beforeEach(() => {
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    const subscriptionServiceSpy = jasmine.createSpyObj('SubscriptionService', ['renewSubscription']);
    const ngxServiceSpy = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);
    const snackbarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);

    TestBed.configureTestingModule({
      declarations: [RenewSubscriptionModalComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: SubscriptionService, useValue: subscriptionServiceSpy },
        { provide: NgxUiLoaderService, useValue: ngxServiceSpy },
        { provide: SnackBarService, useValue: snackbarSpy },
        { provide: MAT_DIALOG_DATA, useValue: { subscription: { id: 1, plan: 'Monthly', endDate: new Date().toISOString() } } }
      ]
    });
    fixture = TestBed.createComponent(RenewSubscriptionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('is not flagged as currently active when the subscription has already expired', () => {
    expect(component.isCurrentlyActive).toBeFalse();
  });
});

describe('RenewSubscriptionModalComponent, with an active subscription', () => {
  let component: RenewSubscriptionModalComponent;

  beforeEach(() => {
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    const subscriptionServiceSpy = jasmine.createSpyObj('SubscriptionService', ['renewSubscription']);
    const ngxServiceSpy = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);
    const snackbarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);

    const futureEndDate = new Date();
    futureEndDate.setMonth(futureEndDate.getMonth() + 2);

    TestBed.configureTestingModule({
      declarations: [RenewSubscriptionModalComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: SubscriptionService, useValue: subscriptionServiceSpy },
        { provide: NgxUiLoaderService, useValue: ngxServiceSpy },
        { provide: SnackBarService, useValue: snackbarSpy },
        {
          provide: MAT_DIALOG_DATA,
          useValue: { subscription: { id: 1, plan: 'Monthly', status: 'true', endDate: futureEndDate.toISOString() } }
        }
      ]
    });
    const fixture: ComponentFixture<RenewSubscriptionModalComponent> = TestBed.createComponent(RenewSubscriptionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('flags the subscription as currently active', () => {
    expect(component.isCurrentlyActive).toBeTrue();
  });

  it('previews the new end date as extending from the CURRENT end date, not from today', () => {
    component.durationMonths = 1;
    const currentEnd = new Date(component.data.subscription.endDate);
    const expected = new Date(currentEnd);
    expected.setMonth(expected.getMonth() + 1);

    expect(component.newEndDatePreview.getMonth()).toBe(expected.getMonth());
    expect(component.newEndDatePreview.getFullYear()).toBe(expected.getFullYear());
  });
});
