import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AccountService } from 'src/app/services/account.service';
import { AuthService } from 'src/app/services/auth.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { genericError } from 'src/validators/form-validators.module';

/**
 * "Delete my account" -- the web counterpart of the mobile app's delete-account screen (an App Store
 * requirement there, and the same right on the web). The server scrubs every personal field and deactivates the
 * account; bookings and payment records stay for the other party and the books.
 *
 * It can refuse with HTTP 200 and `success: false` (upcoming bookings, a subscription that still renews, a wrong
 * password, an admin account, ...). That reason is shown right here in the dialog -- the person is in the middle of
 * deciding, and a toast that vanishes is no place for "cancel your subscription first".
 */
@Component({
  selector: 'app-delete-account-modal',
  templateUrl: './delete-account-modal.component.html',
  standalone: false
})
export class DeleteAccountModalComponent {
  /** The word to type before the delete button unlocks -- a deliberate speed bump on something irreversible. */
  readonly confirmWord = 'DELETE';

  password = '';
  confirmText = '';
  submitting = false;
  /** Why the server refused, or why the call failed. Null until something goes wrong. */
  problem: string | null = null;

  constructor(
    private accountService: AccountService,
    private auth: AuthService,
    private snackbar: SnackBarService,
    private router: Router,
    public dialogRef: MatDialogRef<DeleteAccountModalComponent>
  ) { }

  get canSubmit(): boolean {
    return !this.submitting && this.confirmText.trim().toUpperCase() === this.confirmWord;
  }

  closeDialog(): void {
    if (!this.submitting) this.dialogRef.close(false);
  }

  submit(): void {
    if (!this.canSubmit) return;
    this.submitting = true;
    this.problem = null;

    this.accountService.deleteMyAccount(this.password).subscribe({
      next: res => {
        this.submitting = false;
        if (res.success && res.data?.deleted) {
          // The session belongs to a deleted account now: drop it and leave the signed-in area.
          this.auth.clearTokens();
          this.dialogRef.close(true);
          this.snackbar.openSnackBar(res.message || 'Your account has been deleted.', '');
          this.router.navigate(['/home']);
          return;
        }
        this.problem = res.data?.message || res.message || 'Your account could not be deleted.';
      },
      error: err => {
        this.submitting = false;
        this.problem = err?.error?.message || genericError;
      }
    });
  }
}
