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
});
