import { AfterViewInit, Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ForgotPasswordModalComponent } from 'src/app/dashboard/user/forgot-password-modal/forgot-password-modal.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserService } from 'src/app/services/user.service';
import { SocialAuthService } from 'src/app/services/social-auth.service';
import { emailExtensionValidator, genericError, passwordMatchValidator } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-quick-signup',
  templateUrl: './quick-signup.component.html',
  styleUrls: ['./quick-signup.component.css']
})
export class QuickSignupComponent implements AfterViewInit {
  quickSignupForm!: FormGroup;
  invalidForm: boolean = false;
  responseMessage: any;
  /** True once the official "Sign in with Google" button has actually rendered. */
  googleReady = false;

  constructor(private fb: FormBuilder,
    private router: Router,
    private dialog: MatDialog,
    private userService: UserService,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService,
    private socialAuthService: SocialAuthService) {
  }

  ngOnInit(): void {
    this.quickSignupForm = this.fb.group({
      'email': ['', Validators.compose([Validators.required, Validators.email, emailExtensionValidator(['com', 'org'])])],
      'password': ['', Validators.compose([Validators.required, Validators.minLength(8)])],
      'confirmPassword': ['', Validators.compose([Validators.required, Validators.minLength(8)])],
    },
      { validator: passwordMatchValidator });
  }

  ngAfterViewInit(): void {
    this.socialAuthService.renderGoogleButton('googleSignUpButton', (idToken) => this.handleGoogleCredential(idToken))
      .then(() => { this.googleReady = true; })
      .catch(() => { this.googleReady = false; });
  }

  openForgotPassword() {
    const dialogRef = this.dialog.open(ForgotPasswordModalComponent, {
      width: '496px',
      maxWidth: '95vw',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  quickSignup(): void {
    if (this.quickSignupForm.invalid) {
      this.invalidForm = true;
      this.responseMessage = 'Invalid form';
      this.ngxService.stop();
    } else {
      this.ngxService.start();
      this.userService.quickAdd(this.quickSignupForm.value)
        .subscribe((response: any) => {
          this.quickSignupForm.reset();
          this.invalidForm = false;
          this.responseMessage = response?.message;
          this.snackBarService.openSnackBar(this.responseMessage, "");
          this.ngxService.stop();
          this.router.navigate(['/login']);
          this.quickSignupForm.reset;
        },
          (error: any) => {
            this.ngxService.stop();
            console.error("error");
            if (error.error?.message) {
              this.responseMessage = error.error?.message;
            } else {
              this.responseMessage = genericError;
            }
            this.snackBarService.openSnackBar(this.responseMessage, "error");
          });
      this.snackBarService.openSnackBar(this.responseMessage, "error");
    }
  }

  clear() {
    this.quickSignupForm.reset();
  }

  /** Fallback click handler shown only while Google Sign-In isn't configured yet. */
  loginWithGoogleFallback(): void {
    this.snackBarService.openSnackBar('Google sign-up is not configured yet. Please try again later.', 'error');
  }

  private handleGoogleCredential(idToken: string): void {
    this.ngxService.start();
    this.userService.loginWithGoogle(idToken).subscribe({
      next: (response: any) => this.handleSocialAuthResponse(response),
      error: (error: any) => this.handleSocialAuthError(error),
    });
  }

  loginWithFacebook(): void {
    this.socialAuthService.loginWithFacebook()
      .then((accessToken) => {
        this.ngxService.start();
        this.userService.loginWithFacebook(accessToken).subscribe({
          next: (response: any) => this.handleSocialAuthResponse(response),
          error: (error: any) => this.handleSocialAuthError(error),
        });
      })
      .catch((err: any) => {
        this.snackBarService.openSnackBar(err?.message || 'Facebook sign-up is not configured yet.', 'error');
      });
  }

  private handleSocialAuthResponse(response: any): void {
    this.ngxService.stop();
    const auth = response?.data;
    if (!auth?.accessToken) {
      this.responseMessage = response?.message || genericError;
      this.snackBarService.openSnackBar(this.responseMessage, 'error');
      return;
    }

    localStorage.setItem('token', auth.accessToken);
    localStorage.setItem('refresh_token', auth.refreshToken);
    this.userService.startRefreshTokenTimer();
    this.responseMessage = response?.message;
    this.snackBarService.openSnackBar(this.responseMessage, '');
    this.router.navigate(['/dashboard']);
  }

  private handleSocialAuthError(error: any): void {
    this.ngxService.stop();
    this.responseMessage = error.error?.message || genericError;
    this.snackBarService.openSnackBar(this.responseMessage, 'error');
  }

}

