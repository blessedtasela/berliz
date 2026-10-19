import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { AdminUpdateUserRoleModalComponent } from './admin-update-user-role-modal.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserService } from 'src/app/services/user.service';

describe('AdminUpdateUserRoleModalComponent', () => {
  let component: AdminUpdateUserRoleModalComponent;
  let fixture: ComponentFixture<AdminUpdateUserRoleModalComponent>;

  beforeEach(() => {
    const userServiceSpy = jasmine.createSpyObj('UserService', ['updateUserRole']);
    const ngxServiceSpy = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);
    const snackbarServiceSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    TestBed.configureTestingModule({
      declarations: [AdminUpdateUserRoleModalComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        FormBuilder,
        { provide: UserService, useValue: userServiceSpy },
        { provide: NgxUiLoaderService, useValue: ngxServiceSpy },
        { provide: SnackBarService, useValue: snackbarServiceSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: { userData: {} } }
      ]
    });
    fixture = TestBed.createComponent(AdminUpdateUserRoleModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('who may assign the admin role', () => {
    const tokenFor = (claims: object) => {
      const b64 = (o: object) => btoa(JSON.stringify(o)).replace(/=+$/, '');
      return b64({ alg: 'HS256' }) + '.' + b64(claims) + '.sig';
    };

    function create(token: string | null, userData: any) {
      TestBed.resetTestingModule();
      const dialogData = { userData };
      if (token) localStorage.setItem('token', token); else localStorage.removeItem('token');
      TestBed.configureTestingModule({
        declarations: [AdminUpdateUserRoleModalComponent],
        schemas: [NO_ERRORS_SCHEMA],
        providers: [
          FormBuilder,
          { provide: UserService, useValue: jasmine.createSpyObj('UserService', ['updateUserRole']) },
          { provide: NgxUiLoaderService, useValue: jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']) },
          { provide: SnackBarService, useValue: jasmine.createSpyObj('SnackBarService', ['openSnackBar']) },
          { provide: MatDialogRef, useValue: jasmine.createSpyObj('MatDialogRef', ['close']) },
          { provide: MAT_DIALOG_DATA, useValue: dialogData },
        ],
      });
      const f2 = TestBed.createComponent(AdminUpdateUserRoleModalComponent);
      f2.detectChanges();
      return f2.componentInstance;
    }

    afterEach(() => localStorage.removeItem('token'));

    it('offers "admin" only to the super admin', () => {
      expect(create(tokenFor({ role: 'admin', superAdmin: true }), { role: 'client' }).roles.map(r => r.role)).toContain('admin');
      expect(create(tokenFor({ role: 'admin' }), { role: 'client' }).roles.map(r => r.role)).not.toContain('admin');
      expect(create(null, { role: 'client' }).roles.map(r => r.role)).not.toContain('admin');
    });

    it('locks the role of an admin account for an admin who is not the super admin', () => {
      const plain = create(tokenFor({ role: 'admin' }), { role: 'admin' });
      expect(plain.locked).toBeTrue();
      const service = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
      plain.updateUserRole();
      expect(service.updateUserRole).not.toHaveBeenCalled();
      expect(create(tokenFor({ role: 'admin', superAdmin: true }), { role: 'admin' }).locked).toBeFalse();
    });

    it('does not lock ordinary accounts', () => {
      expect(create(tokenFor({ role: 'admin' }), { role: 'trainer' }).locked).toBeFalse();
    });
  });
});
