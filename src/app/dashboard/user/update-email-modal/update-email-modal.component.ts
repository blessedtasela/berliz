import { Component, EventEmitter, Inject } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Users } from 'src/app/models/users.interface';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserService } from 'src/app/services/user.service';
import { emailExtensionValidator, genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-update-email-modal',
  templateUrl: './update-email-modal.component.html',
  styleUrls: ['./update-email-modal.component.css']
})
export class UpdateEmailModalComponent {
  onUpdateEMail = new EventEmitter();
  updateEmailForm!: FormGroup;
  invalidForm: boolean = false;
  responseMessage: any;
  userData: Users;
  inputToken: boolean = false;

  constructor(private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    public dialogRef: MatDialogRef<UpdateEmailModalComponent>,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private rxStompService: RxStompService,
    private authService: AuthenticationService) {
    this.userData = this.data.userData;
  }

  ngOnInit(): void {
    this.updateEmailForm = this.fb.group({
      'id': [this.userData.id],
      'token': ['', [Validators.required, Validators.minLength(8)]],
      'email': ['', Validators.compose([Validators.required, Validators.email, emailExtensionValidator(['com', 'org'])])],
      'password': ['', [Validators.required, Validators.minLength(8)]],

    });
  }

  validateEmail(): void {
    this.ngxService.start();
    if (this.updateEmailForm.get('email')?.invalid) {
      this.invalidForm = true
      this.responseMessage = "Invalid form"
      this.ngxService.stop();
    } else {
      this.userService.validateEmail(this.updateEmailForm.value)
        .subscribe((response: any) => {
          this.invalidForm = false;
          this.inputToken = true;
          this.ngxService.stop();
          this.responseMessage = response?.message;
          this.snackbarService.openSnackBar(this.responseMessage, "");
        }, (error: any) => {
          this.ngxService.stop();
          console.error("error");
          if (error.error?.message) {
            this.responseMessage = error.error?.message;
          } else {
            this.responseMessage = genericError;
          }
          this.snackbarService.openSnackBar(this.responseMessage, "error");
        });
    }
    this.ngxService.stop();
    this.snackbarService.openSnackBar(this.responseMessage, "error");
  }

  updateEmail(): void {
    this.ngxService.start();
    if (this.updateEmailForm.invalid) {
      this.invalidForm = true
      this.responseMessage = "Invalid form"
      this.ngxService.stop();
    } else {
      this.userService.updateEmail(this.updateEmailForm.value)
        .subscribe((response: any) => {
          this.invalidForm = false;
          this.dialogRef.close('User login updated successfully');
          this.inputToken = false;
          this.ngxService.stop();
          this.responseMessage = response?.message;
          this.snackbarService.openSnackBar(this.responseMessage, "");
          this.onUpdateEMail.emit();
          this.userService.logout();
          this.updateEmailForm.reset()
        }, (error: any) => {
          this.ngxService.stop();
          console.error("error");
          if (error.error?.message) {
            this.responseMessage = error.error?.message;
          } else {
            this.responseMessage = genericError;
          }
          this.snackbarService.openSnackBar(this.responseMessage, "error");
        });
    }
    this.ngxService.stop();
    this.snackbarService.openSnackBar(this.responseMessage, "error");
  }

  closeDialog() {
    this.dialogRef.close('Dialog closed without updating account')
  }

  watchUpdateUserEmail() {
    this.rxStompService.watch('/topic/updateUserEmail').subscribe((message) => {
      const receivedUser: Users = JSON.parse(message.body);
      const email = this.authService.getCurrentUserId();
      if (email === receivedUser.id) {
        this.userService.logout()
      }
    });
  }
}
