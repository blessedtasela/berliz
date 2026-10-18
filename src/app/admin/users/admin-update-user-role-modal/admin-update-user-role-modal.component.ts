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
    templateUrl: './admin-update-user-role-modal.component.html',
    styleUrls: ['./admin-update-user-role-modal.component.css'],
    standalone: false
})
export class AdminUpdateUserRoleModalComponent {
  onUpdateUserRole = new EventEmitter();
  invalidForm: boolean = false;
  updateUserRoleForm!: FormGroup;
  userData: Users;
  responseMessage: any;
  submitError: string | null = null;
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
    public dialogRef: MatDialogRef<AdminUpdateUserRoleModalComponent>,
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
    this.submitError = null;
    if (this.updateUserRoleForm.invalid) {
      this.invalidForm = true
      this.updateUserRoleForm.markAllAsTouched();
      this.submitError = 'Please fill in the highlighted fields';
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
            this.submitError = error?.error?.message || genericError;
          });
    }
    this.ngxService.stop();
  }

  closeDialog() {
    this.dialogRef.close('Dialog closed without updating user\'s role')
  }

  clear() {
    this.updateUserRoleForm.reset();
  }
}