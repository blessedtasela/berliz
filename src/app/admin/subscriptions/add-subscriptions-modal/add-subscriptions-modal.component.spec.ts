import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { provideMockStore } from '@ngrx/store/testing';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { AddSubscriptionsModalComponent } from './add-subscriptions-modal.component';
import { SubscriptionService } from 'src/app/services/subscription.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

describe('AddSubscriptionsModalComponent', () => {
  let component: AddSubscriptionsModalComponent;
  let fixture: ComponentFixture<AddSubscriptionsModalComponent>;

  beforeEach(() => {
    const subscriptionServiceSpy = jasmine.createSpyObj('SubscriptionService', ['addSubscription']);
    const ngxServiceSpy = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);
    const snackbarServiceSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    TestBed.configureTestingModule({
      declarations: [AddSubscriptionsModalComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        FormBuilder,
        provideMockStore(),
        { provide: SubscriptionService, useValue: subscriptionServiceSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: NgxUiLoaderService, useValue: ngxServiceSpy },
        { provide: SnackBarService, useValue: snackbarServiceSpy }
      ]
    });
    fixture = TestBed.createComponent(AddSubscriptionsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
