import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import * as e from 'cors';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ForgotPasswordModalComponent } from 'src/app/dashboard/user/forgot-password-modal/forgot-password-modal.component';
import { Login } from 'src/app/models/users.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserService } from 'src/app/services/user.service';
import { SocialAuthService } from 'src/app/services/social-auth.service';
import { emailExtensionValidator, genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent implements AfterViewInit {
  loginForm!: FormGroup;
  loginInterface: Login | undefined;
  invalidForm: boolean = false;
  invalidLogin: string = '';
  username: string = '';
  password: string = '';
  responseMessage: any;
  /** True once the official "Sign in with Google" button has actually rendered. */
  googleReady = false;
  @ViewChild('activationEmail')
  activationEmail!: NgForm;

  constructor(private fb: FormBuilder,
    private router: Router,
    private dialog: MatDialog,
    private userService: UserService,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService,
    private socialAuthService: SocialAuthService) {
    this.invalidLogin = ''
  }

  ngAfterViewInit(): void {
    this.socialAuthService.renderGoogleButton('googleSignInButton', (idToken) => this.handleGoogleCredential(idToken))
      .then(() => { this.googleReady = true; })
      .catch(() => { this.googleReady = false; });

    // Load the Facebook SDK now, not on click — FB.login()'s popup needs to open
    // synchronously within the click handler on mobile browsers, and an unloaded
    // SDK forces an await there that breaks that chain (see preloadFacebookSdk's
    // own comment for what that looks like to the user).
    this.socialAuthService.preloadFacebookSdk();
  }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', Validators.compose([Validators.required, Validators.email, emailExtensionValidator(['com', 'org'])])],
      password: ['', Validators.compose([Validators.required, Validators.minLength(8)])],
    });

    const token = localStorage.getItem('token');

    if (token) {
      this.userService.checkToken().subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: () => {
          // token invalid/expired → clear it and stay on login
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
        }
      });
    }
  }


  get email() {
    return this.loginForm.get('email');
  }

  onEnterKey(event: any) {
    // If the focus is on the social login button, prevent the default behavior
    if (event.target instanceof HTMLButtonElement) {
      event.preventDefault();
    }
  }

  sendActivationMail(data: HTMLInputElement) {
    const email = data.value;
    const validEmail = [email, Validators.compose([Validators.email, emailExtensionValidator(['com', 'org'])])];
    if (!validEmail || email == '') {
      this.snackBarService.openSnackBar("Please enter a valid email", "error");
      return;
    }
    this.userService.sendActivationToken(email)
      .subscribe((response: any) => {
        this.ngxService.stop();
        this.responseMessage = response?.message;
        this.snackBarService.openSnackBar(this.responseMessage, "");
        this.activationEmail.reset();
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
  }


  login(): void {
    if (this.loginForm.invalid) {
      this.invalidForm = true;
      this.responseMessage = 'Invalid form';
      return;
    }

    this.ngxService.start();
    this.userService.login(this.loginForm.value)
      .subscribe({
        next: (response: any) => {
          this.ngxService.stop();

          const auth = response?.data;
          if (!auth?.accessToken) {
            // Backend responded 200 but login didn't actually succeed
            // (e.g. wrong password, unactivated account) — don't navigate.
            this.responseMessage = response?.message || genericError;
            this.snackBarService.openSnackBar(this.responseMessage, "error");
            return;
          }

          this.invalidForm = false;
          localStorage.setItem('token', auth.accessToken);
          localStorage.setItem('refresh_token', auth.refreshToken);
          this.loginInterface = auth;
          this.userService.startRefreshTokenTimer();
          this.invalidLogin = '';
          this.responseMessage = response?.message;
          this.snackBarService.openSnackBar(this.responseMessage, "");
          this.loginForm.reset();
          this.router.navigate(['/dashboard']);
        },
        error: (error: any) => {
          this.ngxService.stop();
          console.error("error");
          if (error.error?.message) {
            this.responseMessage = error.error?.message;
          } else {
            this.responseMessage = genericError;
          }
          this.snackBarService.openSnackBar(this.responseMessage, "error");
        }
      });
  }

  /** Fallback click handler shown only while Google Sign-In isn't configured yet. */
  loginWithGoogleFallback(): void {
    this.snackBarService.openSnackBar('Google login is not configured yet. Please try again later.', 'error');
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
        this.snackBarService.openSnackBar(err?.message || 'Facebook login is not configured yet.', 'error');
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

  clear() {
    this.loginForm.reset();
    this.invalidForm = false;
    this.invalidLogin = '';
    this.responseMessage = '';
  }

  openForgotPassword() {
    const dialogRef = this.dialog.open(ForgotPasswordModalComponent, {
      maxWidth: '400px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

}

