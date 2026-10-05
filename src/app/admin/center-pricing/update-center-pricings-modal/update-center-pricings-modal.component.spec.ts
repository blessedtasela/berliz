import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { UpdateCenterPricingsModalComponent } from './update-center-pricings-modal.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('UpdateCenterPricingsModalComponent', () => {
  let component: UpdateCenterPricingsModalComponent;
  let fixture: ComponentFixture<UpdateCenterPricingsModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    declarations: [UpdateCenterPricingsModalComponent],
    schemas: [NO_ERRORS_SCHEMA],
    imports: [],
    providers: [
        { provide: MatDialogRef, useValue: jasmine.createSpyObj('MatDialogRef', ['close']) },
        {
            provide: MAT_DIALOG_DATA,
            useValue: {
                centerPricingData: {
                    id: 1, price: 10, discount3Months: 0, discount6Months: 0,
                    discount9Months: 0, discount12Months: 0, discount2Programs: 0
                }
            }
        },
        { provide: NgxUiLoaderService, useValue: jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']) },
        { provide: SnackBarService, useValue: jasmine.createSpyObj('SnackBarService', ['openSnackBar']) },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
});
    fixture = TestBed.createComponent(UpdateCenterPricingsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
