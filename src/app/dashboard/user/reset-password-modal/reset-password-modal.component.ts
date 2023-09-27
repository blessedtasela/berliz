import { Component, Inject  } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserService } from 'src/app/services/user.service';
import { genericError, passwordMatchValidator } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-reset-password-modal',
  templateUrl: './reset-password-modal.component.html',
  styleUrls: ['./reset-password-modal.component.css']
})
export class ResetPasswordModalComponent {
  resetPasswordForm!: FormGroup;
  invalidForm: boolean = false;
  responseMessage: any;
  dataPassword: any;

  constructor(private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    public dialogRef: MatDialogRef<ResetPasswordModalComponent>,
    public dialog: MatDialog,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    this.resetPasswordForm = this.fb.group({
      'token': this.data.token, 
      'password': ['', Validators.compose([Validators.required, Validators.minLength(8)])],
      'confirmPassword': ['', Validators.compose([Validators.required, Validators.minLength(8)])]
    }
      , { validator: passwordMatchValidator })
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  submitForm(): void {
    this.ngxService.start();
    if (this.resetPasswordForm.invalid) {
      this.invalidForm = true
      this.responseMessage = 'Invalid form';
    } else {
      this.userService.resetPassword(this.resetPasswordForm.value)
        .subscribe(
          (response: any) => {
          this.resetPasswordForm.reset();
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
          this.snackBarService.openSnackBar(this.responseMessage, 'error');
        });
    }
    this.snackBarService.openSnackBar(this.responseMessage, "error");
  }
  
}

