import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Actions } from '@ngrx/effects';
import { Subject, of } from 'rxjs';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { UserProfileSettingsComponent } from './user-profile-settings.component';
import { UserService } from 'src/app/services/user.service';
import { CountryService } from 'src/app/services/country.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { SidebarStateService } from 'src/app/services/sidebar-state.service';
import { updateMessagePopupEnabled } from 'src/app/state/user-profile/user-profile.actions';

describe('UserProfileSettingsComponent', () => {
  let component: UserProfileSettingsComponent;
  let fixture: ComponentFixture<UserProfileSettingsComponent>;
  let store: MockStore;

  beforeEach(() => {
    const userServiceSpy = jasmine.createSpyObj('UserService', ['updateUser']);
    const countryServiceSpy = jasmine.createSpyObj('CountryService', ['getCountries']);
    countryServiceSpy.getCountries.and.returnValue(of([]));
    const ngxServiceSpy = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);
    const snackbarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const sidebarStateSpy = jasmine.createSpyObj('SidebarStateService', ['setMode'],
      { mode$: of('collapsed'), mobileOverlayOpen$: of(false) });

    TestBed.configureTestingModule({
      declarations: [UserProfileSettingsComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        FormBuilder,
        provideMockStore(),
        { provide: Actions, useValue: new Subject() },
        { provide: UserService, useValue: userServiceSpy },
        { provide: CountryService, useValue: countryServiceSpy },
        { provide: NgxUiLoaderService, useValue: ngxServiceSpy },
        { provide: SnackBarService, useValue: snackbarSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: Router, useValue: routerSpy },
        { provide: SidebarStateService, useValue: sidebarStateSpy }
      ]
    });
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch').and.callThrough();

    fixture = TestBed.createComponent(UserProfileSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('toggleMessagePopupEnabled dispatches updateMessagePopupEnabled with the flipped value', () => {
    (store.dispatch as jasmine.Spy).calls.reset();

    component.toggleMessagePopupEnabled();

    expect(store.dispatch).toHaveBeenCalledWith(
      updateMessagePopupEnabled({ messagePopupEnabled: !component.messagePopupEnabled })
    );
  });
});
