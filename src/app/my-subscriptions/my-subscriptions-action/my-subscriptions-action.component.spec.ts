import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { MySubscriptionsActionComponent } from './my-subscriptions-action.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { SubscriptionService } from 'src/app/services/subscription.service';

describe('MySubscriptionsActionComponent', () => {
  let component: MySubscriptionsActionComponent;
  let fixture: ComponentFixture<MySubscriptionsActionComponent>;

  beforeEach(() => {
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const subscriptionServiceSpy = jasmine.createSpyObj('SubscriptionService', ['deleteSubscription']);
    const snackbarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    const loaderSpy = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);

    TestBed.configureTestingModule({
      declarations: [MySubscriptionsActionComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: MatDialog, useValue: dialogSpy },
        { provide: SubscriptionService, useValue: subscriptionServiceSpy },
        { provide: SnackBarService, useValue: snackbarSpy },
        { provide: NgxUiLoaderService, useValue: loaderSpy }
      ]
    });
    fixture = TestBed.createComponent(MySubscriptionsActionComponent);
    component = fixture.componentInstance;
    component.subscription = { id: 1 } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
