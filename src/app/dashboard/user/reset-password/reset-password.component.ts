import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserService } from 'src/app/services/user.service';
import { genericError } from 'src/validators/form-validators.module';
import { ResetPasswordModalComponent } from '../reset-password-modal/reset-password-modal.component';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {
  forgotPasswordForm!: FormGroup;
  token: any;
  responseMessage: any;

  constructor(private route: ActivatedRoute,
    private userService: UserService,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService,
    private dialog: MatDialog) { 
      this.ngxService.start();
    }

  ngOnInit(): void {
      this.route.queryParams.subscribe((params: any) => {
        const token = params.token;
         this.token = token;
         this.ngxService.stop();
         this.responseMessage = params?.messagge;
         this.snackBarService.openSnackBar(this.responseMessage, '');
         this.openPasswordResetModal();
          console.log('Password reset token:', token);
          // Call your API to reset the password with the token
        },(error: any) => {
          this.ngxService.stop();
          console.log('No valid password reset token found.');
          if (error.error?.message) {
            this.responseMessage = error.error?.message;
          } else {
            this.responseMessage = genericError;
          }
          this.snackBarService.openSnackBar(this.responseMessage, 'error');
        });
  this.snackBarService.openSnackBar(this.responseMessage, 'error');

}

  openPasswordResetModal(): void {
    this.dialog.open(ResetPasswordModalComponent, {
      width: '400px', 
      data: {
        token : this.token
      } 
    });
  }
}


