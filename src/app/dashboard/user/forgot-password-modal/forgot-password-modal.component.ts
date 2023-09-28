import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserService } from 'src/app/services/user.service';
import { emailExtensionValidator, genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-forgot-password-modal',
  templateUrl: './forgot-password-modal.component.html',
  styleUrls: ['./forgot-password-modal.component.css']
})
export class ForgotPasswordModalComponent {
  forgotPasswordForm!: FormGroup;
  invalidForm: boolean = false;
  responseMessage: any;

  constructor(private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    public dialogRef: MatDialogRef<ForgotPasswordModalComponent>,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService) { }

  ngOnInit(): void {
    this.forgotPasswordForm = this.fb.group({
      'email': ['', Validators.compose([Validators.required, Validators.email, emailExtensionValidator(['com', 'org'])])],
    });
  }

  submitForm(): void {
    this.ngxService.start();
    if (this.forgotPasswordForm.invalid) {
      this.invalidForm = true
      this.responseMessage = "Invalid form"
    } else {
      this.userService.forgotPassword(this.forgotPasswordForm.value)
        .subscribe((response: any) => {
          this.ngxService.start();
          this.forgotPasswordForm.reset();
          this.dialogRef.close();
          this.invalidForm = false;
          this.ngxService.stop();
          this.responseMessage = response?.message;
          this.snackBarService.openSnackBar(this.responseMessage, "");
          this.router.navigate(['/login']);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        , (error: any) => {
          this.ngxService.stop();
          console.error("error");
          if (error.error?.message) {
            this.responseMessage = error.error?.message;
          } else {
            this.responseMessage = genericError;
          }
          this.snackBarService.openSnackBar(this.responseMessage, "error")
        });
    }
    this.snackBarService.openSnackBar(this.responseMessage, "error");
  }

  closeDialog() {
    this.dialogRef.close('Dialog closed without completing trainer aplication')
  }
}
