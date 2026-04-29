import { Component, EventEmitter, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserService } from 'src/app/services/user.service';
import { Users } from 'src/app/models/users.interface';
import { emailExtensionValidator, genericError } from 'src/validators/form-validators.module';
import { Subject, takeUntil } from 'rxjs';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-update-email-modal',
  templateUrl: './update-email-modal.component.html'
})
export class UpdateEmailModalComponent implements OnInit, OnDestroy {
  updateEmailForm!: FormGroup;
  invalidForm = false;
  inputToken = false;
  responseMessage: string = '';
  userData!: Users;

  onUpdateEMail = new EventEmitter<void>();
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private snackbar: SnackBarService,
    private ngx: NgxUiLoaderService,
    private rxStomp: RxStompService,
    private auth: AuthService,
    public dialogRef: MatDialogRef<UpdateEmailModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.userData = data.userData;
  }

  ngOnInit(): void {
    this.initForm();
    this.watchEmailUpdate();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    this.updateEmailForm = this.fb.group({
      id: [this.userData.id],
      email: ['', [Validators.required, Validators.email, emailExtensionValidator(['com', 'org'])]],
      token: ['', [Validators.required, Validators.minLength(6)]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  private watchEmailUpdate() {
    this.rxStomp.watch('/topic/updateUserEmail')
      .pipe(takeUntil(this.destroy$))
      .subscribe(msg => {
        const updatedUser: Users = JSON.parse(msg.body);
        if (updatedUser.id === this.auth.getCurrentUserId()) {
          this.userService.logout();
        }
      });
  }

  validateEmail(): void {
    if (this.updateEmailForm.get('email')?.invalid) {
      this.invalidForm = true;
      this.snackbar.openSnackBar('Invalid email format', 'error');
      return;
    }

    this.ngx.start();
    this.userService.validateEmail(this.updateEmailForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.inputToken = true;
          this.invalidForm = false;
          this.ngx.stop();
          this.snackbar.openSnackBar(res?.message, '');
        },
        error: (err: any) => {
          this.ngx.stop();
          this.responseMessage = err.error?.message || genericError;
          this.snackbar.openSnackBar(this.responseMessage, 'error');
        }
      });
  }

  updateEmail(): void {
    if (this.updateEmailForm.invalid) {
      this.invalidForm = true;
      this.snackbar.openSnackBar('Invalid form', 'error');
      return;
    }

    this.ngx.start();
    this.userService.updateEmail(this.updateEmailForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.invalidForm = false;
          this.inputToken = false;
          this.ngx.stop();

          this.snackbar.openSnackBar(res?.message, '');
          this.onUpdateEMail.emit();
          this.userService.logout();

          this.dialogRef.close('Email updated successfully');
        },
        error: (err: any) => {
          this.ngx.stop();
          this.responseMessage = err.error?.message || genericError;
          this.snackbar.openSnackBar(this.responseMessage, 'error');
        }
      });
  }

  closeDialog() {
    this.dialogRef.close('Dialog closed without updating email');
  }
}
