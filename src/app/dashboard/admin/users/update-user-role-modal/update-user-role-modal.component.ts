import { Component, EventEmitter, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Role, Users } from 'src/app/models/users.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { genericError } from 'src/validators/form-validators.module';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-update-user-role-modal',
  templateUrl: './update-user-role-modal.component.html',
  styleUrls: ['./update-user-role-modal.component.css']
})
export class UpdateUserRoleModalComponent {
  onUpdateUserRole = new EventEmitter();
  invalidForm: boolean = false;
  updateUserRoleForm!: FormGroup;
  userData: Users;
  responseMessage: any;
  roles: Role[] = [{
    id: 1, role: 'admin'
  }, {
    id: 2, role: 'user'
  }, {
    id: 3, role: 'client'
  }, {
    id: 4, role: 'partner'
  }, {
    id: 5, role: 'store'
  }, {
    id: 6, role: 'center'
  }, {
    id: 7, role: 'trainer'
  }, {
    id: 8, role: 'driver'
  },]

  constructor(private formBuilder: FormBuilder,
    private userService: UserService,
    public dialogRef: MatDialogRef<UpdateUserRoleModalComponent>,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.userData = this.data.userData;
  }


  ngOnInit(): void {
    this.updateUserRoleForm = this.formBuilder.group({
      'id': new FormControl(this.userData.id, Validators.required),
      'role': new FormControl(this.userData.role, Validators.required),
    });
  }

  updateUserRole(): void {
    this.ngxService.start();
    if (this.updateUserRoleForm.invalid) {
      this.invalidForm = true
      this.responseMessage = "Invalid form"
      this.ngxService.stop();
    } else {
      this.userService.updateUserRole(this.updateUserRoleForm.value)
        .subscribe((response: any) => {
          this.updateUserRoleForm.reset();
          this.invalidForm = false;
          this.responseMessage = response?.message;
          this.dialogRef.close('User role updated successfully');
          this.snackbarService.openSnackBar(this.responseMessage, "");
          this.ngxService.stop();
         this.dialogRef.close('User role updated successfully')
          this.onUpdateUserRole.emit()
        }
          , (error: any) => {
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
    this.dialogRef.close('Dialog closed without updating user\'s role')
  }

  clear() {
    this.updateUserRoleForm.reset();
  }
}
