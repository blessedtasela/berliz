import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { SignupComponent } from './signup.component';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CountryService } from 'src/app/services/country.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserService } from 'src/app/services/user.service';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  let userServiceMock: jasmine.SpyObj<UserService>;
  let countryServiceMock: jasmine.SpyObj<CountryService>;
  let snackBarServiceMock: jasmine.SpyObj<SnackBarService>;
  let ngxUiLoaderServiceMock: jasmine.SpyObj<NgxUiLoaderService>;
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(() => {
    userServiceMock = jasmine.createSpyObj('UserService', ['signup', 'setLoginFormIndex']);
    countryServiceMock = jasmine.createSpyObj('CountryService', ['getCountriesData']);
    snackBarServiceMock = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    ngxUiLoaderServiceMock = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [SignupComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        FormBuilder,
        { provide: UserService, useValue: userServiceMock },
        { provide: CountryService, useValue: countryServiceMock },
        { provide: SnackBarService, useValue: snackBarServiceMock },
        { provide: NgxUiLoaderService, useValue: ngxUiLoaderServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    });

    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the SignupComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with required fields', () => {
    expect(component.signupForm).toBeDefined();
    expect(component.signupForm.controls['firstname']).toBeDefined();
    expect(component.signupForm.controls['email']).toBeDefined();
    expect(component.signupForm.controls['password']).toBeDefined();
  });

  it('should validate form inputs', () => {
    component.signupForm.controls['firstname'].setValue('');
    component.signupForm.controls['email'].setValue('invalidemail');
    component.signupForm.controls['password'].setValue('123');
    component.signupForm.controls['confirmPassword'].setValue('123');

    expect(component.signupForm.invalid).toBeTrue();
  });

  // Full, currently-valid payload for signupForm — it groups location fields
  // (country/state/city/countryCode/postalCode/address/phone) under a nested
  // 'location' FormGroup rather than at the top level.
  const validSignupFormValue = {
    firstname: 'John',
    lastname: 'Doe',
    gender: 'Male',
    dob: '1990-01-01',
    // imageValidator() checks the File's MIME type, so it needs an explicit
    // image type — a bare `new File([], 'photo.jpg')` has type '' and fails.
    profilePhoto: new File([], 'photo.jpg', { type: 'image/jpeg' }),
    location: {
      country: 'USA',
      state: 'CA',
      city: 'Los Angeles',
      countryCode: 'US',
      postalCode: '12345',
      address: '123 Main St',
      phone: '123456789'
    },
    email: 'john.doe@example.com',
    password: 'password123',
    confirmPassword: 'password123'
  };

  it('should submit form successfully when valid', () => {
    userServiceMock.signup.and.returnValue(of({
      message: 'Signup successful',
      data: '',
      success: true,
      statusCode: 200
    }));
    component.signupForm.setValue(validSignupFormValue);

    component.submitForm();
    expect(ngxUiLoaderServiceMock.start).toHaveBeenCalled();
    expect(userServiceMock.signup).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
    expect(snackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Signup successful', '');
  });

  it('should handle signup error', () => {
    userServiceMock.signup.and.returnValue(throwError({ error: { message: 'Signup failed' } }));
    component.signupForm.setValue(validSignupFormValue);

    component.submitForm();
    expect(snackBarServiceMock.openSnackBar).toHaveBeenCalledWith('Signup failed', 'error');
  });
});
