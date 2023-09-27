import { Component, EventEmitter, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserService } from 'src/app/services/user.service';
import { passwordMatchValidator, genericError } from 'src/validators/form-validators.module';
import { ResetPasswordModalComponent } from '../reset-password-modal/reset-password-modal.component';

@Component({
  selector: 'app-change-password-modal',
  templateUrl: './change-password-modal.component.html',
  styleUrls: ['./change-password-modal.component.css']
})
export class ChangePasswordModalComponent {
  onChangePassword = new EventEmitter();
  changePasswordForm!: FormGroup;
  invalidForm: boolean = false;
  responseMessage: any;

  constructor(private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    public dialogRef: MatDialogRef<ResetPasswordModalComponent>,
    public dialog: MatDialog,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    this.changePasswordForm = this.fb.group({
      'oldPassword': ['', Validators.compose([Validators.required, Validators.minLength(8)])], 
      'newPassword': ['', Validators.compose([Validators.required, Validators.minLength(8)])],
      'confirmPassword': ['', Validators.compose([Validators.required, Validators.minLength(8)])]
    }
      , { validator: passwordMatchValidator })
  }

  closeDialog(): void {
    this.dialogRef.close('Dialog closed without updating password')
  }

  submitForm(): void {
    this.ngxService.start();
    if (this.changePasswordForm.invalid) {
      this.invalidForm = true
      this.responseMessage = 'Invalid form';
    } else {
      this.userService.changePassword(this.changePasswordForm.value)
        .subscribe(
          (response: any) => {
          this.changePasswordForm.reset();
          this.dialogRef.close('Password changed successfully');
          this.invalidForm = false;
          this.ngxService.stop();
          this.responseMessage = response?.message;
          this.snackBarService.openSnackBar(this.responseMessage, "");
         this.onChangePassword.emit();
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


