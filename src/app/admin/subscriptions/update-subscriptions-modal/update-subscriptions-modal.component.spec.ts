import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideMockStore } from '@ngrx/store/testing';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { UpdateSubscriptionsModalComponent } from './update-subscriptions-modal.component';
import { SubscriptionService } from 'src/app/services/subscription.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

describe('UpdateSubscriptionsModalComponent', () => {
  let component: UpdateSubscriptionsModalComponent;
  let fixture: ComponentFixture<UpdateSubscriptionsModalComponent>;

  beforeEach(() => {
    const subscriptionServiceSpy = jasmine.createSpyObj('SubscriptionService', ['updateSubscription']);
    const ngxServiceSpy = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);
    const snackbarServiceSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    TestBed.configureTestingModule({
      declarations: [UpdateSubscriptionsModalComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        FormBuilder,
        provideMockStore(),
        { provide: SubscriptionService, useValue: subscriptionServiceSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: NgxUiLoaderService, useValue: ngxServiceSpy },
        { provide: SnackBarService, useValue: snackbarServiceSpy },
        {
          provide: MAT_DIALOG_DATA, useValue: {
            subscriptionData: { id: 1, amount: 0, months: 1, mode: 'online', trainer: null, center: null, categories: [], user: { id: 1 } }
          }
        }
      ]
    });
    fixture = TestBed.createComponent(UpdateSubscriptionsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
