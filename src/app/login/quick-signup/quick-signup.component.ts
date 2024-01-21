import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ForgotPasswordModalComponent } from 'src/app/dashboard/user/forgot-password-modal/forgot-password-modal.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserService } from 'src/app/services/user.service';
import { emailExtensionValidator, genericError, passwordMatchValidator } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-quick-signup',
  templateUrl: './quick-signup.component.html',
  styleUrls: ['./quick-signup.component.css']
})
export class QuickSignupComponent {
  quickSignupForm!: FormGroup;
  invalidForm: boolean = false;
  responseMessage: any;

  constructor(private fb: FormBuilder,
    private router: Router,
    private dialog: MatDialog,
    private userService: UserService,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService) {
  }

  ngOnInit(): void {
    this.quickSignupForm = this.fb.group({
      'email': ['', Validators.compose([Validators.required, Validators.email, emailExtensionValidator(['com', 'org'])])],
      'password': ['', Validators.compose([Validators.required, Validators.minLength(8)])],
      'confirmPassword': ['', Validators.compose([Validators.required, Validators.minLength(8)])],
    },
      { validator: passwordMatchValidator });
  }

  openForgotPassword() {
    const dialogRef = this.dialog.open(ForgotPasswordModalComponent, {
      width: '600px',
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

}

