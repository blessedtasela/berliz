import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import * as e from 'cors';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { FacebookAuthProvider, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { ForgotPasswordModalComponent } from 'src/app/dashboard/user/forgot-password-modal/forgot-password-modal.component';
import { Login } from 'src/app/models/users.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserService } from 'src/app/services/user.service';
import { emailExtensionValidator, genericError } from 'src/validators/form-validators.module';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent {
  loginForm!: FormGroup;
  loginInterface: Login | undefined;
  invalidForm: boolean = false;
  invalidLogin: string = '';
  username: string = '';
  password: string = '';
  responseMessage: any;
  @ViewChild('activationEmail')
  activationEmail!: NgForm;

  constructor(private fb: FormBuilder,
    private router: Router,
    private dialog: MatDialog,
    private userService: UserService,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService,
    private auth: AuthenticationService) {
    this.invalidLogin = ''
  }

 


  ngOnInit(): void {
    this.loginForm = this.fb.group({
      'email': ['', Validators.compose([Validators.required, Validators.email, emailExtensionValidator(['com', 'org'])])],
      'password': ['', Validators.compose([Validators.required, Validators.minLength(8)])],
    });

    this.userService.checkToken().subscribe(() => {
      this.router.navigate(['/dashboard']);
    }, (error: any) => {
      console.log(error)
    })
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
    this.snackBarService.openSnackBar(this.responseMessage, "error");

  }


  login(): void {
    if (this.loginForm.invalid) {
      this.invalidForm = true;
      this.responseMessage = 'Invalid form';
      this.ngxService.stop();
    } else {
      this.ngxService.start();
      this.userService.login(this.loginForm.value)
        .subscribe((response: any) => {
          this.invalidForm = false;
          localStorage.setItem('token', response.access_token);
          localStorage.setItem('refresh_token', response.refresh_token);
          this.userService.startRefreshTokenTimer();
          // this.userService.setLoginFormIndex(0);
          // this.userService.setPartnerFormIndex(0);
          this.loginInterface = response;
          this.invalidLogin = '';
          this.invalidForm = false;
          this.responseMessage = '';
          this.ngxService.stop();
          this.responseMessage = response?.message;
          this.snackBarService.openSnackBar(this.responseMessage, "");
          this.router.navigate(['/dashboard']);
          this.loginForm.reset;
          this.ngxService.stop();
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
      this.ngxService.stop();
    }
  }

  loginWithGoogle() {
    this.snackBarService.openSnackBar("Google login not implemented yet", "error");
    const provider = new GoogleAuthProvider();
    // signInWithPopup(this.auth, provider)
    //   .then((result) => {
    //     const user = result.user;
    //     console.log('Google login success', user);
    //     this.snackBar.open('Logged in with Google!', 'Close', { duration: 3000 });
    //     this.router.navigate(['/dashboard']);
    //   })
    //   .catch((error) => {
    //     console.error('Google login error', error);
    //     this.snackBar.open('Google login failed', 'Close', { duration: 3000 });
    //   });
  }

  loginWithFacebook() {
    this.snackBarService.openSnackBar("Facebook login not implemented yet", "error");
    const provider = new FacebookAuthProvider();
    // signInWithPopup(this.auth, provider)
    //   .then((result) => {
    //     const user = result.user;
    //     console.log('Facebook login success', user);
    //     this.snackBarService.open('Logged in with Facebook!', 'Close', { duration: 3000 });
    //     this.router.navigate(['/dashboard']);
    //   })
    //   .catch((error) => {
    //     console.error('Facebook login error', error);
    //     this.snackBarService.open('Facebook login failed', 'Close', { duration: 3000 });
    //   });
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

