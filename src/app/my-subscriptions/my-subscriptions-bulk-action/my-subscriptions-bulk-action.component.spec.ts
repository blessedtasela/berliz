import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { MySubscriptionsBulkActionComponent } from './my-subscriptions-bulk-action.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { SubscriptionService } from 'src/app/services/subscription.service';

describe('MySubscriptionsBulkActionComponent', () => {
  let component: MySubscriptionsBulkActionComponent;
  let fixture: ComponentFixture<MySubscriptionsBulkActionComponent>;

  beforeEach(() => {
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const subscriptionServiceSpy = jasmine.createSpyObj('SubscriptionService', ['bulkAction']);
    const snackbarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    const loaderSpy = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);

    TestBed.configureTestingModule({
      declarations: [MySubscriptionsBulkActionComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: MatDialog, useValue: dialogSpy },
        { provide: SubscriptionService, useValue: subscriptionServiceSpy },
        { provide: SnackBarService, useValue: snackbarSpy },
        { provide: NgxUiLoaderService, useValue: loaderSpy }
      ]
    });
    fixture = TestBed.createComponent(MySubscriptionsBulkActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
