import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Login } from 'src/app/models/users.interface';
import { SignupModalComponent } from '../signup-modal/signup-modal.component';
import { UserService } from 'src/app/services/user.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { emailExtensionValidator, genericError } from 'src/validators/form-validators.module';
import { ForgotPasswordModalComponent } from '../forgot-password-modal/forgot-password-modal.component';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})

export class LoginFormComponent implements OnInit {
  loginForm!: FormGroup;
  loginInterface: Login | undefined;
  invalidForm: boolean = false;
  invalidLogin: string = '';
  username: string = '';
  password: string = '';
  responseMessage: any;

  constructor(private fb: FormBuilder,
    private router: Router,
    private dialog: MatDialog,
    private userService: UserService,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService) {
    this.invalidLogin = ''
  }

  openSignup() {
    const dialogRef = this.dialog.open(SignupModalComponent, {
      width: '800px'
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }


  openForgotPassword() {
    const dialogRef = this.dialog.open(ForgotPasswordModalComponent, {
      width: '350px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }


  ngOnInit(): void {
    this.loginForm = this.fb.group({
      'email': ['', Validators.compose([Validators.required, Validators.email, emailExtensionValidator(['com', 'org'])])],
      'password': ['', Validators.compose([Validators.required, Validators.minLength(8)])],
    });

    this.userService.checkToken().subscribe((response: any) => {
      this.router.navigate(['/dashboard']);
    }, (error: any) => {
      console.log(error)
    })
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
          localStorage.setItem('token', response.token);
          this.ngxService.stop();
          this.responseMessage = response?.message;
          this.snackBarService.openSnackBar(this.responseMessage, "");
          this.router.navigate(['/dashboard']);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          this.loginForm.reset;
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

}

