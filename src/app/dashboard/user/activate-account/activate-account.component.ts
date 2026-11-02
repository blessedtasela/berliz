import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { take } from 'rxjs';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserService } from 'src/app/services/user.service';
import { genericError } from 'src/validators/form-validators.module';

/** The success answer of POST /user/activateAccount: the data says so, not just the HTTP status. */
export function isActivated(response: any): boolean {
  return typeof response?.data === 'string' && response.data.toLowerCase().includes('activated successfully');
}

@Component({
    selector: 'app-activate-account',
    templateUrl: './activate-account.component.html',
    styleUrls: ['./activate-account.component.css'],
    standalone: false
})
export class ActivateAccountComponent implements OnInit {

  activateAccountForm!: FormGroup;
  resendForm!: FormGroup;

  submitting = false;
  resending = false;
  /** True after a successful resend, so the UI can confirm without a toast that scrolls away. */
  resent = false;
  /** Inline error for the activation code form (wrong/expired code, etc.). */
  submitError: string | null = null;
  /** Inline error for the "resend code" form. */
  resendError: string | null = null;

  /** Set when arriving straight from signup (?email=...) so the page can greet the user by name instead of showing a bare, context-free code field. */
  knownEmail: string | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.activateAccountForm = this.fb.group({
      token: ['', [Validators.required, Validators.minLength(8)]],
    });

    this.knownEmail = this.route.snapshot.queryParamMap.get('email');
    this.resendForm = this.fb.group({
      email: [this.knownEmail || '', [Validators.required, Validators.email]],
    });
  }

  get tokenControl() {
    return this.activateAccountForm.get('token');
  }

  submitForm(): void {
    this.submitError = null;
    if (this.activateAccountForm.invalid) {
      this.activateAccountForm.markAllAsTouched();
      return;
    }

    // A code copied from an email often carries a space or a line break: send it clean.
    const token = String(this.activateAccountForm.value.token ?? '').replace(/\s/g, '');
    if (token.length < 8) {
      this.submitError = 'Enter the full 8-digit code from your email.';
      return;
    }

    this.submitting = true;
    this.ngxService.start();
    this.userService.activateAccount({ ...this.activateAccountForm.value, token })
      .pipe(take(1))
      .subscribe({
        next: (response: any) => {
          this.submitting = false;
          this.ngxService.stop();
          // Only the server's own "activated" answer is a success. Anything else in the data (a wrong or superseded
          // code, an older server that still answers 200) must not be shown as an activated account.
          if (!isActivated(response)) {
            this.submitError = typeof response?.data === 'string' && response.data ? response.data : genericError;
            return;
          }
          this.activateAccountForm.reset();
          this.snackBarService.openSnackBar(response?.message || 'Account activated. You can log in now.', '');
          this.router.navigate(['/login']);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        error: (error: any) => {
          this.submitting = false;
          this.ngxService.stop();
          this.submitError = error?.error?.message || genericError;
        },
      });
  }

  resend(): void {
    this.resendError = null;
    if (this.resendForm.invalid) {
      this.resendForm.markAllAsTouched();
      return;
    }

    this.resending = true;
    this.resent = false;
    this.userService.sendActivationToken(this.resendForm.value.email)
      .pipe(take(1))
      .subscribe({
        next: (response: any) => {
          this.resending = false;
          // An already-active account is told so; only a real send should say a new code is on its way.
          this.resent = response?.data !== 'ALREADY_ACTIVE';
          this.snackBarService.openSnackBar(response?.message || 'A new code is on its way.', '');
        },
        error: (error: any) => {
          this.resending = false;
          this.resendError = error?.error?.message || genericError;
        },
      });
  }
}
