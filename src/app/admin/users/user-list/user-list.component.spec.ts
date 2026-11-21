import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { provideMockStore } from '@ngrx/store/testing';
import { NEVER, of, throwError } from 'rxjs';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { UserListComponent } from './user-list.component';
import { UserService } from 'src/app/services/user.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { RxStompService } from 'src/app/services/rx-stomp.service';

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let snackbarServiceSpy: jasmine.SpyObj<SnackBarService>;

  beforeEach(() => {
    userServiceSpy = jasmine.createSpyObj('UserService', ['updateProfilePhoto', 'removePhoto', 'updateStatus', 'deleteUser', 'sendActivationToken']);
    const ngxServiceSpy = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);
    snackbarServiceSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const rxStompServiceSpy = jasmine.createSpyObj('RxStompService', ['watch']);
    rxStompServiceSpy.watch.and.returnValue(NEVER);

    TestBed.configureTestingModule({
      declarations: [UserListComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        DatePipe,
        provideMockStore(),
        { provide: UserService, useValue: userServiceSpy },
        { provide: NgxUiLoaderService, useValue: ngxServiceSpy },
        { provide: SnackBarService, useValue: snackbarServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: RxStompService, useValue: rxStompServiceSpy }
      ]
    });
    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // GN-71: the "Email - username" column header promised both, but the row only ever rendered email.
  it('shows the username under the email, when the account has one', () => {
    component.usersData = [{ id: 7, email: 'rishab@example.com', username: 'rish_r', status: 'true' } as any];
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('@rish_r');
  });

  // SG-11: lets an admin resend the activation code directly from the Users row.
  describe('resendActivation', () => {
    beforeEach(() => {
      component.usersData = [{ id: 7, email: 'rishab@example.com', status: 'false' } as any];
    });

    it('sends the activation token to the row\'s own email', () => {
      userServiceSpy.sendActivationToken.and.returnValue(of({ message: 'Activation email sent.', success: true, statusCode: 200, data: '' }));

      component.resendActivation(7);

      expect(userServiceSpy.sendActivationToken).toHaveBeenCalledWith('rishab@example.com');
      expect(snackbarServiceSpy.openSnackBar).toHaveBeenCalledWith('Activation email sent.', '');
    });

    it('does nothing for an id that is not in the current list', () => {
      component.resendActivation(999);
      expect(userServiceSpy.sendActivationToken).not.toHaveBeenCalled();
    });

    it('shows the backend error rather than a silent failure', () => {
      userServiceSpy.sendActivationToken.and.returnValue(throwError(() => ({ error: { message: 'Too many attempts.' } })));

      component.resendActivation(7);

      expect(snackbarServiceSpy.openSnackBar).toHaveBeenCalledWith('Too many attempts.', 'error');
    });
  });
});
