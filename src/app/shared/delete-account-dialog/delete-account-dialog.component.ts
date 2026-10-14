import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

import { IconsModule } from 'src/app/icons/icons.module';
import { UserService } from 'src/app/services/user.service';
import { genericError } from 'src/validators/form-validators.module';

export const DELETE_CONFIRM_WORD = 'DELETE';

/**
 * Permanent account deletion. Closes with `true` once the server has actually deleted the account, so the caller can
 * sign the user out; closes with `undefined` when dismissed. The server answers 200 even when it refuses (wrong
 * password, upcoming bookings, renewing subscription), so its reason is shown here instead of closing the dialog.
 */
@Component({
  selector: 'app-delete-account-dialog',
  imports: [CommonModule, FormsModule, IconsModule],
  template: `
    <div class="p-6 flex flex-col gap-4 w-full max-w-sm">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900 flex items-center justify-center shrink-0">
          <i-feather name="trash-2" class="text-red-600" style="width:16px;height:16px;"></i-feather>
        </div>
        <h2 class="text-sm font-bold text-gray-900 dark:text-gray-100">Delete your account</h2>
      </div>

      <p class="text-xs text-gray-500 dark:text-gray-400">
        This permanently removes your profile, posts, messages and other personal data. It can't be undone.
        Records we must keep by law (such as payment history) are kept without your personal details.
      </p>

      <label class="flex flex-col gap-1.5">
        <span class="text-[11px] font-semibold text-gray-600 dark:text-gray-400">Password</span>
        <input type="password" [(ngModel)]="password" name="password" autocomplete="current-password" aria-label="Password"
          class="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100
                 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition" />
        <span class="text-[11px] text-gray-400 dark:text-gray-500">Signed in with Google, Facebook or Apple? Leave it blank.</span>
      </label>

      <label class="flex flex-col gap-1.5">
        <span class="text-[11px] font-semibold text-gray-600 dark:text-gray-400">Type {{ confirmWord }} to confirm</span>
        <input type="text" [(ngModel)]="confirmText" name="confirmText" autocomplete="off" aria-label="Type DELETE to confirm"
          class="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100
                 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition" />
      </label>

      <p *ngIf="error" role="alert" class="text-[11px] text-red-600 flex items-start gap-1.5">
        <i-feather name="alert-circle" class="shrink-0 mt-0.5" style="width:11px;height:11px;"></i-feather>
        {{ error }}
      </p>

      <div class="flex gap-2 justify-end">
        <button type="button" (click)="cancel()" [disabled]="deleting"
          class="px-4 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50">Cancel</button>
        <button type="button" (click)="confirm()" [disabled]="!canConfirm"
          class="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 text-white hover:bg-red-700 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100">
          {{ deleting ? 'Deleting…' : 'Delete my account' }}
        </button>
      </div>
    </div>
  `
})
export class DeleteAccountDialogComponent {
  readonly confirmWord = DELETE_CONFIRM_WORD;

  password = '';
  confirmText = '';
  deleting = false;
  error: string | null = null;

  constructor(
    private dialogRef: MatDialogRef<DeleteAccountDialogComponent, boolean>,
    private userService: UserService,
  ) { }

  get canConfirm(): boolean {
    return !this.deleting && this.confirmText.trim() === DELETE_CONFIRM_WORD;
  }

  cancel(): void {
    if (this.deleting) return;
    this.dialogRef.close(undefined);
  }

  confirm(): void {
    if (!this.canConfirm) return;
    this.deleting = true;
    this.error = null;

    this.userService.deleteMyAccount(this.password).subscribe({
      next: res => {
        if (!res.success || !res.data?.deleted) {
          this.error = res.data?.message || res.message || 'Could not delete your account.';
          this.deleting = false;
          return;
        }
        this.dialogRef.close(true);
      },
      error: err => {
        this.error = err?.error?.message || genericError;
        this.deleting = false;
      },
    });
  }
}
