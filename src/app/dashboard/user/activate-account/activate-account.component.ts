import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserService } from 'src/app/services/user.service';
import { genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-activate-account',
  templateUrl: './activate-account.component.html',
  styleUrls: ['./activate-account.component.css']
})
export class ActivateAccountComponent {

  activateAccountForm!: FormGroup;
  responseMessage: any;
  invalidForm: boolean = false;

  constructor(private router: Router,
    private userService: UserService,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService,
    private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.activateAccountForm = this.fb.group({
      'token': ['', Validators.compose([Validators.required, Validators.minLength(8)])]
    })
  }


  submitForm(): void {
    this.ngxService.start();
    console.log(this.activateAccountForm.value)
    if (this.activateAccountForm.invalid) {
      this.invalidForm = true
      this.responseMessage = 'Invalid form';
      this.ngxService.stop();
    } else {
      this.userService.activateAccount(this.activateAccountForm.value)
        .subscribe(
          (response: any) => {
            this.activateAccountForm.reset();
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


