import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { of } from 'rxjs';

import { UpdateUserModalComponent } from './update-user-modal.component';
import { CountryService } from 'src/app/services/country.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserService } from 'src/app/services/user.service';

describe('UpdateUserModalComponent', () => {
  let component: UpdateUserModalComponent;
  let fixture: ComponentFixture<UpdateUserModalComponent>;

  beforeEach(() => {
    const userServiceSpy = jasmine.createSpyObj('UserService', ['updateUser', 'setSignupFormIndex', 'getUser']);
    const countryServiceSpy = jasmine.createSpyObj('CountryService', ['getCountriesData']);
    countryServiceSpy.getCountriesData.and.returnValue(of([]));
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    const ngxServiceSpy = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);
    const snackBarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);

    TestBed.configureTestingModule({
      declarations: [UpdateUserModalComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        FormBuilder,
        { provide: UserService, useValue: userServiceSpy },
        { provide: CountryService, useValue: countryServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: NgxUiLoaderService, useValue: ngxServiceSpy },
        { provide: SnackBarService, useValue: snackBarSpy },
        { provide: MAT_DIALOG_DATA, useValue: { userData: {} } }
      ]
    });
    fixture = TestBed.createComponent(UpdateUserModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
