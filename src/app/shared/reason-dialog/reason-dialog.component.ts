import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { IconsModule } from 'src/app/icons/icons.module';

export interface ReasonDialogData {
  title: string;
  message?: string;
  placeholder?: string;
  confirmText?: string;
  maxLength?: number;
}

/**
 * Asks for a short free-text reason (e.g. when reporting a post) in the app's own modal instead of a native
 * window.prompt(). Closes with the trimmed text (possibly empty -- the reason is optional), or undefined when
 * dismissed, so "cancel" and "submit with no reason" stay distinguishable.
 */
@Component({
  selector: 'app-reason-dialog',
  imports: [CommonModule, FormsModule, IconsModule],
  template: `
    <div class="p-6 flex flex-col gap-4 w-full max-w-sm">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900 flex items-center justify-center shrink-0">
          <i-feather name="flag" class="text-red-600" style="width:16px;height:16px;"></i-feather>
        </div>
        <h2 class="text-sm font-bold text-gray-900 dark:text-gray-100">{{ data.title }}</h2>
      </div>
      <p *ngIf="data.message" class="text-xs text-gray-500 dark:text-gray-400">{{ data.message }}</p>
      <textarea [(ngModel)]="reason" rows="3" [attr.maxlength]="data.maxLength || 500" [placeholder]="data.placeholder || ''"
        [attr.aria-label]="data.title"
        class="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100
               placeholder-gray-400 dark:placeholder-gray-600 resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"></textarea>
      <div class="flex gap-2 justify-end">
        <button type="button" (click)="cancel()"
          class="px-4 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition">Cancel</button>
        <button type="button" (click)="submit()"
          class="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 text-white hover:bg-red-700 active:scale-[0.98] transition">{{ data.confirmText || 'Submit' }}</button>
      </div>
    </div>
  `
})
export class ReasonDialogComponent {
  reason = '';

  constructor(
    private dialogRef: MatDialogRef<ReasonDialogComponent, string>,
    @Inject(MAT_DIALOG_DATA) public data: ReasonDialogData,
  ) { }

  cancel(): void { this.dialogRef.close(undefined); }
  submit(): void { this.dialogRef.close(this.reason.trim()); }
}
