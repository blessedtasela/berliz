import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';

import { UserService } from 'src/app/services/user.service';
import { DeleteAccountDialogComponent } from './delete-account-dialog.component';

describe('DeleteAccountDialogComponent', () => {
  let component: DeleteAccountDialogComponent;
  let fixture: ComponentFixture<DeleteAccountDialogComponent>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<DeleteAccountDialogComponent, boolean>>;
  let userService: jasmine.SpyObj<UserService>;

  const reply = (deleted: boolean, message = '') =>
    of({ success: true, statusCode: 200, message, data: { deleted, message } });

  beforeEach(() => {
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    userService = jasmine.createSpyObj('UserService', ['deleteMyAccount']);

    TestBed.configureTestingModule({
      imports: [DeleteAccountDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: UserService, useValue: userService },
      ],
    });
    fixture = TestBed.createComponent(DeleteAccountDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('keeps the delete button disabled until DELETE is typed', () => {
    expect(component.canConfirm).toBeFalse();

    component.confirmText = 'delete';
    expect(component.canConfirm).toBeFalse();

    component.confirmText = ' DELETE ';
    expect(component.canConfirm).toBeTrue();
  });

  it('does not call the server before the confirm word is typed', () => {
    component.confirm();
    expect(userService.deleteMyAccount).not.toHaveBeenCalled();
  });

  it('sends the password and closes with true once the server deleted the account', () => {
    userService.deleteMyAccount.and.returnValue(reply(true, 'Deleted'));
    component.confirmText = 'DELETE';
    component.password = 'hunter2hunter2';

    component.confirm();

    expect(userService.deleteMyAccount).toHaveBeenCalledWith('hunter2hunter2');
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  // The backend answers 200 even when it refuses -- treating that as success would sign the user out of an
  // account that still exists.
  it('stays open and shows the reason when the server refuses with a 200', () => {
    userService.deleteMyAccount.and.returnValue(reply(false, 'You have upcoming bookings.'));
    component.confirmText = 'DELETE';

    component.confirm();

    expect(dialogRef.close).not.toHaveBeenCalled();
    expect(component.error).toBe('You have upcoming bookings.');
    expect(component.deleting).toBeFalse();
  });

  it('shows a readable error and re-enables the button on an HTTP failure', () => {
    userService.deleteMyAccount.and.returnValue(throwError(() => ({ error: { message: 'Server unavailable' } })));
    component.confirmText = 'DELETE';

    component.confirm();

    expect(dialogRef.close).not.toHaveBeenCalled();
    expect(component.error).toBe('Server unavailable');
    expect(component.canConfirm).toBeTrue();
  });

  it('cancel closes without a result', () => {
    component.cancel();
    expect(dialogRef.close).toHaveBeenCalledWith(undefined);
  });
});
