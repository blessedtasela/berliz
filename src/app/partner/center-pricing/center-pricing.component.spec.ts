import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder } from '@angular/forms';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { CenterPricingComponent } from './center-pricing.component';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { CenterService } from 'src/app/services/center.service';

describe('CenterPricingComponent', () => {
  let component: CenterPricingComponent;
  let fixture: ComponentFixture<CenterPricingComponent>;

  beforeEach(() => {
    const mockNgxUiLoaderService = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);
    const mockSnackBarService = jasmine.createSpyObj('SnackBarService', ['openSnackBar', 'dismiss']);
    const mockCenterService = jasmine.createSpyObj('CenterService', ['addPricing', 'updatePricing']);
    mockCenterService.addPricing.and.returnValue(of({}));
    mockCenterService.updatePricing.and.returnValue(of({}));

    TestBed.configureTestingModule({
      declarations: [CenterPricingComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        FormBuilder,
        DatePipe,
        provideMockStore(),
        { provide: NgxUiLoaderService, useValue: mockNgxUiLoaderService },
        { provide: SnackBarService, useValue: mockSnackBarService },
        { provide: CenterService, useValue: mockCenterService },
      ]
    });

    fixture = TestBed.createComponent(CenterPricingComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
