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

  // GN-85: a deleted (self-service-scrubbed) account must never look like, or act like, a live one.
  describe('a deleted account', () => {
    beforeEach(() => {
      component.usersData = [{ id: 433, firstname: 'Deleted', lastname: 'User', email: 'deleted-433@deleted.berliz.fitness', status: 'false', deletedAt: '2026-11-20T00:00:00Z' } as any];
      fixture.detectChanges();
    });

    it('renders "Deleted account" instead of the scrubbed name', () => {
      expect(fixture.nativeElement.textContent).toContain('Deleted account');
    });

    it('offers no Activate, Resend, Edit or Delete controls', () => {
      const text: string = fixture.nativeElement.textContent;
      expect(text).not.toContain('Activate');
      expect(text).not.toContain('Resend activation');
      expect(fixture.nativeElement.querySelector('[title="Edit"]')).toBeNull();
      expect(fixture.nativeElement.querySelector('[title="Delete"]')).toBeNull();
      expect(fixture.nativeElement.querySelector('[title="View"]')).toBeNull();
      expect(fixture.nativeElement.querySelector('[title="Edit role"]')).toBeNull();
    });
  });

  describe('a live account, for comparison', () => {
    beforeEach(() => {
      component.usersData = [{ id: 7, firstname: 'Rishab', lastname: 'Rohilla', email: 'rishab@example.com', status: 'true' } as any];
      fixture.detectChanges();
    });

    it('still shows its real name and the normal row actions', () => {
      const text: string = fixture.nativeElement.textContent;
      expect(text).toContain('Rishab');
      expect(text).not.toContain('Deleted account');
      expect(fixture.nativeElement.querySelector('[title="Delete"]')).not.toBeNull();
    });
  });
});
