import { Component, EventEmitter, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Role, Users } from 'src/app/models/users.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { genericError } from 'src/validators/form-validators.module';
import { UserService } from 'src/app/services/user.service';
import jwt_decode from 'jwt-decode';

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

  /**
   * Only the super admin may make or remove an admin, or change an admin's role (the server enforces it; this just
   * stops the UI offering what would be refused). The token carries a `superAdmin` hint.
   */
  isSuperAdmin = false;

  constructor(private formBuilder: FormBuilder,
    private userService: UserService,
    public dialogRef: MatDialogRef<AdminUpdateUserRoleModalComponent>,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.userData = this.data.userData;
    try {
      const token = localStorage.getItem('token');
      this.isSuperAdmin = !!token && (jwt_decode(token) as any)?.superAdmin === true;
    } catch { this.isSuperAdmin = false; }
    if (!this.isSuperAdmin) this.roles = this.roles.filter(r => r.role !== 'admin');
  }

  /** An admin account's role is the super admin's to change. */
  get locked(): boolean {
    return this.userData?.role === 'admin' && !this.isSuperAdmin;
  }


  ngOnInit(): void {
    this.updateUserRoleForm = this.formBuilder.group({
      'id': new FormControl(this.userData.id, Validators.required),
      'role': new FormControl(this.userData.role, Validators.required),
    });
  }

  updateUserRole(): void {
    if (this.locked) return;
    this.ngxService.start();
    if (this.updateUserRoleForm.invalid) {
      this.invalidForm = true
      this.responseMessage = "Invalid form"
      this.ngxService.stop();
      this.snackbarService.openSnackBar(this.responseMessage, "error");
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
  }

  closeDialog() {
    this.dialogRef.close('Dialog closed without updating user\'s role')
  }

  clear() {
    this.updateUserRoleForm.reset();
  }
}