import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { take } from 'rxjs';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserService } from 'src/app/services/user.service';
import { genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-activate-account',
  templateUrl: './activate-account.component.html',
  styleUrls: ['./activate-account.component.css']
})
export class ActivateAccountComponent implements OnInit {

  activateAccountForm!: FormGroup;
  resendForm!: FormGroup;

  submitting = false;
  resending = false;
  /** True after a successful resend, so the UI can confirm without a toast that scrolls away. */
  resent = false;

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
    if (this.activateAccountForm.invalid) {
      this.activateAccountForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.ngxService.start();
    this.userService.activateAccount(this.activateAccountForm.value)
      .pipe(take(1))
      .subscribe({
        next: (response: any) => {
          this.submitting = false;
          this.ngxService.stop();
          this.activateAccountForm.reset();
          this.snackBarService.openSnackBar(response?.message || 'Account activated. You can log in now.', '');
          this.router.navigate(['/login']);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        error: (error: any) => {
          this.submitting = false;
          this.ngxService.stop();
          this.snackBarService.openSnackBar(error?.error?.message || genericError, 'error');
        },
      });
  }

  resend(): void {
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
          this.resent = true;
          this.snackBarService.openSnackBar(response?.message || 'A new code is on its way.', '');
        },
        error: (error: any) => {
          this.resending = false;
          this.snackBarService.openSnackBar(error?.error?.message || genericError, 'error');
        },
      });
  }
}
