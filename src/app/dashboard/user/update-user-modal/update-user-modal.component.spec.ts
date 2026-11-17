import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { of } from 'rxjs';

import { UpdateUserModalComponent } from './update-user-modal.component';
import { CountryService } from 'src/app/services/country.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserService } from 'src/app/services/user.service';
import { refreshUser } from 'src/app/state/user/user.actions';

describe('UpdateUserModalComponent', () => {
  let component: UpdateUserModalComponent;
  let fixture: ComponentFixture<UpdateUserModalComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let store: MockStore;

  beforeEach(() => {
    userServiceSpy = jasmine.createSpyObj('UserService', ['updateUser', 'setSignupFormIndex', 'getUser']);
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
        provideMockStore(),
        { provide: UserService, useValue: userServiceSpy },
        { provide: CountryService, useValue: countryServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: NgxUiLoaderService, useValue: ngxServiceSpy },
        { provide: SnackBarService, useValue: snackBarSpy },
        { provide: MAT_DIALOG_DATA, useValue: { userData: {} } }
      ]
    });
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(UpdateUserModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // GN-63: this used to call UserService.updateUser() directly with nothing telling the
  // store the profile actually changed, so a saved name/bio/etc. never showed up anywhere
  // (navbar, profile dropdown) until a page reload.
  it('dispatches refreshUser() on a successful save, so the new details show up everywhere without a reload', () => {
    component.updateUserForm.patchValue({
      id: 1, firstname: 'Alex', lastname: 'Beta', phone: '1234567890', postalCode: '12345',
      dob: '1990-01-01', gender: 'male', country: 'Canada', state: 'British Columbia', city: 'Vancouver',
      address: '123 Main Street',
    });
    userServiceSpy.updateUser.and.returnValue(of({ message: 'Account details updated' } as any));

    component.updateUser();

    expect(store.dispatch).toHaveBeenCalledWith(refreshUser());
  });

  it('does not dispatch refreshUser() when the form is invalid', () => {
    component.updateUser();

    expect(store.dispatch).not.toHaveBeenCalledWith(refreshUser());
    expect(userServiceSpy.updateUser).not.toHaveBeenCalled();
  });
});
