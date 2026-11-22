import { Component, Inject } from '@angular/core';
import { memoizePhotoUri, memoizeMediaUri } from 'src/app/shared/photo-lightbox/photo-data-uri';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Users } from 'src/app/models/users.interface';
import { DatePipe } from '@angular/common';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserService } from 'src/app/services/user.service';
import { AuthService } from 'src/app/services/auth.service';
import { genericError, passwordMatchValidator } from 'src/validators/form-validators.module';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import jwt_decode from 'jwt-decode';


@Component({
    selector: 'app-user-details',
    templateUrl: './user-details-modal.component.html',
    styleUrls: ['./user-details-modal.component.css'],
    standalone: false
})
export class UserDetailsModalComponent {
  userData!: Users;
  private _photoUri = memoizePhotoUri();
  /** Stable data-URI for the user's base64 profile photo. */
  get photoSrc(): string | null { return this._photoUri(this.userData?.profilePhoto); }
  responseMessage: any;
  submitError: string | null = null;
  profilePhoto: any;
  passwordForceChnageForm!: FormGroup;
  invalidForm: boolean = false;

  /** PY-32: only a super admin may override a HIGH trial-risk band (the server enforces it; this just stops the UI offering what would be refused). */
  isSuperAdmin = false;
  overridingTrialRisk = false;

  /** GN-78: only a super admin may impersonate, and never their own account (meaningless -- it's already their session). */
  impersonating = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<UserDetailsModalComponent>,
    private datePipe: DatePipe,
    private formBuilder: FormBuilder,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService,
    private userService: UserService,
    private authService: AuthService,) {
    this.userData = this.data.userData;
    this.profilePhoto = this.data.photo;
    try {
      const token = localStorage.getItem('token');
      this.isSuperAdmin = !!token && (jwt_decode(token) as any)?.superAdmin === true;
    } catch { this.isSuperAdmin = false; }
  }

  /** One line per signal that fired, for display under the risk badge. */
  get trialRiskReasonsList(): string[] {
    return (this.userData?.trialRiskReasons ?? '').split('\n').filter(r => !!r);
  }

  /** Impersonating yourself is meaningless -- it's already your own session. */
  get canImpersonate(): boolean {
    return this.isSuperAdmin
      && this.userData?.email?.toLowerCase() !== this.authService.getCurrentUserEmail()?.toLowerCase();
  }

  /**
   * GN-78: super admin only. Swaps the live session for this user's own freshly-issued tokens
   * (stashing the admin's own session first, see AuthService.startImpersonation) and does a
   * full page load rather than an Angular route change -- every NgRx slice and cached service
   * state must start clean against the new identity, not carry anything over from the admin's.
   */
  impersonateUser(): void {
    if (this.impersonating || !this.canImpersonate) return;
    this.impersonating = true;
    this.userService.impersonate(this.userData.id).subscribe({
      next: (res: any) => {
        const auth = res?.data;
        if (!auth?.accessToken) {
          this.impersonating = false;
          this.snackBarService.openSnackBar(res?.message || genericError, '');
          return;
        }
        this.authService.startImpersonation(auth.accessToken, auth.refreshToken);
        this.hardNavigateTo('/dashboard');
      },
      error: (error: any) => {
        this.impersonating = false;
        this.snackBarService.openSnackBar(error?.error?.message || genericError, '');
      }
    });
  }

  /** A thin, overridable seam around the real navigation -- real browsers refuse to let a spec stub `window.location` itself. */
  protected hardNavigateTo(url: string): void {
    window.location.href = url;
  }

  overrideTrialRisk(): void {
    if (this.overridingTrialRisk) return;
    this.overridingTrialRisk = true;
    this.userService.overrideTrialRisk(this.userData.id).subscribe({
      next: (res: any) => {
        this.overridingTrialRisk = false;
        this.snackBarService.openSnackBar(res?.data || res?.message || 'Override granted.', '');
      },
      error: (error: any) => {
        this.overridingTrialRisk = false;
        this.snackBarService.openSnackBar(error?.error?.message || genericError, '');
      }
    });
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
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }

  forcePasswordChnage(): void {
    this.submitError = null;
    if (this.passwordForceChnageForm.invalid) {
      this.invalidForm = true;
      this.passwordForceChnageForm.markAllAsTouched();
      this.submitError = 'Please fill in the highlighted fields';
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
            this.submitError = error?.error?.message || genericError;
          });
    }
  }
}