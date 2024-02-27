import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Users } from 'src/app/models/users.interface';
import { DatePipe } from '@angular/common';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserService } from 'src/app/services/user.service';
import { genericError, passwordMatchValidator } from 'src/validators/form-validators.module';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxUiLoaderService } from 'ngx-ui-loader';


@Component({
  selector: 'app-user-details',
  templateUrl: './user-details-modal.component.html',
  styleUrls: ['./user-details-modal.component.css']
})
export class UserDetailsModalComponent {
  userData!: Users;
  responseMessage: any;
  profilePhoto: any;
  passwordForceChnageForm!: FormGroup;
  invalidForm: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<UserDetailsModalComponent>,
    private datePipe: DatePipe,
    private formBuilder: FormBuilder,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService,
    private userService: UserService,) {
    this.userData = this.data.userData;
    this.profilePhoto = this.data.photo;
  }

  ngOnInit(): void {
    this.passwordForceChnageForm = this.formBuilder.group({
      'id': [this.userData.id],
      'password': ['', Validators.compose([Validators.required, Validators.minLength(8)])],
      'confirmPassword': ['', Validators.compose([Validators.required, Validators.minLength(8)])],
    },
      { validator: passwordMatchValidator });
  }

  closeDialog() {
    this.dialogRef.close("Dialog closed successfully");
  }

  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }

  forcePasswordChnage(): void {
    if (this.passwordForceChnageForm.invalid) {
      this.invalidForm = true;
      this.responseMessage = 'Invalid form';
    } else {
      this.userService.forcePasswordChange(this.userData.id, this.passwordForceChnageForm.get('password')?.value)
        .subscribe((response: any) => {
          this.ngxService.start();
          this.passwordForceChnageForm.reset();
          this.invalidForm = false;
          this.responseMessage = response?.message;
          this.snackBarService.openSnackBar(this.responseMessage, "");
          this.ngxService.stop();
          this.dialogRef.close("password force changed successfully");
          this.passwordForceChnageForm.reset;
        },
          (error: any) => {
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