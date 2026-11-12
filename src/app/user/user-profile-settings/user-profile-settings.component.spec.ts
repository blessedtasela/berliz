import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Actions } from '@ngrx/effects';
import { Subject, of, throwError } from 'rxjs';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { UserProfileSettingsComponent } from './user-profile-settings.component';
import { UserService } from 'src/app/services/user.service';
import { CountryService } from 'src/app/services/country.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { SidebarStateService } from 'src/app/services/sidebar-state.service';
import { BlockService } from 'src/app/services/block.service';
import { WebAuthnService } from 'src/app/services/webauthn.service';
import { updateMessagePopupEnabled, updateEmailNotificationPreferences } from 'src/app/state/user-profile/user-profile.actions';
import { Users } from 'src/app/models/users.interface';

describe('UserProfileSettingsComponent', () => {
  let component: UserProfileSettingsComponent;
  let fixture: ComponentFixture<UserProfileSettingsComponent>;
  let store: MockStore;

  beforeEach(() => {
    const userServiceSpy = jasmine.createSpyObj('UserService', ['updateUser', 'updateShowAchievements']);
    const countryServiceSpy = jasmine.createSpyObj('CountryService', ['getCountries']);
    countryServiceSpy.getCountries.and.returnValue(of([]));
    const ngxServiceSpy = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);
    const snackbarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const sidebarStateSpy = jasmine.createSpyObj('SidebarStateService', ['setMode'],
      { mode$: of('collapsed'), mobileOverlayOpen$: of(false) });
    const blockServiceSpy = jasmine.createSpyObj('BlockService', ['getBlockedUsers', 'unblockUser']);
    blockServiceSpy.getBlockedUsers.and.returnValue(of({ data: [], message: '', success: true, statusCode: 200 }));
    const webAuthnServiceSpy = jasmine.createSpyObj('WebAuthnService',
      ['getMyCredentials', 'registerPasskey', 'deleteCredential', 'isPlatformAuthenticatorAvailable']);
    webAuthnServiceSpy.getMyCredentials.and.returnValue(of({ data: [], message: '', success: true, statusCode: 200 }));

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
        { provide: SidebarStateService, useValue: sidebarStateSpy },
        { provide: BlockService, useValue: blockServiceSpy },
        { provide: WebAuthnService, useValue: webAuthnServiceSpy }
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

  /**
   * PF-52: phone, postal code, country, state, city, address and bio are exactly the fields
   * the reduced-friction sign-up already defers to "complete your profile" -- but this form's
   * own validators required all of them anyway. A quick-signup account with none of them set
   * had a permanently invalid form, so Save never enabled no matter what was actually typed
   * into firstname/lastname/dob/bio, and nothing could ever be saved.
   */
  describe('a quick-signup account with no phone/location/address/bio set (PF-52)', () => {
    const bareUser: Partial<Users> = {
      id: 1,
      firstname: 'Rish',
      lastname: 'Client',
      dob: '1995-05-05',
      gender: 'Male',
      email: 'rish@example.com',
      phone: null as any,
      postalCode: null as any,
      country: null as any,
      state: null as any,
      city: null as any,
      address: null as any,
      bio: null as any,
    };

    it('builds a valid form even though phone/location/address/bio are unset', () => {
      component.user = bareUser as Users;
      (component as any).initOrPatchForm();

      expect(component.updateUserForm.valid).toBeTrue();
    });

    it('lets a name/DOB/bio edit actually save', () => {
      component.user = bareUser as Users;
      (component as any).initOrPatchForm();

      const userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
      userService.updateUser.and.returnValue(of({ message: 'Profile details saved', data: '', success: true, statusCode: 200 }));

      component.updateUserForm.patchValue({ firstname: 'Rishabh', bio: 'Training for a marathon.' });
      component.updateUserForm.markAsDirty();
      component.onSubmitForm();

      expect(userService.updateUser).toHaveBeenCalled();
    });
  });

  it('shows achievements by default and sends the flipped value when the switch is used', () => {
    const userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    userService.updateShowAchievements.and.returnValue(of({ data: 'Achievements hidden on your public profile', message: '', success: true, statusCode: 200 }));
    expect(component.showAchievements).toBeTrue();

    component.toggleShowAchievements();

    expect(userService.updateShowAchievements).toHaveBeenCalledOnceWith(false);
    expect(component.showAchievements).toBeFalse();
    expect(component.savingShowAchievements).toBeFalse();
  });

  it('keeps the old achievements setting and reports the error when saving fails', () => {
    const userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    const snackbar = TestBed.inject(SnackBarService) as jasmine.SpyObj<SnackBarService>;
    userService.updateShowAchievements.and.returnValue(throwError(() => ({ error: { message: 'Server unavailable' } })));

    component.toggleShowAchievements();

    expect(component.showAchievements).toBeTrue();
    expect(component.savingShowAchievements).toBeFalse();
    expect(snackbar.openSnackBar).toHaveBeenCalledWith('Server unavailable', 'error');
  });

  it('toggleMessagePopupEnabled dispatches updateMessagePopupEnabled with the flipped value', () => {
    (store.dispatch as jasmine.Spy).calls.reset();

    component.toggleMessagePopupEnabled();

    expect(store.dispatch).toHaveBeenCalledWith(
      updateMessagePopupEnabled({ messagePopupEnabled: !component.messagePopupEnabled })
    );
  });

  it('emailNotifySocial defaults to off, unlike the other three email categories', () => {
    expect(component.emailNotifySocial).toBeFalse();
    expect(component.emailNotifyMessages).toBeTrue();
    expect(component.emailNotifyBookings).toBeTrue();
    expect(component.emailNotifyAccount).toBeTrue();
  });

  it('toggleEmailNotifySocial dispatches updateEmailNotificationPreferences with the flipped value', () => {
    (store.dispatch as jasmine.Spy).calls.reset();

    component.toggleEmailNotifySocial();

    expect(store.dispatch).toHaveBeenCalledWith(
      updateEmailNotificationPreferences({ preferences: { emailNotifySocial: true } })
    );
  });

  it('allEmailNotificationsEnabled is false until social is also turned on', () => {
    expect(component.allEmailNotificationsEnabled).toBeFalse();
  });

  it('setAllEmailNotifications(true) dispatches all four categories, including social', () => {
    (store.dispatch as jasmine.Spy).calls.reset();

    component.setAllEmailNotifications(true);

    expect(store.dispatch).toHaveBeenCalledWith(updateEmailNotificationPreferences({
      preferences: {
        emailNotifyMessages: true,
        emailNotifyBookings: true,
        emailNotifyAccount: true,
        emailNotifySocial: true,
      }
    }));
  });
});
