import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { DeleteAccountModalComponent } from './delete-account-modal.component';
import { AccountService } from 'src/app/services/account.service';
import { AuthService } from 'src/app/services/auth.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

describe('DeleteAccountModalComponent', () => {
  let component: DeleteAccountModalComponent;
  let fixture: ComponentFixture<DeleteAccountModalComponent>;
  let accountService: jasmine.SpyObj<AccountService>;
  let auth: jasmine.SpyObj<AuthService>;
  let snackbar: jasmine.SpyObj<SnackBarService>;
  let router: jasmine.SpyObj<Router>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<DeleteAccountModalComponent>>;

  const ok = { message: 'Your account has been deleted.', success: true, statusCode: 200, data: { deleted: true, message: 'Your account has been deleted.' } };
  const refused = (message: string) => ({ message, success: false, statusCode: 200, data: { deleted: false, message } });

  beforeEach(() => {
    accountService = jasmine.createSpyObj('AccountService', ['deleteMyAccount']);
    auth = jasmine.createSpyObj('AuthService', ['clearTokens']);
    snackbar = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    router = jasmine.createSpyObj('Router', ['navigate']);
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    TestBed.configureTestingModule({
      declarations: [DeleteAccountModalComponent],
      imports: [FormsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: AccountService, useValue: accountService },
        { provide: AuthService, useValue: auth },
        { provide: SnackBarService, useValue: snackbar },
        { provide: Router, useValue: router },
        { provide: MatDialogRef, useValue: dialogRef }
      ]
    });
    fixture = TestBed.createComponent(DeleteAccountModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('keeps the delete button locked until DELETE is typed (any case, extra spaces ignored)', () => {
    expect(component.canSubmit).toBeFalse();

    component.confirmText = 'delet';
    expect(component.canSubmit).toBeFalse();

    component.confirmText = ' delete ';
    expect(component.canSubmit).toBeTrue();
  });

  it('does nothing when submitted while still locked', () => {
    component.submit();
    expect(accountService.deleteMyAccount).not.toHaveBeenCalled();
  });

  it('deletes: drops the session, closes, says so and leaves the signed-in area', () => {
    accountService.deleteMyAccount.and.returnValue(of(ok));
    component.confirmText = 'DELETE';
    component.password = 'secret';

    component.submit();

    expect(accountService.deleteMyAccount).toHaveBeenCalledWith('secret');
    expect(auth.clearTokens).toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalledWith(true);
    expect(snackbar.openSnackBar).toHaveBeenCalledWith('Your account has been deleted.', '');
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
    expect(component.submitting).toBeFalse();
  });

  it('a refusal (HTTP 200, success false) stays open and shows the reason inline -- the session is kept', () => {
    accountService.deleteMyAccount.and.returnValue(of(refused('You still have upcoming bookings. Cancel or complete them first.')));
    component.confirmText = 'DELETE';

    component.submit();

    expect(component.problem).toBe('You still have upcoming bookings. Cancel or complete them first.');
    expect(auth.clearTokens).not.toHaveBeenCalled();
    expect(dialogRef.close).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(component.submitting).toBeFalse();
  });

  it('a wrong password is explained and the person can try again', () => {
    accountService.deleteMyAccount.and.returnValue(of(refused('Enter your current password to delete your account.')));
    component.confirmText = 'DELETE';

    component.submit();
    expect(component.problem).toContain('current password');

    accountService.deleteMyAccount.and.returnValue(of(ok));
    component.password = 'right';
    component.submit();

    expect(component.problem).toBeNull();
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('a failed request shows the server message when there is one, and keeps the session', () => {
    accountService.deleteMyAccount.and.returnValue(throwError(() => ({ error: { message: 'Something went wrong' } })));
    component.confirmText = 'DELETE';

    component.submit();

    expect(component.problem).toBe('Something went wrong');
    expect(auth.clearTokens).not.toHaveBeenCalled();
    expect(component.submitting).toBeFalse();
  });

  it('cannot be closed mid-delete', () => {
    component.submitting = true;
    component.closeDialog();
    expect(dialogRef.close).not.toHaveBeenCalled();

    component.submitting = false;
    component.closeDialog();
    expect(dialogRef.close).toHaveBeenCalledWith(false);
  });
});
