import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder } from '@angular/forms';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { CenterLocationsComponent } from './center-locations.component';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { CenterService } from 'src/app/services/center.service';

describe('CenterLocationsComponent', () => {
  let component: CenterLocationsComponent;
  let fixture: ComponentFixture<CenterLocationsComponent>;

  beforeEach(() => {
    const mockNgxUiLoaderService = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);
    const mockSnackBarService = jasmine.createSpyObj('SnackBarService', ['openSnackBar', 'dismiss']);
    const mockCenterService = jasmine.createSpyObj('CenterService', ['addLocation', 'updateLocation', 'deleteLocation']);
    mockCenterService.addLocation.and.returnValue(of({}));
    mockCenterService.updateLocation.and.returnValue(of({}));
    mockCenterService.deleteLocation.and.returnValue(of({}));

    TestBed.configureTestingModule({
      declarations: [CenterLocationsComponent],
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

    fixture = TestBed.createComponent(CenterLocationsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
