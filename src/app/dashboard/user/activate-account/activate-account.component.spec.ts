import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserService } from 'src/app/services/user.service';

import { of, throwError } from 'rxjs';

import { ActivateAccountComponent, isActivated } from './activate-account.component';

describe('ActivateAccountComponent', () => {
  let component: ActivateAccountComponent;
  let fixture: ComponentFixture<ActivateAccountComponent>;

  function configure(queryParams: Record<string, string> = {}) {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      declarations: [ActivateAccountComponent],
      imports: [ReactiveFormsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) },
        { provide: NgxUiLoaderService, useValue: jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']) },
        { provide: SnackBarService, useValue: jasmine.createSpyObj('SnackBarService', ['openSnackBar']) },
        { provide: UserService, useValue: jasmine.createSpyObj('UserService', ['activateAccount']) },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap(queryParams) } } },
      ]
    });
    fixture = TestBed.createComponent(ActivateAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => configure());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('leaves the resend email blank when arriving with no ?email= (e.g. "Back to login" then here directly)', () => {
    expect(component.knownEmail).toBeNull();
    expect(component.resendForm.value.email).toBe('');
  });

  it('pre-fills the resend email when arriving straight from signup with ?email=', () => {
    configure({ email: 'new.user@example.com' });

    expect(component.knownEmail).toBe('new.user@example.com');
    expect(component.resendForm.value.email).toBe('new.user@example.com');
  });

  describe('activating with the emailed code', () => {
    let userService: jasmine.SpyObj<UserService>;
    let router: jasmine.SpyObj<Router>;

    beforeEach(() => {
      userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
      router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    });

    it('goes to login only when the server really activated the account', () => {
      userService.activateAccount.and.returnValue(of({ message: 'Account activated', data: 'Account activated successfully', success: true, statusCode: 200 }));
      component.activateAccountForm.setValue({ token: '12345678' });
      component.submitForm();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
      expect(component.submitError).toBeNull();
    });

    it('does not call a wrong code "activated", even if an older server still answers 200', () => {
      userService.activateAccount.and.returnValue(of({ message: 'Account activated', data: 'Invalid or expired token', success: true, statusCode: 200 }));
      component.activateAccountForm.setValue({ token: '00000000' });
      component.submitForm();
      expect(router.navigate).not.toHaveBeenCalled();
      expect(component.submitError).toBe('Invalid or expired token');
    });

    it('shows the server message when it refuses the code', () => {
      userService.activateAccount.and.returnValue(throwError(() => ({ error: { message: "That activation code isn't right." } })));
      component.activateAccountForm.setValue({ token: '00000000' });
      component.submitForm();
      expect(component.submitError).toBe("That activation code isn't right.");
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('sends the code without the spaces or line breaks a copy-paste brings along', () => {
      userService.activateAccount.and.returnValue(of({ message: '', data: 'Account activated successfully', success: true, statusCode: 200 }));
      component.activateAccountForm.setValue({ token: ' 1234 5678\n' });
      component.submitForm();
      expect(userService.activateAccount).toHaveBeenCalledWith(jasmine.objectContaining({ token: '12345678' }));
    });

    it('asks for the whole code rather than sending a short one', () => {
      component.activateAccountForm.setValue({ token: '1234 567 ' });
      component.submitForm();
      expect(userService.activateAccount).not.toHaveBeenCalled();
      expect(component.submitError).toContain('8-digit');
    });

    it('recognises only the real success answer', () => {
      expect(isActivated({ data: 'Account activated successfully' })).toBeTrue();
      expect(isActivated({ data: 'Invalid or expired token' })).toBeFalse();
      expect(isActivated(null)).toBeFalse();
    });
  });
});
