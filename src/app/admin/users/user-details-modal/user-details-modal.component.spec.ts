import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { of, throwError } from 'rxjs';

import { UserDetailsModalComponent } from './user-details-modal.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserService } from 'src/app/services/user.service';
import { AuthService } from 'src/app/services/auth.service';

describe('UserDetailsModalComponent', () => {
  let component: UserDetailsModalComponent;

  afterEach(() => localStorage.removeItem('token'));

  function create(userData: any, token: string | null = null) {
    TestBed.resetTestingModule();
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    const ngxServiceSpy = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);
    const snackBarServiceSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    const userServiceSpy = jasmine.createSpyObj('UserService', ['forcePasswordChange', 'overrideTrialRisk', 'impersonate']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUserEmail', 'startImpersonation']);
    authServiceSpy.getCurrentUserEmail.and.returnValue(null);
    if (token) localStorage.setItem('token', token); else localStorage.removeItem('token');

    TestBed.configureTestingModule({
      declarations: [UserDetailsModalComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        DatePipe,
        FormBuilder,
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: NgxUiLoaderService, useValue: ngxServiceSpy },
        { provide: SnackBarService, useValue: snackBarServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: MAT_DIALOG_DATA, useValue: { userData: { date: new Date().toISOString(), lastUpdate: new Date().toISOString(), ...userData }, photo: '' } }
      ]
    });
    const fx = TestBed.createComponent(UserDetailsModalComponent);
    fx.detectChanges();
    return { component: fx.componentInstance, userServiceSpy, snackBarServiceSpy, authServiceSpy };
  }

  const tokenFor = (claims: object) => {
    const b64 = (o: object) => btoa(JSON.stringify(o)).replace(/=+$/, '');
    return b64({ alg: 'HS256' }) + '.' + b64(claims) + '.sig';
  };

  beforeEach(() => {
    component = create({}).component;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('PY-32: trial risk', () => {
    it('splits multi-line reasons into a list, and reads empty with no assessment at all', () => {
      expect(create({}).component.trialRiskReasonsList).toEqual([]);
      const { component: withReasons } = create({ trialRiskBand: 'HIGH', trialRiskReasons: 'Same device\nDisposable email' });
      expect(withReasons.trialRiskReasonsList).toEqual(['Same device', 'Disposable email']);
    });

    it('only a super admin sees isSuperAdmin true', () => {
      expect(create({}, tokenFor({ role: 'admin', superAdmin: true })).component.isSuperAdmin).toBeTrue();
      expect(create({}, tokenFor({ role: 'admin' })).component.isSuperAdmin).toBeFalse();
      expect(create({}).component.isSuperAdmin).toBeFalse();
    });

    it('overrideTrialRisk calls the service and shows its response', () => {
      const { component: c, userServiceSpy, snackBarServiceSpy } = create({ id: 7, trialRiskBand: 'HIGH' }, tokenFor({ superAdmin: true }));
      userServiceSpy.overrideTrialRisk.and.returnValue(of({ data: 'Approved.', message: 'Approved.', success: true, statusCode: 200 }));

      c.overrideTrialRisk();

      expect(userServiceSpy.overrideTrialRisk).toHaveBeenCalledWith(7);
      expect(snackBarServiceSpy.openSnackBar).toHaveBeenCalledWith('Approved.', '');
      expect(c.overridingTrialRisk).toBeFalse();
    });

    it('overrideTrialRisk surfaces a refusal from the server instead of silently succeeding', () => {
      const { component: c, userServiceSpy, snackBarServiceSpy } = create({ id: 7, trialRiskBand: 'HIGH' });
      userServiceSpy.overrideTrialRisk.and.returnValue(throwError({ error: { message: 'You are not authorized to make this request' } }));

      c.overrideTrialRisk();

      expect(snackBarServiceSpy.openSnackBar).toHaveBeenCalledWith('You are not authorized to make this request', '');
      expect(c.overridingTrialRisk).toBeFalse();
    });
  });

  describe('GN-78: impersonation', () => {
    it('canImpersonate is false for a non-super-admin, even looking at someone else', () => {
      const { component: c } = create({ id: 7, email: 'trainer@example.com' });
      expect(c.canImpersonate).toBeFalse();
    });

    it('canImpersonate is false for the super admin looking at their own account', () => {
      const { component: c, authServiceSpy } = create({ id: 1, email: 'admin@example.com' }, tokenFor({ superAdmin: true }));
      authServiceSpy.getCurrentUserEmail.and.returnValue('admin@example.com');

      expect(c.canImpersonate).toBeFalse();
    });

    it('canImpersonate is true for the super admin looking at someone else', () => {
      const { component: c, authServiceSpy } = create({ id: 7, email: 'trainer@example.com' }, tokenFor({ superAdmin: true }));
      authServiceSpy.getCurrentUserEmail.and.returnValue('admin@example.com');

      expect(c.canImpersonate).toBeTrue();
    });

    it('impersonateUser swaps in the returned tokens and hard-navigates to the dashboard', () => {
      const { component: c, userServiceSpy, authServiceSpy } = create({ id: 7, email: 'trainer@example.com' }, tokenFor({ superAdmin: true }));
      authServiceSpy.getCurrentUserEmail.and.returnValue('admin@example.com');
      userServiceSpy.impersonate.and.returnValue(of({ data: { accessToken: 'a', refreshToken: 'r' }, message: 'Impersonation started', success: true, statusCode: 200 }));
      spyOn<any>(c, 'hardNavigateTo');

      c.impersonateUser();

      expect(userServiceSpy.impersonate).toHaveBeenCalledWith(7);
      expect(authServiceSpy.startImpersonation).toHaveBeenCalledWith('a', 'r');
      expect((c as any).hardNavigateTo).toHaveBeenCalledWith('/dashboard');
    });

    it('impersonateUser surfaces a refusal instead of swapping tokens', () => {
      const { component: c, userServiceSpy, authServiceSpy, snackBarServiceSpy } = create({ id: 7, email: 'trainer@example.com' }, tokenFor({ superAdmin: true }));
      authServiceSpy.getCurrentUserEmail.and.returnValue('admin@example.com');
      userServiceSpy.impersonate.and.returnValue(throwError({ error: { message: 'You are not authorized to make this request' } }));

      c.impersonateUser();

      expect(authServiceSpy.startImpersonation).not.toHaveBeenCalled();
      expect(snackBarServiceSpy.openSnackBar).toHaveBeenCalledWith('You are not authorized to make this request', '');
      expect(c.impersonating).toBeFalse();
    });

    it('does nothing when canImpersonate is false, even if called directly', () => {
      const { component: c, userServiceSpy } = create({ id: 7, email: 'trainer@example.com' });

      c.impersonateUser();

      expect(userServiceSpy.impersonate).not.toHaveBeenCalled();
    });
  });
});
